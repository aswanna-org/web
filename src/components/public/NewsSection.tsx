import { useTranslation } from 'react-i18next';
import { ArrowRight, User, CalendarDays, Leaf } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/ui/Card';

export default function NewsSection() {
  const { t } = useTranslation();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const [newsItems, setNewsItems] = useState<any[]>([]);
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetch(`${API_BASE_URL}/news?limit=5`)
      .then(res => res.json())
      .then(data => {
        const items = data.data || data;
        setNewsItems(items);
      })
      .catch(err => console.error("Error fetching news:", err));
  }, []);

  return (
    <section className="w-full py-20 bg-gray-50 relative">
      
      {/* Background Decor to enhance glassy look */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-[var(--color-secondary)]/10 to-transparent pointer-events-none rounded-bl-full"></div>

      {/* Section Header */}
      <div className="container mx-auto px-4 lg:px-8 mb-12 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="text-gray-500 font-bold text-sm tracking-widest uppercase">
              {t('news.subtitle')}
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-[var(--color-secondary)]">
            {t('news.title')}
          </h2>
        </div>
      </div>

      {/* Embla Carousel */}
      <div className="w-full px-4 lg:px-8 relative z-10">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6 touch-pan-y py-4">
            {newsItems.map((item) => (
              <div 
                key={item.id} 
                className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] min-w-0 group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-grab active:cursor-grabbing flex flex-col bg-transparent"
              >
                <div className="h-full px-2">
                  <Card
                    image={item.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80'}
                    badge="NEWS"
                    title={isSinhala ? (item.sinhalaTitle || item.title) : item.title}
                    meta={[
                      { icon: User, text: item.authorName },
                      { icon: CalendarDays, text: new Date(item.createdAt).toLocaleDateString() }
                    ]}
                    primaryAction={{ text: "Read More", icon: ArrowRight, onClick: () => window.location.href = '/news' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="container mx-auto px-4 lg:px-8 mt-12">
        <div className="flex justify-center gap-2">
          {emblaApi?.scrollSnapList().map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === selectedIndex ? 'bg-[var(--color-secondary)] scale-110' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
