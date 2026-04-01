"use server";

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function createCheckoutPreference(bookingIds: string[], itemsTitle: string, totalAmount: number) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("Mercado Pago no está configurado (MP_ACCESS_TOKEN faltante).");
    }

    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
    const preference = new Preference(client);

    const title = itemsTitle.length > 200 ? itemsTitle.substring(0, 197) + '...' : itemsTitle;
    const externalReference = bookingIds.join(',');

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Only configure webhook if not localhost, to prevent MP validation errors
    const isLocalhost = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');
    const notificationUrl = isLocalhost ? undefined : `${siteUrl}/api/webhooks/mercadopago`;

    const response = await preference.create({
      body: {
        items: [
          {
            id: 'MUNIV-EXP',
            title: title || 'Experiencia MUNIV',
            quantity: 1,
            unit_price: Number(totalAmount),
            currency_id: 'ARS',
          }
        ],
        external_reference: externalReference,
        back_urls: {
          success: `${siteUrl}/checkout/feedback`,
          failure: `${siteUrl}/checkout/feedback`,
          pending: `${siteUrl}/checkout/feedback`
        },
        auto_return: "approved",
        notification_url: notificationUrl
      }
    });

    return {
      success: true,
      init_point: process.env.NODE_ENV === 'production' && response.init_point ? response.init_point : (response.sandbox_init_point || response.init_point)
    };
  } catch (error: any) {
    console.error("Error creating Mercado Pago preference:", error);
    return {
      success: false,
      message: error.message || "Error al conectar con la pasarela de pago."
    };
  }
}

export async function retryPayment(bookingId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "No estás autenticado o la sesión expiró." };
    }

    // Buscar el booking y verificar propiedad
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .select('*, experiences(title)')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single();

    if (dbError || !booking) {
      return { success: false, message: "Reserva no encontrada o no te pertenece." };
    }

    if (booking.status !== 'PENDIENTE') {
      return { success: false, message: "Solo podés reintentar el pago de órdenes pendientes." };
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("Mercado Pago no está configurado.");
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const isLocalhost = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');
    const notificationUrl = isLocalhost ? undefined : `${siteUrl}/api/webhooks/mercadopago`;

    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
    const preference = new Preference(client);

    const title = booking.experiences?.title || "Reserva MUNIV";
    const cleanTitle = title.length > 200 ? title.substring(0, 197) + '...' : title;

    const response = await preference.create({
      body: {
        items: [
          {
            id: 'MUNIV-EXP',
            title: cleanTitle,
            quantity: 1,
            unit_price: Number(booking.total_price),
            currency_id: 'ARS',
          }
        ],
        external_reference: bookingId,
        back_urls: {
          success: `${siteUrl}/checkout/feedback`,
          failure: `${siteUrl}/checkout/feedback`,
          pending: `${siteUrl}/checkout/feedback`
        },
        auto_return: "approved",
        notification_url: notificationUrl
      }
    });

    return {
      success: true,
      init_point: process.env.NODE_ENV === 'production' && response.init_point ? response.init_point : (response.sandbox_init_point || response.init_point)
    };

  } catch (error: any) {
    console.error("Error en retryPayment:", error);
    return {
      success: false,
      message: error.message || "Error al intentar generar un nuevo link de pago."
    };
  }
}

export async function checkPaymentStatus(paymentId: string) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) throw new Error("MP_ACCESS_TOKEN token missing");

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status === 'approved' && paymentData.external_reference) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey);

      const bookingIds = paymentData.external_reference.split(',');
      for (const id of bookingIds) {
        if (id.trim()) {
           await supabaseAdmin
            .from('bookings')
            .update({ status: 'PAGADO' })
            .eq('id', id.trim());
        }
      }
      return { success: true, status: 'approved' };
    }

    return { success: true, status: paymentData.status };
  } catch (error: any) {
    console.error(`[CHECK_PAYMENT] Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}
