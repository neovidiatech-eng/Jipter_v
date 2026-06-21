import { transporter } from "./MailerClient.js";
import { mailTemp } from "./MailTemp.js";
import { getMessage } from "../i18n.js";

export const sendEmail = async ({
  email,
  subject,
  text,
  otp,
  username,
  lang = "en",
  variant,
  metadata,
  actionUrl,
  actionText,
}) => {
  if (!email) {
    console.error("❌ Mailer Error: No recipient email provided.");
    return { success: false, error: "No recipient email provided" };
  }

  const emailSubject = subject || getMessage("EMAIL_DEFAULT_SUB", lang);
  const emailText = text || getMessage("EMAIL_BODY_TEXT", lang, { otp: otp || 'N/A' });
  const html = mailTemp({
    otp,
    title: emailSubject,
    text,
    username,
    lang,
    variant,
    metadata,
    actionUrl,
    actionText,
  });

  const senderEmail = process.env.MAIL_FROM || process.env.MAIL_USER || "no-reply@jupiter-egy.com";
  
  const mailOptions = {
    from: `"Jupiter Academy" <${senderEmail}>`,
    replyTo: senderEmail,
    to: email,
    subject: emailSubject,
    text: emailText,
    html: html,
    headers: {
      'X-Entity-Ref-ID': Date.now().toString(),
    }
  };

  try {
    // 1) Send real email via SMTP
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully:", info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    if (error.code === 'ETIMEDOUT') {
      console.error("❌ Mailer Timeout: Could not connect to SMTP server.");
    } else {
      console.error("❌ Mailer Error:", error.message);
    }
    return { success: false, error: error.message, code: error.code };
  }
};


