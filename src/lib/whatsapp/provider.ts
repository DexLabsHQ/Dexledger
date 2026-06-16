/**
 * WhatsApp messaging abstraction.
 *
 * DexLedger sends business reports (low stock, outstanding credit, daily /
 * weekly summaries) to the store owner's WhatsApp number. The concrete
 * provider (Meta WhatsApp Cloud API, Twilio, Interakt, ...) is selected at
 * runtime via `notification_settings.whatsapp_provider`, so new providers
 * can be added without touching call sites.
 *
 * Usage:
 *   const provider = getWhatsAppProvider(store.notification_settings.whatsapp_provider);
 *   await provider.sendMessage({ to: store.whatsapp_number, body: reportText });
 */

export interface WhatsAppMessage {
  /** E.164 formatted phone number, e.g. "+919876543210" */
  to: string;
  /** Plain-text message body. Providers handle their own formatting/markdown rules. */
  body: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  /** Provider-specific message id, useful for delivery tracking. */
  messageId?: string;
  error?: string;
}

export interface WhatsAppProvider {
  /** Unique provider key, matches `notification_settings.whatsapp_provider`. */
  readonly key: string;
  /** Human readable name for settings UI. */
  readonly label: string;

  /** Send a single text message. */
  sendMessage(message: WhatsAppMessage): Promise<WhatsAppSendResult>;
}
