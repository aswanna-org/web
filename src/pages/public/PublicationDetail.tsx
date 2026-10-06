import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, ArrowLeft, Sparkles } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';

export default function PublicationDetail() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-16">
      <SEO
        title={isSinhala ? 'කෘෂි ප්‍රකාශන විස්තර | Aswanna' : 'Publication Details | Aswanna'}
        description={isSinhala ? 'කෘෂිකාර්මික ප්‍රකාශන සහ අත්පොත් විස්තර.' : 'Official agricultural publication and manual details.'}
        canonical="/publications-manuals"
      />

      <PageHero
        title={isSinhala ? 'කෘෂි ප්‍රකාශන සහ අත්පොත්' : 'PUBLICATIONS & MANUALS'}
        description={isSinhala ? 'ගොවි අත්පොත්, මාර්ගෝපදේශ සහ ප්‍රකාශන.' : 'Farmer handbooks and technical manuals.'}
        image="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&q=80"
        gradientColor="#854d0e"
        icon={BookOpen}
        badgeBg="bg-amber-600"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-4 lg:px-12 py-10">
        <button
          onClick={() => navigate('/publications-manuals')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-full mb-8 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isSinhala ? 'සියලු කෘෂි ප්‍රකාශන වෙත' : 'Back to Publications'}</span>
        </button>

        {/* Coming Soon & AgroLoader Container - Direct without background card */}
        <div className="py-12 sm:py-16 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>{isSinhala ? 'ප්‍රකාශන එකතු වෙමින් පවතී' : 'Manuals Coming Soon'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {isSinhala ? 'ළඟදීම බලාපොරොත්තු වන්න' : 'Coming Soon'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            {isSinhala
              ? 'මෙම ප්‍රකාශනයට අදාළ අත්පොත සහ PDF බාගත කිරීමේ පහසුකම් ළඟදීම ලබාගත හැක.'
              : 'Digital manual and PDF downloads for this publication will be uploaded soon.'}
          </p>

          <div className="pt-4 flex justify-center">
            <AgroLoader
              message={isSinhala ? 'ප්‍රකාශන තොරතුරු සකස් වෙමින් පවතී...' : 'Preparing publication file...'}
              subMessage={isSinhala ? 'කරුණාකර රැඳී සිටින්න' : 'Please check back shortly'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
