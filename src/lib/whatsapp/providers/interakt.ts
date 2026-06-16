import type { WhatsAppProvider, WhatsAppMessage, WhatsAppSendResult } from "../provider";

/**
 * Interakt WhatsApp API provider.
 *
 * Required env vars:
 *   INTERAKT_API_KEY
 *
 * Docs: https://docs.interakt.ai/
 */
export class InteraktWhatsAppProvider implements WhatsAppProvider {
  readonly key = "interakt";
  readonly label = "Interakt";

  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppSendResult> {
    const apiKey = process.env.INTERAKT_API_KEY;

    if (!apiKey) {
      return { success: false, error: "Interakt provider is not configured." };
    }

    try {
      const res = await fetch("https://api.interakt.ai/v1/public/message/", {
        method: "POST",
        headers: {
          Authorization: `Basic ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          countryCode: "+91",
          phoneNumber: message.to.replace(/^\+?91/, ""),
          type: "Text",
          data: { message: message.body },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data?.message ?? "Unknown error" };
      }

      return { success: true, messageId: data?.id };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }
}
