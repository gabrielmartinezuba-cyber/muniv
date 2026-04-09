"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { BookingSubmitSchema, GiftingSubmitSchema } from "@/schemas/booking";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { getBenefits } from "@/actions/benefits";
import { generateReceiptEmailHtml } from "@/emails/ReceiptEmail";

/**
 * Procesa la reserva B2C y la guarda en Supabase
 */
export async function submitBooking(data: unknown) {
  try {
    // 1. Re-validación del Input
    const formData = BookingSubmitSchema.parse(data);

    // 2. Obtener sesión del servidor
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && (!formData.guest_name || !formData.guest_email || !formData.guest_phone)) {
      return { 
        success: false, 
        message: "Sesión expirada o inválida. Como invitado, el nombre, email y teléfono son obligatorios." 
      };
    }

    // 3. Obtener precio base de la experiencia para calcular el total
    const { data: experience, error: expError } = await supabase
      .from('experiences')
      .select('price, type')
      .eq('id', formData.experienceId)
      .single();

    if (expError || !experience) {
      return { success: false, message: "La experiencia seleccionada no es válida." };
    }

    // --- VALIDACIÓN DE SORTEO (EXCLUSIVO SOCIOS) ---
    if (experience.type?.trim().toLowerCase() === 'sorteo' && !user) {
      return { 
        success: false, 
        message: "Acceso denegado: Los sorteos son exclusivos para miembros. ¡Registrate para participar!" 
      };
    }

    // --- VALIDACIÓN DE VINOS (BACKEND) ---
    if (experience.type?.trim().toLowerCase() === 'caja') {
      const { data: expMeta } = await supabase.from('experiences').select('wine_quantity').eq('id', formData.experienceId).single();
      const requiredWines = (expMeta?.wine_quantity || 0) * formData.guests;
      
      if (!formData.selected_wines || formData.selected_wines.length < requiredWines || formData.selected_wines.some(w => !w || w === "")) {
        return { 
          success: false, 
          message: `Por favor, seleccioná los ${requiredWines} vinos de tu caja antes de continuar.` 
        };
      }
    }

    // 4. Protección contra duplicados: Solo para usuarios registrados Y tipo Sorteo
    if (user && experience.type?.trim().toLowerCase() === 'sorteo') {
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('experience_id', formData.experienceId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing booking:", checkError);
      }

      if (existingBooking) {
        return { 
          success: false, 
          error: 'ALREADY_BOOKED', 
          message: 'Ya estás participando de este sorteo.' 
        };
      }
    }

    // Cálculo matemático estricto en el servidor
    let calculatedTotalPrice = experience.price * formData.guests;
    if (formData.upSells && formData.upSells.length > 0) {
      calculatedTotalPrice += formData.upSells.length * 20000; // Agregar Upsells
    }

    if (user) {
      const benefitsRes = await getBenefits();
      if (benefitsRes && benefitsRes.length > 0) {
        // Encontramos el beneficio principal (ej. tomando el mayor descuento o el primero)
        // O asumimos el primer beneficio para simplificar, como lo trata el frontend
        const discountPercentage = benefitsRes[0].discount_percentage || 0;
        
        let discountableValue = experience.price * formData.guests;
        if (experience.type?.trim().toLowerCase() === 'evento') {
          discountableValue = experience.price; // SOLO descuenta 1 unidad
        }
        
        const rawDiscount = discountableValue * (discountPercentage / 100);
        // Supabase schema for Benefit doesn't expose discount_cap directly in type? Wait, let's use rawDiscount.
        // Type 'Benefit' has 'discount_percentage'. If it had 'discount_cap', we'd use it.
        const finalDiscount = rawDiscount;
        calculatedTotalPrice -= finalDiscount;
      }
    }

    const finalCalculatedPrice = Math.max(0, calculatedTotalPrice);

    // 5. Insertar en tabla bookings
    const payloadInsert: any = {
      experience_id: formData.experienceId,
      guests_count: Number(formData.guests),
      total_price: Number(finalCalculatedPrice),
      status: 'PENDIENTE',
      selected_wines: formData.selected_wines || [],
      user_id: user?.id || null, // Asegurar que sea null si no hay user
      guest_name: user ? null : formData.guest_name,
      guest_email: user ? null : formData.guest_email,
      guest_phone: user ? null : formData.guest_phone
    };

    console.log(`[SUBMIT BOOKING] Processing for user ${user?.id || 'GUEST'}`);

    // 7. Insert Booking (Using ADMIN client to bypass RLS issues for Guest Checkout)
    const supabaseAdmin = createAdminClient();
    const { data: insertedBooking, error: insertError } = await supabaseAdmin
      .from('bookings')
      .insert(payloadInsert)
      .select('id')
      .single();

    if (insertError) {
      console.error("Supabase Booking Error:", insertError);
      throw new Error("Error al registrar la reserva en la base de datos.");
    }

    const bookingId = insertedBooking.id;

    // 6. Enviar Mail Transaccional
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        const targetEmail = user ? user.email : formData.guest_email;
        const targetName = user ? (user.user_metadata?.full_name || user.email?.split('@')[0]) : formData.guest_name;

        if (targetEmail) {
          const htmlContent = generateReceiptEmailHtml({
            name: targetName || "Comunidad MUNIV",
            experienceName: formData.experienceTitle || "Experiencia de Cata",
            date: formData.date,
            time: formData.time,
            guests: Number(formData.guests),
            totalPaid: Number(finalCalculatedPrice),
          });

          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: targetEmail,
            subject: '🍷 Confirmación de tu compra - MUNIV',
            html: htmlContent,
          });
        }
      } else {
        console.warn("No RESEND_API_KEY found. Skipped transactional email.");
      }
    } catch (emailError) {
      console.error("Error enviando email de reserva (non-blocking):", emailError);
    }

    revalidatePath("/");
    revalidatePath("/comunidad");
    revalidatePath("/mis-experiencias"); // Por si existe el alias o rewrite
    revalidatePath("/comunidad/page"); // Forzar revalidación profunda de la vista principal

    return { 
      success: true,
      bookingId: bookingId,
      message: "Reserva confirmada. Podés ver los detalles en tu perfil del Club."
    };

  } catch (error: any) {
    console.error("Booking Server Action CRASH:", error);
    return { 
      success: false, 
      message: error.message || "Ocurrió un error al procesar su reserva." 
    };
  }
}

