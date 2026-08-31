import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, BookOpen, DollarSign } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import Card from '../../components/ui/Card';
import { EDUCATION_COURSES, COURSE_CATEGORIES } from '../../data/educationData';

export default function Education() {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('All');

  const isSinhala = i18n.language === 'si';

  // Filter courses based on active category
  const filteredCourses = EDUCATION_COURSES.filter((course) => {
    if (activeCategory === 'All') return true;
    return course.category === activeCategory;
  });

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* ── Page Hero ── */}
      <PageHero
        title={t('educationPage.title', 'EDUCATION')}
        description={t('contact.desc')}
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#054a29"
      />

      {/* ── Main Content ── */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-12">

          {/* Filter Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {COURSE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wider transition-all duration-300 ${activeCategory === cat
                    ? 'bg-[var(--color-secondary)] text-white shadow-md'
                    : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 shadow-sm border border-gray-100'
                  }`}
              >
                {cat === 'All' ? t('educationPage.all', 'All Categories') : cat}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-400">{t('educationPage.noCourses', 'No courses found.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  image={course.image}
                  badge={course.category}
                  title={isSinhala ? course.titleSi : course.title}
                  subtitle={isSinhala ? course.subtitleSi : course.subtitle}
                  meta={[
                    { icon: DollarSign, text: course.price },
                    { icon: Clock, text: isSinhala ? course.durationSi : course.duration }
                  ]}
                  primaryAction={{
                    text: t('educationPage.enroll', 'Enroll'),
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
