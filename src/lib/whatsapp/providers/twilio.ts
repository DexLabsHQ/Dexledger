import type { WhatsAppProvider, WhatsAppMessage, WhatsAppSendResult } from "../provider";

/**
 * Twilio WhatsApp API provider.
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM   (e.g. "whatsapp:+14155238886")
 *
 * Docs: https://www.twilio.com/docs/whatsapp
 */
export class TwilioWhatsAppProvider implements WhatsAppProvider {
  readonly key = "twilio";
  readonly label = "Twilio";

  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppSendResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    if (!accountSid || !authToken || !from) {
      return { success: false, error: "Twilio provider is not configured." };
    }

    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: from,
            To: `whatsapp:${message.to}`,
            Body: message.body,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data?.message ?? "Unknown error" };
      }

      return { success: true, messageId: data?.sid };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }
}
