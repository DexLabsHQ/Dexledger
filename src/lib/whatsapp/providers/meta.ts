import type { WhatsAppProvider, WhatsAppMessage, WhatsAppSendResult } from "../provider";

/**
 * Meta WhatsApp Business Cloud API provider.
 *
 * Required env vars:
 *   META_WHATSAPP_PHONE_NUMBER_ID
 *   META_WHATSAPP_ACCESS_TOKEN
 *
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
export class MetaWhatsAppProvider implements WhatsAppProvider {
  readonly key = "meta_whatsapp";
  readonly label = "Meta WhatsApp Business API";

  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppSendResult> {
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      return { success: false, error: "Meta WhatsApp provider is not configured." };
    }

    try {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: message.to,
            type: "text",
            text: { body: message.body },
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data?.error?.message ?? "Unknown error" };
      }

      return { success: true, messageId: data?.messages?.[0]?.id };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }
}
