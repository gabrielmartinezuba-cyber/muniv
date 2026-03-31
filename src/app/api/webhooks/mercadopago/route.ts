import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // 1. Obtener y parsear el payload
    const body = await req.json();

    // Mercado Pago envía varios tipos de notificaciones. Nos interesa 'payment'
    // 'type' maneja webhooks v1 y 'topic' maneja IPNs.
    const action = body.action || body.topic || body.type;
    const isPaymentEvent = action === 'payment.created' || action === 'payment.updated' || action === 'payment';

    if (!isPaymentEvent) {
      // Ignoramos eventos que no sean de pago (ej. merchant_order)
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id || body.resource?.split('/').pop();
    
    if (!paymentId) {
      return NextResponse.json({ error: 'No payment ID provided' }, { status: 400 });
    }

    // 2. Verificación Segura: Consultar API de Mercado Pago
    // Esto evita ataques de spoofing porque validamos directamente con el servidor de MP
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("Mercado Pago token missing");
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status === 'approved') {
      const externalReference = paymentData.external_reference;
      
      if (!externalReference) {
         console.warn(`[WEBHOOK] Pago aprobado pero sin external_reference. ID: ${paymentId}`);
         return NextResponse.json({ received: true });
      }

      // 3. Conexión a Supabase (Admin Client)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Obligatorio para Webhooks
      
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      // Soportamos múltiples IDs separados por coma
      const bookingIds = externalReference.split(',');

      for (const bookingId of bookingIds) {
        if (!bookingId.trim()) continue;
        
        // Determinar el nuevo estado basado en el tipo de experiencia
        const { data: bookingDetails } = await supabaseAdmin
          .from('bookings')
          .select('id, experiences(type)')
          .eq('id', bookingId.trim())
          .single();

        let newStatus = 'CONFIRMADO';
        if (bookingDetails?.experiences?.type?.trim().toLowerCase() === 'caja') {
          newStatus = 'EN_PREPARACION';
        }

        // 4. Actualizar estado
        const { error } = await supabaseAdmin
          .from('bookings')
          .update({ status: newStatus })
          .eq('id', bookingId.trim());

        if (error) {
          console.error(`[WEBHOOK] Error al actualizar la reserva ${bookingId}:`, error);
        } else {
          console.log(`[WEBHOOK] Reserva ${bookingId} actualizada a ${newStatus} exitosamente.`);
        }
      }
    }

    return NextResponse.json({ received: true, status: 'processed' });
  } catch (error: any) {
    console.error("[WEBHOOK FATAL ERROR]:", error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}
