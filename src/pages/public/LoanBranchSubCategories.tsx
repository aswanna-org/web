import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Coins,
  Gift,
  Building2,
  Sparkles,
  Sprout,
  Wrench,
  Boxes,
  Layers
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import PageHero from '../../components/public/PageHero';
import Card from '../../components/ui/Card';

interface LoanSubCategory {
  id: string;
  slug: string;
  nameSi: string | null;
  nameEn: string | null;
  mainBranchId: string;
  mainBranch?: {
    id: string;
    slug: string;
    nameSi: string | null;
    nameEn: string | null;
  };
  _count?: { loans: number };
}

interface LoanMainBranch {
  id: string;
  slug: string;
  nameSi: string | null;
  nameEn: string | null;
  subCategories?: LoanSubCategory[];
  _count?: { loans: number; subCategories: number };
}

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'loans':
      return Coins;
    case 'financial-grants':
      return Sparkles;
    case 'equipment':
      return Wrench;
    case 'fertilizers':
      return Boxes;
    case 'plants-seedlings':
    case 'plants':
      return Sprout;
    case 'seeds-distribution':
    case 'seeds':
      return Sprout;
    case 'polytunnels-inputs':
    case 'inputs':
      return Layers;
    default:
      return Gift;
  }
};

const getCategoryThumbnail = (slug: string) => {
  switch (slug) {
    case 'loans':
      return 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80';
    case 'financial-grants':
      return 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80';
    case 'equipment':
      return 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=600&q=80';
    case 'fertilizers':
      return 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&q=80';
    case 'plants-seedlings':
    case 'plants':
      return 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=80';
    case 'seeds-distribution':
    case 'seeds':
      return 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&q=80';
    case 'polytunnels-inputs':
    case 'inputs':
      return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80';
    default:
      return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80';
  }
};

const getCategoryDescription = (slug: string, isSinhala: boolean) => {
  switch (slug) {
    case 'loans':
      return isSinhala
        ? 'රාජ්‍ය හා වාණිජ බැංකු මඟින් ලබා දෙන අඩු පොලී කෘෂි ණය'
        : 'Low-interest bank loan facilities and credit schemes';
    case 'financial-grants':
      return isSinhala
        ? 'ආපසු නොගෙවිය යුතු සෘජු මූල්‍ය ආධාර සහ ප්‍රදාන'
        : 'Non-repayable direct financial grants and subsidies';
    case 'equipment':
      return isSinhala
        ? 'යන්ත්‍රෝපකරණ හා නූතන කෘෂි උපකරණ සහනාධාර'
        : 'Subsidized farm machinery, pumps & equipment';
    case 'fertilizers':
      return isSinhala
        ? 'කාබනික හා රසායනික පොහොර ආධාර වැඩසටහන්'
        : 'Subsidized fertilizers and soil enrichment inputs';
    case 'plants-seedlings':
    case 'plants':
      return isSinhala
        ? 'සහතිකලත් ගුණාත්මක පැල ලබා දීමේ ව්‍යාපෘති'
        : 'Certified crop plants and fruit seedlings distribution';
    case 'seeds-distribution':
    case 'seeds':
      return isSinhala
        ? 'වී, ධාන්‍ය හා එළවළු බීජ බෙදාහැරීමේ වැඩසටහන්'
        : 'Certified seeds distribution for paddy and crops';
    case 'polytunnels-inputs':
    case 'inputs':
      return isSinhala
        ? 'ආරක්ෂිත ගෘහ හා බිංදු ජල පද්ධති සහනාධාර'
        : 'Greenhouses, polytunnels and micro-irrigation systems';
    default:
      return isSinhala
        ? 'කෘෂිකාර්මික සහන සහ යෙදවුම් ආධාර'
        : 'Agricultural support and input schemes';
  }
};

