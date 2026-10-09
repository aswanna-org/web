import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const KNIGHT_RIDER_GRADIENT =
  'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 65deg, rgba(16, 185, 129, 0.2) 75deg, rgba(16, 185, 129, 0.8) 88deg, #059669 98deg, #10b981 105deg, #6ee7b7 112deg, #ffffff 116deg, #6ee7b7 120deg, #10b981 126deg, #059669 133deg, rgba(16, 185, 129, 0.3) 142deg, transparent 155deg, transparent 360deg)';

interface ImportantEvent {
  id: string;
  imageUrl: string;
  hyperlink?: string | null;
  startDate?: string;
  expiryDate?: string | null;
  activeState: boolean;
  order?: number;
}

export default function ImportantEventsSection() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const [events, setEvents] = useState<ImportantEvent[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/important-events?activeOnly=true`);
        if (!res.ok) return;
        const json = await res.json();
        // Check both data and items as per guidelines
        const list = json?.data || json?.items || (Array.isArray(json) ? json : []);

        if (isMounted && Array.isArray(list)) {
          const now = new Date();
          // Filter valid events with image, active, started, not expired
          const validEvents = list.filter((item: ImportantEvent) => {
            if (!item.imageUrl || !item.imageUrl.trim()) return false;
            if (item.activeState === false) return false;
            if (item.startDate && new Date(item.startDate) > now) return false;
            if (item.expiryDate && new Date(item.expiryDate) < now) return false;
            return true;
          });

          // Maximum of 2 events
          setEvents(validEvents.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to load important events for home section:', err);
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  // Only show when there are valid active event images, otherwise do not show anything
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-5 sm:py-8 relative z-10 font-roboto">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="reveal-fade-up flex flex-col items-center text-center mb-5 sm:mb-8">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-primary)]" />
            <span className="text-gray-500 font-bold text-[11px] sm:text-xs tracking-widest uppercase">
              {isSinhala ? 'විශේෂ නිවේදන සහ අවස්ථා' : 'Special Announcements & Events'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--color-secondary)]">
            {isSinhala ? 'වැදගත් සිදුවීම්' : 'Important Events'}
          </h2>
        </div>

        <div className="flex flex-col gap-6 sm:gap-8 w-full">
          {events.map((event) => {
            const hasLink = Boolean(event.hyperlink && event.hyperlink.trim());

            const bannerCard = (
              <>
                {/* Knight Rider Ambient Glowing Halo Behind */}
                <div
                  className="absolute -inset-[150%] animate-knight-rider blur-xl opacity-90 pointer-events-none"
                  style={{ background: KNIGHT_RIDER_GRADIENT }}
                />

                {/* Knight Rider Sharp Laser Scanning Beam around border */}
                <div
                  className="absolute -inset-[150%] animate-knight-rider pointer-events-none"
                  style={{ background: KNIGHT_RIDER_GRADIENT }}
                />

                {/* Inner Content Card holding the Banner Image */}
                <div className="relative z-10 w-full h-full rounded-[20px] sm:rounded-[34px] overflow-hidden bg-white shadow-xs">
                  <img
                    src={event.imageUrl}
                    alt="Important Event"
                    className="w-full h-48 sm:h-60 md:h-72 lg:h-80 xl:h-[350px] object-cover object-center rounded-[20px] sm:rounded-[34px] transition-transform duration-500 group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                </div>
              </>
            );

            if (hasLink) {
              return (
                <a
                  key={event.id}
                  href={event.hyperlink!}
                  target={event.hyperlink!.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="reveal-fade-up relative block w-full p-[2.5px] sm:p-[3px] rounded-[22px] sm:rounded-[36px] overflow-hidden group shadow-[0_14px_45px_rgba(16,185,129,0.22),0_10px_28px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_55px_rgba(16,185,129,0.32),0_14px_38px_rgba(0,0,0,0.14)] transition-all duration-300 hover:scale-[1.006] active:scale-[0.995] cursor-pointer"
                >
                  {bannerCard}
                </a>
              );
            }

            return (
              <div
                key={event.id}
                className="reveal-fade-up relative block w-full p-[2.5px] sm:p-[3px] rounded-[22px] sm:rounded-[36px] overflow-hidden group shadow-[0_14px_45px_rgba(16,185,129,0.22),0_10px_28px_rgba(0,0,0,0.08)]"
              >
                {bannerCard}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
