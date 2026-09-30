import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowUpRight, DollarSign, Clock, Sparkles } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Card from '../ui/Card';
import { formatQualificationLevel, formatDurationUnit } from '../../pages/public/EducationDetail';

export default function CoursesSection() {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/courses?limit=4`)
      .then(res => res.json())
      .then(data => {
        const items = data.data || data;
        setCourses(Array.isArray(items) ? items : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching latest courses:', err);
        setCourses([]);
        setLoading(false);
      });
  }, [API_BASE_URL]);

  if (!loading && courses.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 bg-[#f8faf9] relative overflow-hidden font-roboto">
      {/* Background Decor to enhance glassy look */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-emerald-600/5 to-transparent pointer-events-none rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-2/3 bg-gradient-to-tr from-emerald-500/5 to-transparent pointer-events-none rounded-tr-full"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="reveal-fade-up flex flex-col items-center text-center mb-6 sm:mb-10">
          <div className="flex items-center gap-2 mb-1.5">
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-primary)]" />
            <span className="text-gray-500 font-bold text-[11px] sm:text-xs tracking-widest uppercase">
              {t('courses.subtitle', isSinhala ? 'කෘෂි අධ්‍යාපනය සහ පුහුණු' : 'Agricultural Education & Training')}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--color-secondary)]">
            {t('courses.title', isSinhala ? 'නවතම පාඨමාලා' : 'Latest Courses')}
          </h2>
        </div>

        {/* Embla Carousel / Cards */}
        <div className="reveal-fade-up delay-150 w-full relative">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-[28px] border border-gray-100 p-2 h-96 animate-pulse flex flex-col">
                  <div className="h-56 bg-gray-200/80 rounded-[22px] w-full mb-4"></div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    <div className="h-10 bg-gray-200/70 rounded-full mt-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden py-4 -my-4 px-2 -mx-2" ref={emblaRef}>
              <div className="flex gap-6 touch-pan-y py-4">
                {courses.map((course) => {
                  const categoryLabel = isSinhala
                    ? (course.category?.categoryNameSi || course.category?.categoryNameEn)
                    : (course.category?.categoryNameEn || course.category?.categoryNameSi);

                  const feeLabel = course.courseFee === 0
                    ? (isSinhala ? 'නොමිලේ' : 'Free')
                    : `Rs. ${Number(course.courseFee).toLocaleString()}`;

                  const durationLabel = course.durationValue
                    ? `${course.durationValue} ${formatDurationUnit(course.durationUnit, isSinhala)}`.trim()
                    : '';

                  return (
                    <div 
                      key={course.id} 
                      className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] min-w-0 group relative transition-all duration-300 cursor-grab active:cursor-grabbing flex flex-col bg-transparent pb-2"
                    >
                      <div className="h-full px-1 py-1">
                        <Card
                          to={`/education/${course.slug || course.id}`}
                          image={course.bannerImageUrl || 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&q=80'}
                          badge={formatQualificationLevel(course.courseLevel, isSinhala) || (isSinhala ? 'පාඨමාලාව' : 'Course')}
                          titleClassName="text-sm sm:text-base font-bold text-gray-900 leading-snug mb-1 line-clamp-2"
                          topRightBadge={course.applicationCalled ? (
                            <div className="h-6 inline-flex items-center gap-1.5 bg-amber-500/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 rounded-full shadow-xs border border-amber-300/40 max-w-full">
                              <Sparkles size={11} className="shrink-0 text-amber-100" />
                              <span className="truncate">{isSinhala ? 'අයදුම්පත් කැඳවා ඇත' : 'Application Called'}</span>
                            </div>
                          ) : null}
                          title={course.title}
                          subtitle={categoryLabel}
                          meta={[
                            { icon: DollarSign, text: feeLabel },
                            ...(durationLabel ? [{ icon: Clock, text: durationLabel }] : [])
                          ]}
                          primaryAction={{
                            text: isSinhala ? 'විස්තර බලන්න' : 'View Details',
                            onClick: () => window.location.href = `/education/${course.slug || course.id}`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Carousel Indicators */}
        {emblaApi?.scrollSnapList() && emblaApi.scrollSnapList().length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {emblaApi.scrollSnapList().map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === selectedIndex 
                    ? 'w-7 bg-[var(--color-secondary)]' 
                    : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* View All Courses Liquid Glass Button */}
        <div className="reveal-fade-up mt-8 sm:mt-10 flex justify-center">
          <Link
            to="/education"
            className="inline-flex items-center gap-3.5 pl-6 sm:pl-7 pr-2.5 sm:pr-3 py-2 sm:py-2.5 rounded-full bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-gray-200/80 hover:border-emerald-300 text-gray-900 font-bold text-xs sm:text-base shadow-[0_8px_30px_rgba(0,0,0,0.06),inset_0_1.5px_2px_rgba(255,255,255,1)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
          >
            <span>{t('courses.viewAll', isSinhala ? 'සියලුම පාඨමාලා බලන්න' : 'View All Courses')}</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/80 shadow-xs flex items-center justify-center group-hover:rotate-45 transition-transform duration-300 shrink-0">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
