import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "Choice Menu <noreply@choicemenu.com>",
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

export function generateBookingConfirmationEmail(
  eventName: string,
  eventDate: string,
  totalAmount: number
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Choice Menu - Event Booking Confirmation</h1>
          </div>
          <div class="content">
            <h2>Your event has been booked!</h2>
            <p><strong>Event:</strong> ${eventName}</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Total Amount:</strong> PKR ${totalAmount.toLocaleString()}</p>
            <p>We'll review your booking and get back to you soon. You can track your booking status in your dashboard.</p>
          </div>
          <div class="footer">
            <p>Choice Menu - Your Trusted Event Management Partner</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function generatePaymentReminderEmail(
  eventName: string,
  amount: number,
  dueDate: string,
  paymentType: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Reminder - Choice Menu</h1>
          </div>
          <div class="content">
            <h2>Payment Due Soon</h2>
            <p>This is a reminder that your ${paymentType} payment is due soon.</p>
            <p><strong>Event:</strong> ${eventName}</p>
            <p><strong>Amount:</strong> PKR ${amount.toLocaleString()}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <p>Please make the payment to confirm your booking.</p>
          </div>
          <div class="footer">
            <p>Choice Menu - Your Trusted Event Management Partner</p>
          </div>
        </div>
      </body>
    </html>
  `
}

