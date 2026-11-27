import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Building2,
  Coins,
  Gift,
  Search,
  ShieldCheck,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import PageHero from '../../components/public/PageHero';
import Card from '../../components/ui/Card';

interface LoanScheme {
  id: string;
  slug: string;
  programNameSi: string | null;
  programNameEn: string | null;
  institutionName: string | null;
  institutionNameSi: string | null;
  institutionNameEn: string | null;
  ministryOrParentOrg: string | null;
  ministryOrParentOrgSi: string | null;
  ministryOrParentOrgEn: string | null;
  maxLoanAmount: string | null;
  annualInterestRate: string | null;
  repaymentPeriod: string | null;
  gracePeriod: string | null;
  benefitOrValue: string | null;
  benefitOrValueSi: string | null;
  benefitOrValueEn: string | null;
  institutionContribution: number | null;
  farmerContribution: number | null;
  logoBadgeUrl: string | null;
  coverBannerUrl: string | null;
  closingDate: string | null;
  isOngoing: boolean;
  isActive: boolean;
  sector?: { id: string; nameSi: string | null; nameEn: string | null } | null;
  targetBeneficiary?: { id: string; nameSi: string | null; nameEn: string | null } | null;
  mainBranch?: { id: string; slug: string; nameSi: string | null; nameEn: string | null } | null;
  subCategory?: { id: string; slug: string; nameSi: string | null; nameEn: string | null } | null;
}

interface InstitutionSummary {
  name: string;
  nameSi: string | null;
  nameEn: string | null;
  slug: string;
  logoBadgeUrl: string | null;
  coverBannerUrl: string | null;
  ministryOrParentOrg: string | null;
  ministryOrParentOrgSi: string | null;
  ministryOrParentOrgEn: string | null;
  authorityAddress: string | null;
  hotline: string | null;
  email: string | null;
  website: string | null;
  loanCount: number;
  loans?: LoanScheme[];
}

interface LoanSubCategory {
  id: string;
  slug: string;
  nameSi: string | null;
  nameEn: string | null;
  imageUrl?: string | null;
  mainBranchId: string;
  mainBranch?: {
    id: string;
    slug: string;
    nameSi: string | null;
    nameEn: string | null;
  };
}

const CLOUD_PALETTE = [
  { fill: '#e2f5dc' },
  { fill: '#fff1d6' },
  { fill: '#daf0fc' },
  { fill: '#f0def8' },
  { fill: '#fde2e6' },
  { fill: '#fde8d4' },
  { fill: '#eef8ce' },
  { fill: '#d5f3ed' },
  { fill: '#fce4ec' },
  { fill: '#e8f5e9' },
  { fill: '#ede7f6' },
  { fill: '#e0f7fa' },
  { fill: '#fff8e1' },
  { fill: '#fbe9e7' },
  { fill: '#f3e5f5' },
  { fill: '#e8eaf6' },
  { fill: '#e0f2f1' },
  { fill: '#f9fbe7' },
  { fill: '#fff3e0' },
  { fill: '#f1f8e9' },
];

const CLOUD_PATHS = [
  "M 25,90 C 5,90 2,65 18,48 C 30,30 55,34 70,22 C 86,5 122,5 142,18 C 162,28 175,38 186,50 C 200,64 198,90 182,108 C 166,126 142,130 124,136 C 96,146 64,142 45,126 C 28,112 25,98 25,90 Z",
  "M 20,82 C 2,82 0,55 16,38 C 30,22 58,26 72,16 C 90,4 128,4 146,18 C 164,30 178,36 190,52 C 202,68 198,95 180,114 C 162,130 138,132 120,138 C 96,148 62,145 42,126 C 24,108 20,92 20,82 Z",
  "M 28,95 C 6,95 2,68 18,50 C 32,32 58,38 72,25 C 90,8 126,6 146,18 C 166,28 180,44 192,54 C 206,70 202,98 184,116 C 166,132 142,134 122,140 C 94,150 64,144 46,128 C 30,114 26,102 28,95 Z",
  "M 22,86 C 4,86 0,60 16,42 C 32,24 60,30 74,18 C 92,4 130,4 148,18 C 166,30 182,40 192,58 C 204,78 198,104 178,122 C 158,134 134,134 116,140 C 90,150 60,144 42,124 C 26,106 22,94 22,86 Z",
];

