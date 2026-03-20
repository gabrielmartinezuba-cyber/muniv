"use server";

import { BookingSubmitSchema, GiftingSubmitSchema } from "@/schemas/booking";

/**
 * Procesa la venta B2C y la envía a un CRM simulado
 */
export async function submitBooking(data: unknown) {
  try {
    // 1. Re-validación del Input del Cliente con Zod (Jamás confiar ciegamente en el Front)
    const formData = BookingSubmitSchema.parse(data);

    // 2. Definición del Webhook (Acá el Product Owner debe inyectar el Make/Zapier/Airtable real)
    const CRM_WEBHOOK_URL = "https://hook.us1.make.com/muniv-b2c-webhook"; 
    
    // Simulación del Fetch POST al CRM
    /*
    const response = await fetch(CRM_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Error en el pasarela de CRM: ${response.status}`);
    }
    */

    // Simulamos latencia artificial de 2 segundos para dar feedback visual premium
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. Respuesta de éxito
    return { 
      success: true, 
      message: "Reserva confirmada. Su agenda y la del Sommelier han sido notificadas."
    };

  } catch (error) {
    console.error("Booking Server Action CRASH:", error);
    // En caso de Zod Error o Fetch Error:
    return { 
      success: false, 
      message: "Ocurrió un error al despachar su reserva. Intente de nuevo o comuníquese a soporte." 
    };
  }
}

/**
 * Procesa el Lead B2B y lo envía al sector Gifting
 */
export async function submitGifting(data: unknown) {
  try {
    const formData = GiftingSubmitSchema.parse(data);

    const B2B_WEBHOOK_URL = "https://hook.us1.make.com/muniv-b2b-webhook"; 
    
    // Simulación del Fetch
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return { 
      success: true, 
      message: "Propuesta comercial requerida exitosamente."
    };

  } catch (error) {
    console.error("Gifting Server Action CRASH:", error);
    return { 
      success: false, 
      message: "Hemos tenido un problema interno procesando la estructura B2B. Re-intente en breve." 
    };
  }
}