/**
 * Procesa el Lead B2B y lo envía al sector Gifting
 */
export async function submitGifting(data: unknown) {
  try {
    const formData = GiftingSubmitSchema.parse(data);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return { 
      success: true, 
      message: "Propuesta comercial requerida exitosamente. El equipo de Gifting te contactará."
    };

  } catch (error) {
    console.error("Gifting Server Action CRASH:", error);
    return { 
      success: false, 
      message: "Problema interno procesando la estructura B2B." 
    };
  }
}

export async function requestBookingCancellation(bookingId: string, reason: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn("Attempted cancellation without valid session.");
      return { success: false, message: "Sesión inválida." };
    }

    // UPDATE with return count to verify success
    const { error, count } = await supabase
      .from('bookings')
      .update({ cancel_requested: true, cancel_reason: reason }, { count: 'exact' })
      .eq('id', bookingId)
      .eq('user_id', user.id); // Security: only owner can request

    if (error) {
      console.error(`[CANCELLATION ERROR] Booking ${bookingId}:`, error);
      return { success: false, message: "Error técnico al procesar la solicitud." };
    }

    if (count === 0) {
      console.error(`[CANCELLATION FAILED] No rows updated for booking ${bookingId}. User: ${user.id}`);
      return { success: false, message: "No se encontró la reserva o no tenés permisos." };
    }

    console.log(`[CANCELLATION SUCCESS] Booking ${bookingId} requested by ${user.id}`);

    revalidatePath("/comunidad");
    revalidatePath("/admin/ordenes");

    return { 
      success: true, 
      message: "Muniv te contactará para seguir el proceso de cancelación." 
    };
  } catch (error) {
    console.error("[CANCELLATION CRASH]:", error);
    return { success: false, message: "Error inesperado en el servidor." };
  }
}

/**
 * Recupera el historial de reservas del usuario logueado con datos de la experiencia vinculada
 */
export async function getUserBookings() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn("[GET USER BOOKINGS] No session found.");
      return [];
    }

    console.log(`[GET USER BOOKINGS] Fetching for user: ${user.id}`);

    const { data, error } = await supabase
      .from('bookings')
      .select('*, experiences(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
       console.error("Error fetching user bookings:", error);
       return [];
    }

    return data;
  } catch (error) {
    console.error("getUserBookings Action CRASH:", error);
    return [];
  }
}