export default function LoanBranchSubCategories() {
  const { branchSlug } = useParams<{ branchSlug: string }>();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [branch, setBranch] = useState<LoanMainBranch | null>(null);
  const [subCategories, setSubCategories] = useState<LoanSubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [branchRes, subRes] = await Promise.all([
          fetch(`${API_BASE_URL}/loans/main-branches`),
          fetch(`${API_BASE_URL}/loans/sub-categories`),
        ]);

        if (branchRes.ok && subRes.ok) {
          const branchJson = await branchRes.json();
          const subJson = await subRes.json();

          const branchList: LoanMainBranch[] = branchJson.data || branchJson.items || [];
          const current = branchList.find(b => b.slug === branchSlug) || branchList[0];
          setBranch(current || null);

          if (current) {
            const allSubs: LoanSubCategory[] = subJson.data || subJson.items || [];
            const filtered = allSubs.filter(s => s.mainBranchId === current.id);
            setSubCategories(filtered);
          }
        }
      } catch (err) {
        console.error('Failed to fetch branch sub-categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL, branchSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfdfa] flex items-center justify-center pt-24 pb-16">
        <AgroLoader message={isSinhala ? 'උප වර්ගීකරණයන් පූරණය වෙමින් පවතී...' : 'Loading sub-categories...'} />
      </div>
    );
  }

  const isFinancial = branch?.slug === 'financial-support';
  const branchTitle = isSinhala
    ? (branch?.nameSi || branch?.nameEn || 'කෘෂිකාර්මික ආධාර')
    : (branch?.nameEn || 'Agricultural Support');

  return (
    <div className="min-h-screen bg-[#fbfdfa] flex flex-col">
      <SEO
        title={`${branchTitle} - ${isSinhala ? 'උප වර්ගීකරණ' : 'Sub-Categories'} | Aswanna`}
        description={isSinhala
          ? `${branchTitle} යටතේ ක්‍රියාත්මක වන කෘෂිකාර්මික ණය සහ සහනාධාර උප වර්ගීකරණයන්.`
          : `Explore sub-categories under ${branchTitle}.`}
      />

      <PageHero
        title={branchTitle}
        subtitle={isSinhala
          ? 'ඔබට අවශ්‍ය නිශ්චිත කාණ්ඩය තෝරා අදාළ ආයතන සහ ණය/ආධාර යෝජනා ක්‍රම වෙත පිවිසෙන්න'
          : 'Select a sub-category to browse participating institutions and available schemes'}
        image="/images/page-banners/loan_page_banner.jpeg"
        gradientColor={isFinancial ? '#054a29' : '#8a4b08'}
        icon={isFinancial ? Coins : Gift}
        badgeBg={isFinancial ? 'bg-[#054a29]' : 'bg-[#8a4b08]'}
        waveColor="text-[#fbfdfa]"
      >
        <Link
          to="/loans"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-white/80 hover:text-white text-xs sm:text-sm mt-3 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{isSinhala ? 'සියලු ප්‍රධාන අංශ වෙත' : 'Back to Main Branches'}</span>
        </Link>
      </PageHero>

      {/* ── SUB-CATEGORIES NEWS-STYLE CARDS GRID ── */}
      <section className="w-full py-8 sm:py-12 bg-[#fbfdfa] flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200/80">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isSinhala ? `${branchTitle} යටතේ පවතින කාණ්ඩ` : `Categories under ${branchTitle}`}
              </h2>
            </div>

            <Link
              to="/loans"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-emerald-800 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs hover:bg-gray-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isSinhala ? 'ප්‍රධාන අංශ වෙත' : 'Back to Branches'}</span>
            </Link>
          </div>

          {/* Sub-Categories Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {subCategories.map((sub) => {
              const IconComp = getCategoryIcon(sub.slug);
              const title = isSinhala ? (sub.nameSi || sub.nameEn || 'කාණ්ඩය') : (sub.nameEn || sub.nameSi || 'Category');
              const desc = getCategoryDescription(sub.slug, isSinhala);
              const image = getCategoryThumbnail(sub.slug);

              return (
                <div key={sub.id} className="h-full">
                  <Card
                    image={image}
                    icon={IconComp}
                    color={isFinancial ? '#006837' : '#d97706'}
                    badge={sub.nameEn?.toUpperCase() || 'CATEGORY'}
                    title={title}
                    subtitle={desc}
                    meta={[
                      {
                        icon: Building2,
                        text: `${sub._count?.loans || 0} ${isSinhala ? 'යෝජනා ක්‍රම' : 'Schemes'}`
                      }
                    ]}
                    to={`/loans/branch/${branchSlug}/${sub.slug}`}
                    primaryAction={{
                      text: isSinhala ? 'ආයතන බලන්න' : 'View Institutions'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
