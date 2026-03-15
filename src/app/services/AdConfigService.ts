/**
 * Ad configuration from environment. Replace with your own provider/config as needed.
 * Set NEXT_PUBLIC_ADSENSE_CLIENT_ID (e.g. ca-pub-xxxxxxxx) and optionally
 * NEXT_PUBLIC_ADSENSE_SLOT_INLINE for the in-feed/inline slot.
 */
export interface AdConfig {
  clientId: string;
  /** Optional slot for inline/display units. Omit to use auto ads or a single default. */
  slotInline?: string;
}

export function getAdConfig(): AdConfig | null {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  if (!clientId || clientId.trim() === '') return null;
  const slotInline = process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE?.trim();
  return { clientId: clientId.trim(), slotInline: slotInline || undefined };
}

export function getAdSenseScriptSrc(): string | null {
  const config = getAdConfig();
  if (!config) return null;
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.clientId}`;
}
