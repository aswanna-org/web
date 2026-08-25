import { useTranslation } from 'react-i18next';
import { Leaf, ArrowRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

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

  const newsItems = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
      titleKey: 'news.news1',
      category: 'HARVEST',
      date: 'MAY 7, 2026',
      author: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&q=80',
      titleKey: 'news.news2',
      category: 'FARMING',
      date: 'MAY 4, 2026',
      author: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1595841696677-6479c04c0e15?w=600&q=80',
      titleKey: 'news.news3',
      category: 'EQUIPMENT',
      date: 'APR 28, 2026',
      author: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80',
      titleKey: 'news.news4',
      category: 'MARKET',
      date: 'APR 20, 2026',
      author: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80',
      titleKey: 'news.news1',
      category: 'WEATHER',
      date: 'APR 15, 2026',
      author: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
    },
  ];

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
                {/* Image Top Half */}
                <div className="relative h-56 w-full overflow-hidden rounded-2xl">
                  <img 
                    src={item.image} 
                    alt={t(item.titleKey)} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                  />
                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 bg-[#c8e265] text-gray-900 font-bold text-xs px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">
                    {item.category}
                  </span>
                </div>
                
                {/* Content Bottom Half */}
                <div className="pt-6 flex flex-col flex-grow">
                  
                  {/* Meta: Avatar, Author, Date */}
                  <div className="flex items-center gap-3 mb-4">
                    <img src={item.avatar} alt={item.author} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-black/5 px-2 py-1 rounded-md">
                      <span className="uppercase">{item.author}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-black/5 px-2 py-1 rounded-md">
                      <span className="uppercase">{item.date}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-gray-900 font-bold text-xl leading-snug mb-6 line-clamp-3">
                    {t(item.titleKey)}
                  </h3>

                  {/* Read More Button */}
                  <div className="mt-auto">
                    <button className="flex items-center justify-center gap-2 bg-black/5 backdrop-blur-md hover:bg-black/10 rounded-xl px-5 py-2.5 text-sm font-bold text-gray-800 transition-colors w-max shadow-sm">
                      Read More <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

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
