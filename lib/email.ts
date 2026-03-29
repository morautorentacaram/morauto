import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendReservationConfirmation({
  to,
  customerName,
  vehicleName,
  startDate,
  endDate,
  totalValue,
  reservationId,
}: {
  to: string
  customerName: string
  vehicleName: string
  startDate: string
  endDate: string
  totalValue: number
  reservationId: string
}) {
  if (!process.env.RESEND_API_KEY) return { skipped: true }

  const formatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalValue)

  return resend.emails.send({
    from: "Morauto <noreply@morauto.com.br>",
    to,
    subject: `Reserva confirmada — ${vehicleName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #000; padding: 24px; text-align: center;">
          <h1 style="color: #d4a017; margin: 0; font-size: 28px;">Morauto</h1>
          <p style="color: #aaa; margin: 4px 0 0;">Sua reserva foi recebida!</p>
        </div>
        <div style="padding: 32px; background: #111; color: #eee;">
          <p>Olá, <strong>${customerName}</strong>!</p>
          <p>Sua reserva foi registrada com sucesso. Confira os detalhes:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr style="border-bottom: 1px solid #333;">
              <td style="padding: 12px; color: #aaa;">Veículo</td>
              <td style="padding: 12px; font-weight: bold;">${vehicleName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #333;">
              <td style="padding: 12px; color: #aaa;">Retirada</td>
              <td style="padding: 12px;">${startDate}</td>
            </tr>
            <tr style="border-bottom: 1px solid #333;">
              <td style="padding: 12px; color: #aaa;">Devolução</td>
              <td style="padding: 12px;">${endDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px; color: #aaa;">Valor Total</td>
              <td style="padding: 12px; color: #d4a017; font-weight: bold; font-size: 20px;">${formatted}</td>
            </tr>
          </table>
          <p style="color: #aaa; font-size: 14px;">Nossa equipe entrará em contato para confirmar os detalhes.</p>
          <p style="color: #aaa; font-size: 14px;">ID da reserva: <code>${reservationId}</code></p>
        </div>
        <div style="background: #000; padding: 16px; text-align: center;">
          <p style="color: #555; font-size: 12px;">© ${new Date().getFullYear()} Morauto Locadora de Veículos</p>
        </div>
      </div>
    `,
  })
}

export async function sendMaintenanceAlert({
  to,
  vehicleName,
  plate,
  description,
  date,
}: {
  to: string
  vehicleName: string
  plate: string
  description: string
  date: string
}) {
  if (!process.env.RESEND_API_KEY) return { skipped: true }

  return resend.emails.send({
    from: "Morauto <noreply@morauto.com.br>",
    to,
    subject: `Alerta de Manutenção — ${vehicleName} (${plate})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #000; padding: 24px; text-align: center;">
          <h1 style="color: #d4a017; margin: 0; font-size: 28px;">Morauto</h1>
          <p style="color: #aaa; margin: 4px 0 0;">Alerta Operacional</p>
        </div>
        <div style="padding: 32px; background: #111; color: #eee;">
          <h2 style="color: #f59e0b;">⚠ Manutenção Agendada</h2>
          <p><strong>Veículo:</strong> ${vehicleName} — Placa: ${plate}</p>
          <p><strong>Descrição:</strong> ${description}</p>
          <p><strong>Data:</strong> ${date}</p>
        </div>
      </div>
    `,
  })
}
