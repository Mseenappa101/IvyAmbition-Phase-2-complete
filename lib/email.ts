import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendNotificationEmail(
  to: string,
  subject: string,
  body: string
) {
  if (!resend) return;

  try {
    await resend.emails.send({
      from: "IvyAmbition <notifications@ivyambition.com>",
      to,
      subject,
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 32px; background-color: #fafaf8;">
          <div style="margin-bottom: 24px;">
            <h1 style="color: #c5a44e; font-size: 20px; margin: 0;">IvyAmbition</h1>
          </div>
          <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e8e6e1;">
            <h2 style="color: #1a1a2e; font-size: 18px; margin: 0 0 12px 0;">${subject}</h2>
            <p style="color: #555; line-height: 1.6; margin: 0;">${body}</p>
          </div>
          <div style="margin-top: 24px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">IvyAmbition — Your college admissions partner</p>
          </div>
        </div>
      `,
    });
  } catch {
    // Silently fail — email is non-critical
  }
}
