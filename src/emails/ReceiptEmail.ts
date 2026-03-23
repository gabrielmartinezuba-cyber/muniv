export interface ReceiptProps {
  name: string;
  experienceName: string;
  date?: string;
  time?: string;
  guests: number;
  totalPaid: number;
}

export const generateReceiptEmailHtml = ({ name, experienceName, date, time, guests, totalPaid }: ReceiptProps) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Compra</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0c0a09; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #0c0a09; padding: 40px 20px; border-radius: 12px; }
        .logo { text-align: center; margin-bottom: 40px; }
        .logo h1 { font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 38px; color: #c29d5b; margin: 0; letter-spacing: 5px; font-weight: 300; font-style: italic; text-transform: uppercase; }
        .logo-icon { color: #7c2020; font-size: 24px; margin-bottom: 8px; display: block; }
        .content { background-color: #1a1514; border: 1px solid rgba(194, 157, 91, 0.2); border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .title { font-family: Georgia, 'Times New Roman', Times, serif; font-size: 24px; color: #ffffff; margin-top: 0; margin-bottom: 24px; text-align: center; font-weight: normal; }
        .greeting { font-size: 16px; margin-bottom: 30px; line-height: 1.5; color: #cbd5e1; }
        .details-box { background-color: rgba(124, 32, 32, 0.1); border-left: 3px solid #7c2020; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0; }
        .detail-row { margin-bottom: 12px; font-size: 15px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #b0895f; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; display: block; margin-bottom: 4px; }
        .detail-value { color: #ffffff; font-size: 16px; }
        .total-row { margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-family: Georgia, 'Times New Roman', Times, serif; clear: both; overflow: hidden; }
        .total-label { color: #cbd5e1; font-size: 16px; line-height: 28px; }
        .total-value { color: #c29d5b; font-size: 24px; font-weight: bold; float: right; }
        .message { text-align: center; font-size: 15px; color: #94a3b8; font-style: italic; line-height: 1.6; margin-top: 40px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #475569; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="logo">
          <!-- TODO: Reemplazar por la URL absoluta de tu logo (ej: https://muniv.club/logo.png) para que cargue la imagen real -->
          <span class="logo-icon">🍷</span>
          <h1>MUNIV</h1>
        </div>
        <div class="content">
          <h2 class="title">Confirmación de tu Compra en MUNIV</h2>
          <div class="greeting">
            Hola <strong>${name}</strong>,<br><br>Hemos registrado tu compra con éxito.
          </div>
          
          <div class="details-box">
            <div class="detail-row">
              <span class="detail-label">Experiencia</span>
              <span class="detail-value">${experienceName}</span>
            </div>
            ${date && date !== '1970-01-01' ? `
            <div class="detail-row">
              <span class="detail-label">Fecha y Hora</span>
              <span class="detail-value">${date} ${time && time !== '00:00' ? `- ${time}hs` : ''}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Participantes</span>
              <span class="detail-value">${guests} ${guests === 1 ? 'persona' : 'personas'}</span>
            </div>
            
            <div class="total-row">
              <span class="total-label">Total pagado</span>
              <span class="total-value">$${Number(totalPaid).toLocaleString('es-AR')}</span>
            </div>
          </div>
          
          <div class="message">
            "Te esperamos para compartir una experiencia inolvidable."<br>
            <span style="color: #b0895f; font-size: 13px; margin-top: 10px; display: inline-block;">Equipo de MUNIV</span>
          </div>
        </div>
        
        <div class="footer">
          © ${new Date().getFullYear()} MUNIV. Todos los derechos reservados.<br>
          Este es un correo automático. Por favor, no respondas a este mensaje.
        </div>
      </div>
    </body>
    </html>
  `;
};
