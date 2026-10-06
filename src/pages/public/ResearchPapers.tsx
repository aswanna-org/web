import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, ArrowLeft, Sparkles } from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';

export default function ResearchPapers() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-16">
      <SEO
        title={isSinhala ? 'කෘෂිකාර්මික පර්යේෂණ පත්‍රිකා | Aswanna' : 'Research Papers | Aswanna'}
        description={isSinhala ? 'නවතම කෘෂිකාර්මික පර්යේෂණ, විද්‍යාත්මක සොයාගැනීම් සහ විශ්ලේෂණාත්මක අධ්‍යයන වාර්තා.' : 'Agricultural research papers, scientific journal publications and case studies in Sri Lanka.'}
        canonical="/research-papers"
      />

      <PageHero
        title={isSinhala ? 'පර්යේෂණ පත්‍රිකා' : 'RESEARCH PAPERS'}
        description={isSinhala ? 'නවතම කෘෂිකාර්මික පර්යේෂණ, විද්‍යාත්මක සොයාගැනීම් සහ විශ්ලේෂණාත්මක අධ්‍යයන වාර්තා ගවේෂණය කරන්න.' : 'Explore published scientific research papers, peer-reviewed journals, and empirical agricultural studies.'}
        image="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80"
        gradientColor="#1e3a8a"
        icon={FileText}
        badgeBg="bg-blue-600"
        waveColor="text-gray-50"
      />

      <div className="container mx-auto px-4 lg:px-12 py-10">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
          <button
            onClick={() => navigate('/education')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isSinhala ? 'සියලු අධ්‍යාපන අංශ වෙත' : 'Back to Agro Education'}</span>
          </button>
        </div>

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
              ? 'කෘෂිකාර්මික පර්යේෂණ පත්‍රිකා සහ විද්‍යාත්මක සොයාගැනීම් පිළිබඳ වාර්තා ළඟදීම එක් කෙරේ.'
              : 'Empirical research papers and agricultural studies will be published here shortly.'}
          </p>

          <div className="pt-4 flex justify-center">
            <AgroLoader
              message={isSinhala ? 'පර්යේෂණ තොරතුරු යාවත්කාලීන වෙමින් පවතී...' : 'Indexing scientific research papers...'}
              subMessage={isSinhala ? 'කරුණාකර රැඳී සිටින්න' : 'Please check back soon'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
