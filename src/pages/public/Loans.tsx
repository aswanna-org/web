import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Coins,
  Gift,
  Layers,
  ShieldCheck
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
  _count?: { loans: number };
}

interface LoanMainBranch {
  id: string;
  slug: string;
  nameSi: string | null;
  nameEn: string | null;
  imageUrl?: string | null;
  subCategories?: LoanSubCategory[];
  _count?: { loans: number; subCategories: number };
}

export default function Loans() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [branches, setBranches] = useState<LoanMainBranch[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/loans/main-branches`);
        if (res.ok) {
          const json = await res.json();
          const list: LoanMainBranch[] = json.data || json.items || [];
          setBranches(list);
        }
      } catch (err) {
        console.error('Failed to fetch main branches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfdfa] flex items-center justify-center pt-24 pb-16">
        <AgroLoader message={isSinhala ? 'ණය සහ ආධාර අංශ පූරණය වෙමින් පවතී...' : 'Loading loan & support branches...'} />
      </div>
    );
  }

  const financialBranch = branches.find(b => b.slug === 'financial-support') || branches[0];
  const materialBranch = branches.find(b => b.slug === 'material-support') || branches[1];

  return (
    <div className="min-h-screen bg-[#fbfdfa] flex flex-col">
      <SEO
        title={isSinhala ? 'කෘෂිකාර්මික ණය සහ ආධාර යෝජනා ක්‍රම | Aswanna' : 'Agricultural Loan & Aid Schemes | Aswanna'}
        description={isSinhala
          ? 'ශ්‍රී ලංකාවේ ප්‍රමුඛ බැංකු හා රාජ්‍ය ආයතන මඟින් පිරිනමන කෘෂිකාර්මික ණය, මූල්‍ය ආධාර සහ ද්‍රව්‍යමය යෙදවුම් යෝජනා ක්‍රම.'
          : 'Explore agricultural loans, financial grants, and material support schemes from leading Sri Lankan banks and institutions.'}
      />

      <PageHero
        title={isSinhala ? 'කෘෂිකාර්මික ණය සහ සහනාධාර යෝජනා ක්‍රම' : 'Agricultural Loans & Support Schemes'}
        subtitle={isSinhala
          ? 'මූල්‍ය සහයෝගයන් සහ ද්‍රව්‍යමය ආධාර සපයන නිල ආයතන හා වැඩසටහන්'
          : 'Explore official government and bank schemes for agricultural credit, grants, and material inputs'}
        image="/images/page-banners/loan_page_banner.jpeg"
        gradientColor="#054a29"
        icon={Building2}
        badgeBg="bg-[#054a29]"
        waveColor="text-[#fbfdfa]"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-white/80 hover:text-white text-xs sm:text-sm mt-3 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{isSinhala ? 'මුල් පිටුව වෙත' : 'Back to Home'}</span>
        </Link>
      </PageHero>

      {/* ── 2 NEWS-STYLE CARDS SECTION ── */}
      <section className="w-full py-8 sm:py-12 bg-[#fbfdfa] flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          {/* Left-aligned Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {/* Card 1: Financial Support */}
            {financialBranch && (
              <div className="h-full">
                <Card
                  image={financialBranch.imageUrl || "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80"}
                  icon={Coins}
                  color="#006837"
                  badge={isSinhala ? "01 • මූල්‍ය සහයෝගයන්" : "01 • FINANCIAL SUPPORT"}
                  title={isSinhala ? (financialBranch.nameSi || 'මූල්‍ය සහයෝගයන්') : (financialBranch.nameEn || 'Financial Support')}
                  subtitle={isSinhala ? 'ණය පහසුකම් සහ මූල්‍ය ආධාර / ප්‍රදාන' : 'Loans & Non-repayable Financial Grants'}
                  meta={[
                    {
                      icon: Layers,
                      text: `${financialBranch._count?.subCategories || 2} ${isSinhala ? 'උප වර්ගීකරණ' : 'Sub-categories'}`
                    },
                    {
                      icon: ShieldCheck,
                      text: isSinhala ? 'රාජ්‍ය හා වාණිජ බැංකු' : 'State & Commercial Banks'
                    }
                  ]}
                  to={`/loans/branch/${financialBranch.slug}`}
                  primaryAction={{
                    text: isSinhala ? 'අංශයට පිවිසෙන්න' : 'Explore Branch'
                  }}
                />
              </div>
            )}

            {/* Card 2: Material Support */}
            {materialBranch && (
              <div className="h-full">
                <Card
                  image={materialBranch.imageUrl || "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80"}
                  icon={Gift}
                  color="#d97706"
                  badge={isSinhala ? "02 • ද්‍රව්‍යමය ආධාර" : "02 • MATERIAL SUPPORT"}
                  title={isSinhala ? (materialBranch.nameSi || 'ද්‍රව්‍යමය ආධාර සහ යෙදවුම්') : (materialBranch.nameEn || 'Material Support')}
                  subtitle={isSinhala ? 'කෘෂිකාර්මික උපකරණ, පොහොර, පැල, බීජ සහ යෙදවුම්' : 'Machinery, Fertilizers, Seeds, Plants & Inputs'}
                  meta={[
                    {
                      icon: Layers,
                      text: `${materialBranch._count?.subCategories || 5} ${isSinhala ? 'උප වර්ගීකරණ' : 'Sub-categories'}`
                    },
                    {
                      icon: ShieldCheck,
                      text: isSinhala ? 'කෘෂිකර්ම දෙපාර්තමේන්තුව' : 'Department of Agriculture'
                    }
                  ]}
                  to={`/loans/branch/${materialBranch.slug}`}
                  primaryAction={{
                    text: isSinhala ? 'අංශයට පිවිසෙන්න' : 'Explore Branch'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
