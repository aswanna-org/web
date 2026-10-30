import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, any>>;
  }
}

export interface GoogleAdProps {
  /**
   * Google AdSense Unit Slot ID (e.g. "6362168210")
   */
  slot?: string;
  /**
   * Optional override for Google AdSense Publisher ID (e.g. "ca-pub-9763703420840419")
   */
  client?: string;
  /**
   * Ad format: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical'
   */
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  /**
   * Layout type (e.g. 'in-article')
   */
  layout?: string;
  /**
   * Layout Key for In-Feed native ads
   */
  layoutKey?: string;
  /**
   * Whether the ad is full-width responsive (default: true)
   */
  responsive?: boolean;
  /**
   * Show a subtle "Advertisement / දැන්වීමයි" label above the ad (recommended for AdSense policy compliance)
   */
  showLabel?: boolean;
  /**
   * Additional wrapper container class name
   */
  className?: string;
  /**
   * Inline CSS style for the ad unit container
   */
  style?: React.CSSProperties;
}

export default function GoogleAd({
  slot,
  client,
  format = 'auto',
  layout,
  layoutKey,
  responsive = true,
  showLabel = true,
  className = '',
  style
}: GoogleAdProps) {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const adRef = useRef<HTMLModElement | null>(null);
  const [adPushed, setAdPushed] = useState(false);
  const [isUnfilled, setIsUnfilled] = useState(false);

  const clientId = client || import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9763703420840419';
  const isPlaceholderId = !clientId || clientId.includes('XXXX');

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('192.168.'));

  useEffect(() => {
    // Only attempt to push when not already processed by AdSense
    if (adRef.current && !adPushed && !isPlaceholderId && !isLocalhost) {
      try {
        const isAlreadyFilled = adRef.current.getAttribute('data-adsbygoogle-status');
        if (!isAlreadyFilled) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdPushed(true);
        }
      } catch (err) {
        console.warn('AdSense push error or ad-blocker detected:', err);
      }
    }
  }, [adPushed, isPlaceholderId, isLocalhost, slot]);

  // On production, if AdSense cannot fill an ad or account is pending approval,
  // Google sets data-ad-status="unfilled". In that case, hide the container so no blank space appears.
  useEffect(() => {
    if (!adRef.current || isLocalhost) return;
    const observer = new MutationObserver(() => {
      if (adRef.current?.getAttribute('data-ad-status') === 'unfilled') {
        setIsUnfilled(true);
      }
    });
    observer.observe(adRef.current, { attributes: true, attributeFilter: ['data-ad-status'] });
    return () => observer.disconnect();
  }, [isLocalhost]);

  // If unfilled on production, hide the container completely
  if (isUnfilled && !isLocalhost) {
    return null;
  }

  // Determine standard dimension styling based on format
  const getFormatStyle = (): React.CSSProperties => {
    switch (format) {
      case 'horizontal':
        return { display: 'block', minHeight: '90px' };
      case 'rectangle':
        return { display: 'inline-block', width: '300px', height: '250px' };
      case 'vertical':
        return { display: 'inline-block', width: '300px', height: '600px' };
      case 'fluid':
        return { display: 'block' };
      case 'auto':
      default:
        return { display: 'block', minHeight: '60px' };
    }
  };

  return (
    <div
      className={`aswanna-ad-container my-4 text-center overflow-hidden transition-all duration-200 ${className}`}
      style={style}
    >
      {/* On Localhost / Dev: Display an informative preview box */}
      {isLocalhost || isPlaceholderId ? (
        <div className="border border-dashed border-emerald-300/80 bg-emerald-50/60 rounded-xl p-4 sm:p-5 text-center text-xs text-emerald-800 flex flex-col items-center justify-center gap-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Google AdSense • Preview Mode
          </div>
          <p className="text-[11px] text-emerald-700 max-w-md">
            {isSinhala
              ? 'Google AdSense මඟින් Localhost හි දැන්වීම් පෙන්වන්නේ නැත. සයිට් එක Deploy කර AdSense මඟින් aswanna.lk අනුමත (Approve) වූ පසු මෙහි සජීවීව දැන්වීම් දිස්වනු ඇත.'
              : 'Google AdSense does not serve live ads on localhost. Once approved, live ads will display on aswanna.lk.'}
          </p>
          {slot && (
            <code className="text-[10px] font-mono bg-white/80 border border-emerald-200 px-2 py-0.5 rounded text-emerald-900">
              Slot ID: {slot}
            </code>
          )}
        </div>
      ) : (
        <>
          {/* Policy Label (only shown when ad container is active) */}
          {showLabel && (
            <div className="text-[10px] tracking-wider uppercase text-gray-400 font-medium mb-1.5 select-none">
              {isSinhala ? 'දැන්වීමයි' : 'Advertisement'}
            </div>
          )}

          {/* Actual AdSense Unit */}
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ ...getFormatStyle(), ...style }}
            data-ad-client={clientId}
            {...(slot ? { 'data-ad-slot': slot } : {})}
            {...(format ? { 'data-ad-format': format } : {})}
            {...(layout ? { 'data-ad-layout': layout } : {})}
            {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
            {...(responsive ? { 'data-full-width-responsive': 'true' } : {})}
          />
        </>
      )}
    </div>
  );
}
