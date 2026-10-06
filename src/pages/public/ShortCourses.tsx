import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, ArrowLeft, Sparkles } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';

export default function ShortCourses() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  return (
    <div className="w-full min-h-screen bg-gray-50/50">
      <SEO
        title={isSinhala ? 'කෙටිකාලීන හා ප්‍රායෝගික පුහුණු වැඩමුළු | Aswanna' : 'Short Courses & Workshops | Aswanna'}
        description={isSinhala ? 'කෘෂිකාර්මික ක්ෂේත්‍රයේ ප්‍රායෝගික කුසලතා වර්ධනය සඳහා වන කෙටිකාලීන වැඩමුළු සහ ප්‍රායෝගික පුහුණු වැඩසටහන්.' : 'Practical training workshops, short skill courses and hands-on agricultural training in Sri Lanka.'}
        canonical="/short-courses"
      />

      <PageHero
        title={isSinhala ? 'කෙටිකාලීන හා ප්‍රායෝගික පුහුණු' : 'SHORT COURSES & WORKSHOPS'}
        description={isSinhala ? 'කෘෂිකාර්මික ක්ෂේත්‍රයේ ප්‍රායෝගික කුසලතා වර්ධනය සඳහා වන කෙටිකාලීන වැඩමුළු සහ ප්‍රායෝගික පුහුණු වැඩසටහන්.' : 'Practical hands-on workshops and short vocational training courses designed for farmers, youth, and agri-entrepreneurs.'}
        image="https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=1600&q=80"
        gradientColor="#047857"
        icon={Clock}
        badgeBg="bg-emerald-600"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-4 lg:px-12 py-10">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
          <button
            onClick={() => navigate('/education')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isSinhala ? 'සියලු අධ්‍යාපන අංශ වෙත' : 'Back to Agro Education'}</span>
          </button>
        </div>

        {/* Coming Soon & AgroLoader Container - Direct without background card */}
        <div className="py-12 sm:py-16 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>{isSinhala ? 'අලුත්ම තොරතුරු එකතු වෙමින් පවතී' : 'New Updates Coming Soon'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {isSinhala ? 'ළඟදීම බලාපොරොත්තු වන්න' : 'Coming Soon'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            {isSinhala
              ? 'මෙම අංශයට අදාළ පාඨමාලා සහ ප්‍රායෝගික වැඩමුළු තොරතුරු ඉක්මනින්ම යාවත්කාලීන කරනු ලැබේ.'
              : 'Courses and practical workshop information for this section will be available very soon.'}
          </p>

          <div className="pt-4 flex justify-center">
            <AgroLoader
              message={isSinhala ? 'තොරතුරු සකස් වෙමින් පවතී...' : 'Preparing official course details...'}
              subMessage={isSinhala ? 'කරුණාකර රැඳී සිටින්න' : 'Please check back shortly'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
