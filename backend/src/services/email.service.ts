import { createMailTransporter, getSmtpFromAddress, isSmtpConfigured } from "../config/mail";

const createPasswordResetHtml = (name: string, resetUrl: string): string => {
  return `
    <div style="background:#f8f7ff;padding:24px;font-family:Inter,Segoe UI,system-ui,sans-serif;color:#111827;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #d8d2eb;border-radius:14px;overflow:hidden;">
        <div style="background:#3323cc;padding:20px 24px;">
          <h1 style="margin:0;font-size:20px;color:#ffffff;">TaskFlow Pro</h1>
          <p style="margin:6px 0 0;color:#ddd8ff;font-size:13px;">Password reset request</p>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 14px;font-size:15px;">Hi ${name},</p>
          <p style="margin:0 0 18px;line-height:1.55;color:#334155;font-size:14px;">
            We received a request to reset your TaskFlow Pro password. Click the button below to create a new password.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#3323cc;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:10px;font-weight:600;">
            Reset Password
          </a>
          <p style="margin:18px 0 8px;line-height:1.55;color:#334155;font-size:14px;">
            If the button doesn't work, use this link:
          </p>
          <p style="margin:0 0 14px;font-size:13px;word-break:break-all;color:#3323cc;">${resetUrl}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#64748b;">This link expires in 15 minutes.</p>
          <p style="margin:0;font-size:13px;color:#64748b;">If you did not request this, you can safely ignore this email.</p>
        </div>
      </div>
    </div>
  `;
};

const createPasswordResetText = (name: string, resetUrl: string): string => {
  return [
    `Hi ${name},`,
    "",
    "We received a request to reset your TaskFlow Pro password.",
    `Reset link: ${resetUrl}`,
    "",
    "This link expires in 15 minutes.",
    "If you did not request this, you can ignore this email."
  ].join("\n");
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string, name = "there"): Promise<void> => {
  try {
    // eslint-disable-next-line no-console
    console.log("[SMTP] Configured:", isSmtpConfigured());
    const transporter = createMailTransporter();
    const from = getSmtpFromAddress();

    // eslint-disable-next-line no-console
    console.log("[SMTP] Sending reset email", { to });

    const info = await transporter.sendMail({
      from,
      to,
      subject: "Reset your TaskFlow Pro password",
      html: createPasswordResetHtml(name, resetUrl),
      text: createPasswordResetText(name, resetUrl)
    });

    // eslint-disable-next-line no-console
    console.log("[SMTP] Reset email sent", { messageId: info.messageId });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[SMTP] Reset email failed", error instanceof Error ? error.message : error);
    throw new Error("Failed to send password reset email.");
  }
};

export const sendSmtpTestEmail = async (to: string): Promise<void> => {
  try {
    // eslint-disable-next-line no-console
    console.log("[SMTP] Configured:", isSmtpConfigured());
    const transporter = createMailTransporter();
    const from = getSmtpFromAddress();

    // eslint-disable-next-line no-console
    console.log("[SMTP] Sending SMTP test email", { to });

    const info = await transporter.sendMail({
      from,
      to,
      subject: "TaskFlow Pro SMTP test email",
      text: "TaskFlow Pro SMTP test email"
    });

    // eslint-disable-next-line no-console
    console.log("[SMTP] SMTP test email sent", { messageId: info.messageId });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[SMTP] SMTP test email failed", error instanceof Error ? error.message : error);
    throw new Error("Failed to send SMTP test email.");
  }
};
