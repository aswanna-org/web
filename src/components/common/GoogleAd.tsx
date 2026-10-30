import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, any>>;
  }
}

export interface GoogleAdProps {
  /**
   * Google AdSense Unit Slot ID (e.g. "1234567890")
   * If omitted, AdSense Auto-Ads or responsive default is used.
   */
  slot?: string;
  /**
   * Optional override for Google AdSense Publisher ID (e.g. "ca-pub-XXXXXXXXXXXXXXXX")
   * Defaults to import.meta.env.VITE_ADSENSE_CLIENT_ID
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
   * Show a subtle "Advertisement / දැන්වීම" label above the ad (recommended for AdSense policy compliance)
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

  const clientId = client || import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-9763703420840419';
  const isPlaceholderId = !clientId || clientId.includes('XXXX');

  useEffect(() => {
    // Only attempt to push when not already processed by AdSense
    if (adRef.current && !adPushed && !isPlaceholderId) {
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
  }, [adPushed, isPlaceholderId, slot]);

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
      {/* Policy Label */}
      {showLabel && (
        <div className="text-[10px] tracking-wider uppercase text-gray-400 font-medium mb-1.5 select-none">
          {isSinhala ? 'දැන්වීමයි' : 'Advertisement'}
        </div>
      )}

      {/* When publisher ID is still placeholder, display a helpful dev placeholder */}
      {isPlaceholderId ? (
        <div className="border border-dashed border-emerald-300/80 bg-emerald-50/50 rounded-xl p-4 sm:p-6 text-center text-xs text-emerald-800 flex flex-col items-center justify-center gap-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Google AdSense Placement
          </div>
          <p className="text-[11px] text-emerald-700 max-w-md">
            {isSinhala
              ? 'AdSense පෙන්වීමට .env ගොනුවේ VITE_ADSENSE_CLIENT_ID සහ Ad Slot ID ඇතුළත් කරන්න.'
              : 'To display live ads, set your VITE_ADSENSE_CLIENT_ID in .env and specify your Ad Unit Slot ID.'}
          </p>
          {slot && (
            <code className="text-[10px] font-mono bg-white/80 border border-emerald-200 px-2 py-0.5 rounded text-emerald-900 mt-0.5">
              Slot ID: {slot}
            </code>
          )}
        </div>
      ) : (
        /* Actual AdSense Unit */
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
      )}
    </div>
  );
}

