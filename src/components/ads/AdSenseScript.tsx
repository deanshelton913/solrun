'use client';

import { useEffect } from 'react';

import { getAdSenseScriptSrc } from '@/app/services/AdConfigService';

export const ADENSE_SCRIPT_LOADED_EVENT = 'adsense-script-loaded';
const SCRIPT_ID = 'adsense-script';

/**
 * Injects the AdSense script with a plain <script> tag so it does not get
 * Next.js data-nscript attributes, which AdSense does not support and can
 * prevent ads from loading. Dispatches a custom event when loaded so ad
 * units can push only after the script is ready.
 */
export function AdSenseScript() {
  useEffect(() => {
    const src = getAdSenseScriptSrc();
    if (!src) return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      (
        window as unknown as { __adsenseScriptLoaded?: boolean }
      ).__adsenseScriptLoaded = true;
      window.dispatchEvent(new CustomEvent(ADENSE_SCRIPT_LOADED_EVENT));
    };
    document.head.appendChild(script);
  }, []);

  return null;
}
