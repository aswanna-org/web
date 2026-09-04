import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, BookOpen, DollarSign } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import Card from '../../components/ui/Card';

export default function Education() {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isSinhala = i18n.language === 'si';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Fetch Categories
    fetch(`${API_BASE_URL}/courses/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, [API_BASE_URL]);

  useEffect(() => {
    // Fetch Courses
    const url = activeCategory === 'All' 
      ? `${API_BASE_URL}/courses` 
      : `${API_BASE_URL}/courses?categoryId=${activeCategory}`;

    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [API_BASE_URL, activeCategory]);

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
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wider transition-all duration-300 ${activeCategory === 'All'
                  ? 'bg-[var(--color-secondary)] text-white shadow-md'
                  : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 shadow-sm border border-gray-100'
                }`}
            >
              {t('educationPage.all', 'All Categories')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wider transition-all duration-300 ${activeCategory === cat.id
                    ? 'bg-[var(--color-secondary)] text-white shadow-md'
                    : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 shadow-sm border border-gray-100'
                  }`}
              >
                {isSinhala ? cat.categoryNameSi : cat.categoryNameEn}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-400">{t('educationPage.noCourses', 'No courses found.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  to={`/education/${course.slug}`}
                  image={course.bannerImageUrl || 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&q=80'}
                  badge={isSinhala ? course.category?.categoryNameSi : course.category?.categoryNameEn}
                  title={course.title}
                  subtitle={course.courseLevel.replace(/_/g, ' ')}
                  meta={[
                    { icon: DollarSign, text: course.courseFee === 0 ? t('agro.free', 'Free') : `Rs. ${course.courseFee}` },
                    { icon: Clock, text: `${course.durationValue} ${course.durationUnit}` }
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
