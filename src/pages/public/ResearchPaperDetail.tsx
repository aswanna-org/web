import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, ArrowLeft, Sparkles } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';

export default function ResearchPaperDetail() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-16">
      <SEO
        title={isSinhala ? 'පර්යේෂණ පත්‍රිකා විස්තර | Aswanna' : 'Research Paper Details | Aswanna'}
        description={isSinhala ? 'කෘෂිකාර්මික පර්යේෂණ පත්‍රිකා විස්තර.' : 'Scientific research paper publication details.'}
        canonical="/research-papers"
      />

      <PageHero
        title={isSinhala ? 'පර්යේෂණ පත්‍රිකා' : 'RESEARCH PAPERS'}
        description={isSinhala ? 'විද්‍යාත්මක සොයාගැනීම් සහ පර්යේෂණ වාර්තා.' : 'Scientific discoveries and published papers.'}
        image="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80"
        gradientColor="#1e3a8a"
        icon={FileText}
        badgeBg="bg-blue-600"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-4 lg:px-12 py-10">
        <button
          onClick={() => navigate('/research-papers')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-full mb-8 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isSinhala ? 'සියලු පර්යේෂණ පත්‍රිකා වෙත' : 'Back to Research Papers'}</span>
        </button>

        {/* Coming Soon & AgroLoader Container - Direct without background card */}
        <div className="py-12 sm:py-16 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>{isSinhala ? 'පර්යේෂණ පත්‍රිකා එකතු වෙමින් පවතී' : 'Research Publications Pending'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {isSinhala ? 'ළඟදීම බලාපොරොත්තු වන්න' : 'Coming Soon'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            {isSinhala
              ? 'මෙම පර්යේෂණ පත්‍රිකාවේ පූර්ණ විස්තරය සහ PDF වාර්තාව ළඟදීම ලබාගත හැක.'
              : 'Full abstract and PDF document for this research paper will be available shortly.'}
          </p>

          <div className="pt-4 flex justify-center">
            <AgroLoader
              message={isSinhala ? 'පර්යේෂණ තොරතුරු යාවත්කාලීන වෙමින් පවතී...' : 'Indexing research document...'}
              subMessage={isSinhala ? 'කරුණාකර රැඳී සිටින්න' : 'Please check back soon'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
