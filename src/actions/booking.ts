"use server";

import { createClient } from "@/utils/supabase/server";
import { BookingSubmitSchema, GiftingSubmitSchema } from "@/schemas/booking";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
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

    if (!user && (!formData.guest_name || !formData.guest_email)) {
      return { 
        success: false, 
        message: "Sesión expirada o inválida. Por favor, iniciá sesión o ingresá tus datos como invitado." 
      };
    }

    // 3. Obtener precio base de la experiencia para calcular el total
    const { data: experience, error: expError } = await supabase
      .from('experiences')
      .select('price')
      .eq('id', formData.experienceId)
      .single();

    if (expError || !experience) {
      return { success: false, message: "La experiencia seleccionada no es válida." };
    }

    // 4. Protección contra duplicados: Solo para usuarios registrados
    if (user) {
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
          message: 'Ya estás participando de este sorteo o experiencia.' 
        };
      }
    }

    // Cálculo del precio final
    const totalPrice = formData.final_price !== undefined 
      ? formData.final_price 
      : (experience.price * formData.guests);

    // 5. Insertar en tabla bookings
    const payloadInsert: any = {
      experience_id: formData.experienceId,
      guests_count: Number(formData.guests),
      total_price: Number(totalPrice),
      status: 'CONFIRMED'
    };

    if (user) {
      payloadInsert.user_id = user.id;
    } else {
      payloadInsert.guest_name = formData.guest_name;
      payloadInsert.guest_email = formData.guest_email;
    }

    const { error: insertError } = await supabase
      .from('bookings')
      .insert(payloadInsert);

    if (insertError) {
      console.error("Supabase Booking Error:", insertError);
      throw new Error("Error al registrar la reserva en la base de datos.");
    }

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
            totalPaid: Number(totalPrice),
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

    return { 
      success: true, 
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

/**
 * Recupera el historial de reservas del usuario logueado con datos de la experiencia vinculada
 */
export async function getUserBookings() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

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

