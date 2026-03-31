"use server";

import { MercadoPagoConfig, Preference } from 'mercadopago';

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
          success: `${siteUrl}/comunidad`,
          failure: `${siteUrl}/comunidad`,
          pending: `${siteUrl}/comunidad`
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
