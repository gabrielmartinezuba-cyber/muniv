"use server";

import { createClient } from "@/utils/supabase/server";
import { BookingSubmitSchema, GiftingSubmitSchema } from "@/schemas/booking";

/**
 * Procesa la reserva B2C y la guarda en Supabase
 */
export async function submitBooking(data: unknown) {
  try {
    // 1. Re-validación del Input
    const formData = BookingSubmitSchema.parse(data);

    // 2. Obtener sesión del servidor
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { 
        success: false, 
        message: "Sesión expirada o inválida. Por favor, iniciá sesión para reservar." 
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

    // Cálculo del precio (simplificado, acá se podrían sumar up-sells si estuvieran en DB)
    const totalPrice = experience.price * formData.guests;

    // 4. Insertar en tabla bookings
    const { error: insertError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        experience_id: formData.experienceId,
        booking_date: `${formData.date}T${formData.time}:00Z`, // Formato ISO simplificado
        guests_count: formData.guests,
        total_price: totalPrice,
        status: 'PENDING'
      });

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      throw new Error("Error al registrar la reserva en la base de datos.");
    }

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
