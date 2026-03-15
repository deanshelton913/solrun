'use client';

import Script from 'next/script';

import { getAdSenseScriptSrc } from '@/app/services/AdConfigService';

export const ADENSE_SCRIPT_LOADED_EVENT = 'adsense-script-loaded';
const SCRIPT_ID = 'adsense-script';

/**
 * Loads the AdSense verification/ads script so it is present in the page for
 * Google verification and for ad units. Dispatches a custom event when loaded
 * so ad units can push only after the script is ready.
 */
export function AdSenseScript() {
  const src = getAdSenseScriptSrc();
  if (!src) return null;

  return (
    <Script
      id={SCRIPT_ID}
      src={src}
      strategy='afterInteractive'
      crossOrigin='anonymous'
      onLoad={() => {
        (
          window as unknown as { __adsenseScriptLoaded?: boolean }
        ).__adsenseScriptLoaded = true;
        window.dispatchEvent(new CustomEvent(ADENSE_SCRIPT_LOADED_EVENT));
      }}
    />
  );
}
