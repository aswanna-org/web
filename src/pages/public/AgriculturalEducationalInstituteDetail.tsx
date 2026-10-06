import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Landmark, ArrowLeft, Sparkles } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';

export default function AgriculturalEducationalInstituteDetail() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-16">
      <SEO
        title={isSinhala ? 'කෘෂිකාර්මික අධ්‍යාපන ආයතන විස්තර | Aswanna' : 'Institute Details | Aswanna'}
        description={isSinhala ? 'කෘෂිකාර්මික අධ්‍යාපන ආයතන විස්තර.' : 'Agricultural institute details and courses.'}
        canonical="/agricultural-educational-institutes"
      />

      <PageHero
        title={isSinhala ? 'කෘෂිකාර්මික අධ්‍යාපන ආයතන' : 'AGRICULTURAL EDUCATIONAL INSTITUTES'}
        description={isSinhala ? 'විශ්වවිද්‍යාල, විද්‍යාල සහ පුහුණු මධ්‍යස්ථාන.' : 'Universities, colleges, and training institutes.'}
        image="https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80"
        gradientColor="#065f46"
        icon={Landmark}
        badgeBg="bg-emerald-700"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-4 lg:px-12 py-10">
        <button
          onClick={() => navigate('/agricultural-educational-institutes')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-full mb-8 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isSinhala ? 'සියලු අධ්‍යාපන ආයතන වෙත' : 'Back to Institutes'}</span>
        </button>

        {/* Coming Soon & AgroLoader Container - Direct without background card */}
        <div className="py-12 sm:py-16 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>{isSinhala ? 'ආයතන විස්තර සකස් වෙමින් පවතී' : 'Institute Details Coming Soon'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {isSinhala ? 'ළඟදීම බලාපොරොත්තු වන්න' : 'Coming Soon'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            {isSinhala
              ? 'මෙම ආයතනයට අදාළ සම්පූර්ණ තොරතුරු සහ පවත්වනු ලබන පාඨමාලා විස්තර ළඟදීම ලබාගත හැක.'
              : 'Full institutional details and offered courses for this campus will be available shortly.'}
          </p>

          <div className="pt-4 flex justify-center">
            <AgroLoader
              message={isSinhala ? 'ආයතන තොරතුරු සකස් වෙමින් පවතී...' : 'Preparing institute details...'}
              subMessage={isSinhala ? 'කරුණාකර රැඳී සිටින්න' : 'Please check back soon'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
