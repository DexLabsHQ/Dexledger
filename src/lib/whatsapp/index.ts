import type { WhatsAppProvider } from "./provider";
import { MetaWhatsAppProvider } from "./providers/meta";
import { TwilioWhatsAppProvider } from "./providers/twilio";
import { InteraktWhatsAppProvider } from "./providers/interakt";

const providers: Record<string, () => WhatsAppProvider> = {
  meta_whatsapp: () => new MetaWhatsAppProvider(),
  twilio: () => new TwilioWhatsAppProvider(),
  interakt: () => new InteraktWhatsAppProvider(),
};

/** All providers available for selection in the Settings UI. */
export const AVAILABLE_WHATSAPP_PROVIDERS = [
  { key: "meta_whatsapp", label: "Meta WhatsApp Business API" },
  { key: "twilio", label: "Twilio" },
  { key: "interakt", label: "Interakt" },
];

/**
 * Resolve a configured WhatsApp provider by key. Returns null if the key is
 * unknown so callers can degrade gracefully (e.g. show "not configured").
 */
export function getWhatsAppProvider(providerKey: string | null | undefined): WhatsAppProvider | null {
  if (!providerKey) return null;
  const factory = providers[providerKey];
  return factory ? factory() : null;
}

export * from "./provider";
export * from "./templates";
