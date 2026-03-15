'use client';

import { useEffect, useRef } from 'react';

import { getAdConfig } from '@/app/services/AdConfigService';

import { ADENSE_SCRIPT_LOADED_EVENT } from './AdSenseScript';

export interface AdSenseUnitProps {
  /** Override slot ID from config. Useful for multiple units on one page. */
  slotId?: string;
  /** Ad format: auto (responsive), horizontal, or vertical. */
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  /** Optional className for the wrapper. */
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

function pushAd() {
  try {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  } catch {
    // Ad blocker or script not loaded
  }
}

/**
 * Renders a single Google AdSense unit. Only mounts when ad config is set
 * (NEXT_PUBLIC_ADSENSE_CLIENT_ID). Pushes after the AdSense script has loaded
 * so the slot can fill. Replace this component or AdConfigService to switch
 * to another ad provider.
 */
export function AdSenseUnit({
  slotId: slotIdProp,
  format = 'auto',
  className = '',
}: AdSenseUnitProps) {
  const config = getAdConfig();
  const pushed = useRef(false);

  useEffect(() => {
    if (!config?.clientId) return;

    const run = () => {
      if (pushed.current) return;
      pushed.current = true;
      pushAd();
    };

    // Push when script is ready (either already loaded or on load event)
    const win = window as unknown as { __adsenseScriptLoaded?: boolean };
    if (win.__adsenseScriptLoaded) {
      run();
      return;
    }
    const onLoaded = () => run();
    window.addEventListener(ADENSE_SCRIPT_LOADED_EVENT, onLoaded);
    return () =>
      window.removeEventListener(ADENSE_SCRIPT_LOADED_EVENT, onLoaded);
  }, [config?.clientId]);

  if (!config?.clientId) return null;

  const slot = slotIdProp ?? config.slotInline;

  return (
    <div
      className={`min-h-[90px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 [&_.adsbygoogle]:min-h-[90px] ${className}`}
      aria-label='Advertisement'
    >
      <ins
        className='adsbygoogle block'
        data-ad-client={config.clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={format === 'auto' ? 'true' : undefined}
        style={{ display: 'block' }}
      />
    </div>
  );
}
