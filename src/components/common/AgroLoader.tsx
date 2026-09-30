import React from 'react';
import {
  Wheat,
  Sprout,
  Tractor,
  Leaf,
  Apple,
  Carrot,
  Citrus,
  Grape,
  Banana,
  Cherry,
  Bean,
  Nut,
  Palmtree,
  Shovel,
  Sun,
  CloudRain,
  Droplets,
  Flower2
} from 'lucide-react';

interface AgroLoaderProps {
  className?: string;
  message?: string;
  subMessage?: string;
}

// 18 Curated Agriculture, Fruits, Vegetables & Farming Icons
const AGRO_ICONS = [
  { id: 'wheat', Icon: Wheat },
  { id: 'sprout', Icon: Sprout },
  { id: 'apple', Icon: Apple },
  { id: 'carrot', Icon: Carrot },
  { id: 'tractor', Icon: Tractor },
  { id: 'citrus', Icon: Citrus },
  { id: 'leaf', Icon: Leaf },
  { id: 'banana', Icon: Banana },
  { id: 'grape', Icon: Grape },
  { id: 'shovel', Icon: Shovel },
  { id: 'cherry', Icon: Cherry },
  { id: 'bean', Icon: Bean },
  { id: 'nut', Icon: Nut },
  { id: 'sun', Icon: Sun },
  { id: 'palmtree', Icon: Palmtree },
  { id: 'cloud-rain', Icon: CloudRain },
  { id: 'droplets', Icon: Droplets },
  { id: 'flower', Icon: Flower2 },
];

// Duplicated for an ultra-smooth seamless infinite loop
const TRACK_ICONS = [...AGRO_ICONS, ...AGRO_ICONS];

export const AgroLoader: React.FC<AgroLoaderProps> = ({
  className = '',
  message = 'Loading...',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* ── Main Magnifier & Agriculture Icons Stage ── */}
      <div className="relative w-full max-w-[380px] sm:max-w-[480px] h-28 sm:h-32 flex items-center justify-center overflow-visible">
        {/* ── TRACK 1: Background Conveyor (Muted, subtle icons with edge fade mask) ── */}
        <div
          className="w-full flex items-center overflow-hidden pointer-events-none py-3"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)'
          }}
        >
          <div className="flex w-max animate-agro-conveyor">
            {TRACK_ICONS.map((item, idx) => (
              <div
                key={`bg-${item.id}-${idx}`}
                className="w-14 sm:w-16 flex-shrink-0 flex items-center justify-center py-2"
              >
                <item.Icon
                  className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-900/30 transition-transform duration-300 stroke-[1.8]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── THE MAGNIFYING GLASS INSPECTOR (Centered, 100% overflow-visible) ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none overflow-visible">
          <div className="relative animate-agro-lens w-16 h-16 sm:w-20 sm:h-20 overflow-visible">

            {/* Outer Subtle Pulse Glow */}
            <div className="absolute -inset-1.5 rounded-full bg-emerald-400/25 blur-sm animate-agro-ring pointer-events-none" />

            {/* Mathematically Centered Handle: Origin at circle center (0,0), extending down-right at -45deg */}
            <div
              className="absolute top-1/2 left-1/2 z-0 pointer-events-none"
              style={{
                transform: 'rotate(-45deg)',
                transformOrigin: '0 0'
              }}
            >
              <div
                className="flex flex-col items-center"
                style={{ transform: 'translateX(-50%)' }}
              >
                {/* Spacer from center to lens border */}
                <div className="h-[28px] sm:h-[36px]" />

                {/* Metallic Connector Collar tucked flush under the rim */}
                <div className="w-2.5 sm:w-3 h-2 bg-gradient-to-r from-gray-200 via-white to-gray-300 rounded-xs shadow-xs border-x border-gray-400/40" />

                {/* Handle Body collinear with lens center */}
                <div className="w-3 sm:w-3.5 h-8 sm:h-10 bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-950 rounded-b-full shadow-[2px_3px_8px_rgba(0,0,0,0.4)] border-t border-emerald-400/40" />
              </div>
            </div>

            {/* Magnifier Lens Body */}
            <div className="relative z-10 w-full h-full rounded-full border-[2.5px] border-emerald-500 bg-emerald-50/20 backdrop-blur-[2px] shadow-[0_6px_20px_rgba(5,74,41,0.2),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(5,74,41,0.1)] overflow-hidden flex items-center justify-center">

              {/* Inner Focus Target Ring */}
              <div className="absolute inset-1.5 border border-emerald-500/25 rounded-full pointer-events-none" />

              {/* ── TRACK 2: Foreground Synchronized Magnified Icons ── */}
              {/* Locked in 1:1 pixel sync with background conveyor */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[380px] sm:w-[480px] flex items-center overflow-hidden">
                <div className="flex w-max animate-agro-conveyor">
                  {TRACK_ICONS.map((item, idx) => (
                    <div
                      key={`lens-${item.id}-${idx}`}
                      className="w-14 sm:w-16 flex-shrink-0 flex items-center justify-center py-2"
                    >
                      <item.Icon
                        className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-700 drop-shadow-[0_2px_8px_rgba(5,74,41,0.35)] stroke-[2.2]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Glass Curvature Specular Reflection */}
              <div className="absolute top-1 left-2 sm:left-2.5 w-7 sm:w-10 h-3 sm:h-4 rounded-full bg-gradient-to-b from-white/70 via-white/30 to-transparent rotate-[-22deg] pointer-events-none z-30" />
            </div>

          </div>
        </div>
      </div>

      {/* Loading Text */}
      {message && (
        <div className="mt-4 sm:mt-5 flex items-center justify-center">
          <p className="text-xs sm:text-sm font-bold tracking-widest text-emerald-950/85 capitalize animate-pulse">
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default AgroLoader;
