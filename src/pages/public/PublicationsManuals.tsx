import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, ArrowLeft, Sparkles } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';

export default function PublicationsManuals() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-16">
      <SEO
        title={isSinhala ? 'කෘෂි ප්‍රකාශන සහ අත්පොත් | Aswanna' : 'Publications & Manuals | Aswanna'}
        description={isSinhala ? 'ගොවි අත්පොත්, මාර්ගෝපදේශ සංග්‍රහ සහ කෘෂිකාර්මික තාක්ෂණික ප්‍රකාශන.' : 'Farmer handbooks, technical manuals, crop guides, and official agricultural publications.'}
        canonical="/publications-manuals"
      />

      <PageHero
        title={isSinhala ? 'කෘෂි ප්‍රකාශන සහ අත්පොත්' : 'PUBLICATIONS & MANUALS'}
        description={isSinhala ? 'ගොවි අත්පොත්, තාක්ෂණික මාර්ගෝපදේශ සංග්‍රහ සහ නිල කෘෂිකාර්මික ප්‍රකාශන ලබාගන්න.' : 'Download official farmer handbooks, crop protection guides, technical standards, and field reference manuals.'}
        image="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&q=80"
        gradientColor="#854d0e"
        icon={BookOpen}
        badgeBg="bg-amber-600"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-4 lg:px-12 py-10">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
          <button
            onClick={() => navigate('/education')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isSinhala ? 'සියලු අධ්‍යාපන අංශ වෙත' : 'Back to Agro Education'}</span>
          </button>
        </div>

        {/* Coming Soon & AgroLoader Container - Direct without background card */}
        <div className="py-12 sm:py-16 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>{isSinhala ? 'ප්‍රකාශන එකතු වෙමින් පවතී' : 'Manuals & Guides Coming Soon'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {isSinhala ? 'ළඟදීම බලාපොරොත්තු වන්න' : 'Coming Soon'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            {isSinhala
              ? 'නිල ගොවි අත්පොත්, මාර්ගෝපදේශ සංග්‍රහ සහ තාක්ෂණික ප්‍රකාශන ළඟදීම ලබාගත හැක.'
              : 'Official farmer manuals, technical guides and digital publications will be uploaded soon.'}
          </p>

          <div className="pt-4 flex justify-center">
            <AgroLoader
              message={isSinhala ? 'ප්‍රකාශන එකතුව සූදානම් වෙමින් පවතී...' : 'Preparing agricultural publications library...'}
              subMessage={isSinhala ? 'කරුණාකර රැඳී සිටින්න' : 'Please check back shortly'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