function CloudBackground({ index }: { index: number }) {
  const color = CLOUD_PALETTE[index % CLOUD_PALETTE.length];
  const path = CLOUD_PATHS[index % CLOUD_PATHS.length];

  return (
    <svg
      viewBox="0 0 200 150"
      className="absolute inset-0 w-full h-full -z-0 transition-transform duration-300 group-hover:scale-105 pointer-events-none"
      preserveAspectRatio="none"
    >
      <path d={path} fill={color.fill} />
    </svg>
  );
}

export default function LoanSubCategoryInstitutions() {
  const { branchSlug, subCategorySlug } = useParams<{ branchSlug: string; subCategorySlug: string }>();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [subCategory, setSubCategory] = useState<LoanSubCategory | null>(null);
  const [institutions, setInstitutions] = useState<InstitutionSummary[]>([]);
  const [allLoans, setAllLoans] = useState<LoanScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'institutions' | 'schemes'>('institutions');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch sub-category info, institutions and schemes
        const [subRes, instRes, loansRes] = await Promise.all([
          fetch(`${API_BASE_URL}/loans/sub-categories`),
          fetch(`${API_BASE_URL}/loans/public/institutions?subCategorySlug=${subCategorySlug}`),
          fetch(`${API_BASE_URL}/loans?subCategorySlug=${subCategorySlug}&isActive=true`),
        ]);

        if (subRes.ok) {
          const subJson = await subRes.json();
          const subList: LoanSubCategory[] = subJson.data || subJson.items || [];
          const current = subList.find(s => s.slug === subCategorySlug);
          setSubCategory(current || null);
        }

        if (instRes.ok) {
          const instJson = await instRes.json();
          const list = Array.isArray(instJson) ? instJson : (instJson.data || instJson.institutions || []);
          setInstitutions(list);
        }

        if (loansRes.ok) {
          const loansJson = await loansRes.json();
          const items: LoanScheme[] = loansJson.data || loansJson.items || [];
          setAllLoans(items);
        }
      } catch (err) {
        console.error('Failed to fetch sub-category institutions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL, subCategorySlug]);

  const filteredInstitutions = useMemo(() => {
    if (!search.trim()) return institutions;
    const q = search.trim().toLowerCase();
    return institutions.filter(inst => {
      const name = (inst.name || '').toLowerCase();
      const nameSi = (inst.nameSi || '').toLowerCase();
      const nameEn = (inst.nameEn || '').toLowerCase();
      const parent = (inst.ministryOrParentOrg || '').toLowerCase();
      return name.includes(q) || nameSi.includes(q) || nameEn.includes(q) || parent.includes(q);
    });
  }, [institutions, search]);

  const filteredLoans = useMemo(() => {
    if (!search.trim()) return allLoans;
    const q = search.trim().toLowerCase();
    return allLoans.filter(l => {
      const titleSi = (l.programNameSi || '').toLowerCase();
      const titleEn = (l.programNameEn || '').toLowerCase();
      const inst = (l.institutionName || '').toLowerCase();
      return titleSi.includes(q) || titleEn.includes(q) || inst.includes(q);
    });
  }, [allLoans, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfdfa] flex items-center justify-center pt-24 pb-16">
        <AgroLoader message={isSinhala ? 'ආයතන සහ යෝජනා ක්‍රම පූරණය වෙමින් පවතී...' : 'Loading institutions and schemes...'} />
      </div>
    );
  }

  const isFinancial = branchSlug === 'financial-support';
  const isLoanScheme = subCategory?.slug === 'loans' || subCategory?.nameEn?.toLowerCase() === 'loans';
  const subCatTitle = isSinhala
    ? (subCategory?.nameSi || subCategory?.nameEn || 'කෘෂිකාර්මික යෝජනා ක්‍රම')
    : (subCategory?.nameEn || 'Agricultural Schemes');

  return (
    <div className="min-h-screen bg-[#fbfdfa] flex flex-col">
      <SEO
        title={`${subCatTitle} | Aswanna`}
        description={isSinhala
          ? `${subCatTitle} සපයන නිල බැංකු සහ ආයතන ලැයිස්තුව සහ ලබා ගත හැකි සියලු යෝජනා ක්‍රම.`
          : `Explore institutions and schemes offering ${subCatTitle}.`}
      />

      <PageHero
        title={subCatTitle}
        subtitle={isSinhala
          ? 'මෙම කාණ්ඩය යටතේ සක්‍රීයව ක්‍රියාත්මක වන නිල ආයතන සහ වැඩසටහන්'
          : 'Participating financial institutions, government bodies, and available support schemes'}
        image={subCategory?.imageUrl || "/images/page-banners/loan_page_banner.jpeg"}
        gradientColor={isFinancial ? '#054a29' : '#8a4b08'}
        icon={isLoanScheme ? Coins : Gift}
        badgeBg={isFinancial ? 'bg-[#054a29]' : 'bg-[#8a4b08]'}
        waveColor="text-[#fbfdfa]"
      >
        <Link
          to={branchSlug ? `/loans/branch/${branchSlug}` : '/loans'}
          className="inline-flex items-center gap-1.5 sm:gap-2 text-white/80 hover:text-white text-xs sm:text-sm mt-3 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{isSinhala ? 'සියලු උප වර්ගීකරණ වෙත' : 'Back to Sub-Categories'}</span>
        </Link>
      </PageHero>

      {/* ── MAIN CONTENT SECTION ── */}
      <section className="w-full py-8 sm:py-12 bg-[#fbfdfa] flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          {/* Header Bar with View Toggle & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200/80">
            <div>
              <span className="text-xs font-semibold text-emerald-800">
                {isFinancial ? (isSinhala ? 'මූල්‍ය සහයෝගයන්' : 'Financial Support') : (isSinhala ? 'ද්‍රව්‍යමය ආධාර සහ යෙදවුම්' : 'Material Support')}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
                {subCatTitle}
              </h2>
            </div>

            {/* Toggle Tabs (Institutions vs Schemes) & Search */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Tab Switcher */}
              <div className="flex items-center p-1 bg-gray-100/90 rounded-full border border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('institutions')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'institutions'
                      ? 'bg-white text-emerald-900 shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSinhala ? 'ආයතන' : 'Institutions'} ({institutions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('schemes')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'schemes'
                      ? 'bg-white text-emerald-900 shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSinhala ? 'යෝජනා ක්‍රම' : 'Schemes'} ({allLoans.length})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative flex-1 md:w-60">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isSinhala ? 'සොයන්න...' : 'Search...'}
                  className="w-full pl-9 pr-8 py-1.5 rounded-full border border-gray-200 bg-white hover:border-emerald-500/60 focus:border-[#006837] focus:ring-2 focus:ring-[#006837]/15 outline-none transition-all text-xs text-gray-800 shadow-2xs"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── TAB 1: INSTITUTIONS GRID ── */}
          {activeTab === 'institutions' && (
            <div>
              {filteredInstitutions.length === 0 ? (
                <div className="py-16 sm:py-24 text-center max-w-lg mx-auto flex flex-col items-center justify-center">
                  <AgroLoader
                    message={isSinhala ? 'මෙම කාණ්ඩයට අදාළ ආයතන සහ යෝජනා ක්‍රම සකස් වෙමින් පවතී...' : 'Preparing institutions and schemes...'}
                    subMessage={isSinhala ? 'කරුණාකර රැඳී සිටින්න' : 'Please check back soon'}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                  {filteredInstitutions.map((inst, index) => {
                    const title = isSinhala ? (inst.nameSi || inst.name) : (inst.nameEn || inst.name);
                    const parent = isSinhala ? (inst.ministryOrParentOrgSi || inst.ministryOrParentOrg) : (inst.ministryOrParentOrgEn || inst.ministryOrParentOrg);

                    return (
                      <Link
                        key={inst.slug || index}
                        to={`/loans/institution/${inst.slug}`}
                        style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                        className="animate-card-pop group relative flex flex-col items-center justify-between p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-200/80 hover:-translate-y-1 transition-all duration-300"
                      >
                        {/* Top: Illustration with organic cloud background shape */}
                        <div className="w-full aspect-square max-w-[95px] sm:max-w-[135px] md:max-w-[150px] flex items-center justify-center relative">
                          <CloudBackground index={index} />
                          {inst.logoBadgeUrl ? (
                            <img
                              src={inst.logoBadgeUrl}
                              alt={title}
                              className="w-full h-full max-w-[85%] max-h-[85%] object-contain relative z-10 drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/80 shadow-inner flex items-center justify-center relative z-10 text-emerald-700 transition-transform duration-300 group-hover:scale-110">
                              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-700" />
                            </div>
                          )}
                        </div>

                        {/* Middle: Title & Metadata */}
                        <div className="w-full text-center my-1 px-1">
                          <h3 className="font-bold text-[11px] sm:text-xs md:text-sm text-gray-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight">
                            {title}
                          </h3>
                          {parent && (
                            <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                              {parent}
                            </p>
                          )}
                          <div className="mt-1">
                            <span className="inline-block text-[9.5px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/60">
                              {inst.loanCount} {isSinhala ? (isLoanScheme ? 'ණය යෝජනා' : 'වැඩසටහන්') : 'Schemes'}
                            </span>
                          </div>
                        </div>

                        {/* Bottom: Circular Green Chevron Button */}
                        <div className="mt-1 pb-0.5">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-emerald-700 group-hover:bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:shadow-emerald-600/30 group-hover:scale-110 transition-all duration-300">
                            <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 stroke-[2.5]" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: SCHEMES LIST GRID ── */}
          {activeTab === 'schemes' && (
            <div>
              {filteredLoans.length === 0 ? (
                <div className="py-16 sm:py-24 text-center max-w-lg mx-auto flex flex-col items-center justify-center">
                  <AgroLoader
                    message={isSinhala ? 'මෙම කාණ්ඩයට අදාළ යෝජනා ක්‍රම සකස් වෙමින් පවතී...' : 'Preparing schemes for this category...'}
                    subMessage={isSinhala ? 'කරුණාකර රැඳී සිටින්න' : 'Please check back soon'}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                  {filteredLoans.map((loan) => {
                    const programName = isSinhala
                      ? (loan.programNameSi || loan.programNameEn || 'කෘෂිකාර්මික වැඩසටහන')
                      : (loan.programNameEn || loan.programNameSi || 'Agricultural Scheme');

                    const instName = isSinhala
                      ? (loan.institutionNameSi || loan.institutionName || 'ආයතනය')
                      : (loan.institutionNameEn || loan.institutionName || 'Institution');

                    const isLoan = isLoanScheme && !loan.benefitOrValue;
                    const beneficiaryName = isSinhala
                      ? (loan.targetBeneficiary?.nameSi || loan.targetBeneficiary?.nameEn)
                      : (loan.targetBeneficiary?.nameEn || loan.targetBeneficiary?.nameSi);

                    return (
                      <div key={loan.id} className="h-full">
                        <Card
                          image={loan.coverBannerUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80'}
                          icon={isLoan ? Coins : Gift}
                          color={isLoan ? '#006837' : '#d97706'}
                          badge={isSinhala ? (loan.sector?.nameSi || (loan.isOngoing ? 'ක්‍රියාත්මකයි' : 'යෝජනා ක්‍රමය')) : (loan.sector?.nameEn || 'SCHEME')}
                          topRightBadge={
                            loan.logoBadgeUrl ? (
                              <img
                                src={loan.logoBadgeUrl}
                                alt=""
                                className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-md bg-white/90 p-0.5 shadow-xs border border-white/60"
                              />
                            ) : undefined
                          }
                          title={programName}
                          subtitle={instName + (beneficiaryName ? ` • ${beneficiaryName}` : '')}
                          meta={
                            isLoan
                              ? [
                                  {
                                    icon: Coins,
                                    text: loan.maxLoanAmount ? `රු. ${loan.maxLoanAmount}` : (isSinhala ? 'ණය: විමසන්න' : 'Amount: Inquire')
                                  },
                                  {
                                    icon: ShieldCheck,
                                    text: loan.annualInterestRate ? `පොලිය: ${loan.annualInterestRate}` : (loan.repaymentPeriod || (isSinhala ? 'නියමිතයි' : 'Standard'))
                                  }
                                ]
                              : [
                                  {
                                    icon: Gift,
                                    text: loan.benefitOrValue || (isSinhala ? 'නොමිලේ / ප්‍රදානය' : 'Free Grant')
                                  },
                                  {
                                    icon: ShieldCheck,
                                    text: `${isSinhala ? 'ආයතන දායකත්වය' : 'Inst Share'}: ${loan.institutionContribution ?? 100}%`
                                  }
                                ]
                          }
                          to={`/loans/${loan.slug}`}
                          primaryAction={{
                            text: isSinhala ? 'විස්තර බලන්න' : 'View Details'
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
