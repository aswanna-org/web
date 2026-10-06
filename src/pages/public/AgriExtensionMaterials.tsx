import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layers, ArrowLeft, Sparkles } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';

export default function AgriExtensionMaterials() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-16">
      <SEO
        title={isSinhala ? 'කෘෂි ව්‍යාප්ති ඉගෙනුම් ද්‍රව්‍ය | Aswanna' : 'Agri Extension Materials | Aswanna'}
        description={isSinhala ? 'ගොවීන්, ව්‍යවසායකයින් සහ ශිෂ්‍යයින් සඳහා උපදෙස්, වීඩියෝ හා ඩිජිටල් ඉගෙනුම් මෙවලම්.' : 'Farmer guidance kits, video tutorials, digital infographics, posters, and field guides.'}
        canonical="/agri-extension-materials"
      />

      <PageHero
        title={isSinhala ? 'කෘෂි ව්‍යාප්ති ඉගෙනුම් ද්‍රව්‍ය' : 'AGRI EXTENSION & LEARNING MATERIALS'}
        description={isSinhala ? 'ගොවීන්, ව්‍යවසායකයින් සහ ශිෂ්‍යයින් සඳහා වීඩියෝ උපදෙස්, ඡායාරූපමය පෝස්ටර් සහ ශ්‍රව්‍ය ඉගෙනුම් මෙවලම්.' : 'Interactive video tutorials, extension posters, step-by-step infographics, and field learning kits.'}
        image="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80"
        gradientColor="#0f766e"
        icon={Layers}
        badgeBg="bg-teal-600"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-4 lg:px-12 py-10">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
          <button
            onClick={() => navigate('/education')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isSinhala ? 'සියලු අධ්‍යාපන අංශ වෙත' : 'Back to Agro Education'}</span>
          </button>
        </div>

        {/* Coming Soon & AgroLoader Container - Direct without background card */}
        <div className="py-12 sm:py-16 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100/70 border border-teal-200 text-teal-800 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
            <span>{isSinhala ? 'ඉගෙනුම් ද්‍රව්‍ය සකස් වෙමින් පවතී' : 'Extension Materials Pending'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {isSinhala ? 'ළඟදීම බලාපොරොත්තු වන්න' : 'Coming Soon'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            {isSinhala
              ? 'වීඩියෝ පාඩම් මාලා, ව්‍යාප්ති පෝස්ටර් සහ ඩිජිටල් ඉගෙනුම් කට්ටල ළඟදීම මුදා හැරේ.'
              : 'Video tutorials, extension infographics, and field learning kits will be published soon.'}
          </p>

          <div className="pt-4 flex justify-center">
            <AgroLoader
              message={isSinhala ? 'ඉගෙනුම් ද්‍රව්‍ය සකස් වෙමින් පවතී...' : 'Preparing digital extension learning packages...'}
              subMessage={isSinhala ? 'කරුණාකර රැඳී සිටින්න' : 'Please check back shortly'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
