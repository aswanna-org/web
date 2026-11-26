import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import PageHero from '../../components/public/PageHero';

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
}

const CLOUD_PALETTE = [
  { fill: '#e2f5dc' }, // Soft Leaf Green
  { fill: '#fff1d6' }, // Warm Peach
  { fill: '#daf0fc' }, // Sky Blue
  { fill: '#f0def8' }, // Soft Lavender
  { fill: '#fde2e6' }, // Soft Rose Pink
  { fill: '#fde8d4' }, // Soft Apricot Orange
  { fill: '#eef8ce' }, // Fresh Lime
  { fill: '#d5f3ed' }, // Mint Aqua
  { fill: '#fce4ec' }, // Blush Rose
  { fill: '#e8f5e9' }, // Pale Meadow Green
  { fill: '#ede7f6' }, // Pale Lilac
  { fill: '#e0f7fa' }, // Soft Cyan Ice
  { fill: '#fff8e1' }, // Pale Amber Cream
  { fill: '#fbe9e7' }, // Soft Coral Mist
  { fill: '#f3e5f5' }, // Light Heather Purple
  { fill: '#e8eaf6' }, // Periwinkle Mist
  { fill: '#e0f2f1' }, // Seafoam Mint
  { fill: '#f9fbe7' }, // Pale Chartreuse
  { fill: '#fff3e0' }, // Honey Peach
  { fill: '#f1f8e9' }, // Spring Sprout Green
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

export default function Loans() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [institutions, setInstitutions] = useState<InstitutionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/loans/public/institutions`);
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : (json.data || json.institutions || []);
          setInstitutions(list);
        }
      } catch (err) {
        console.error('Failed to fetch loan institutions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfdfa] flex items-center justify-center pt-24 pb-16">
        <AgroLoader message={isSinhala ? 'ණය යෝජනා ක්‍රම තොරතුරු පූරණය වෙමින් පවතී...' : 'Loading loan schemes information...'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfdfa] flex flex-col">
      <SEO
        title={isSinhala ? 'කෘෂිකාර්මික ණය යෝජනා ක්‍රම | Aswanna' : 'Agricultural Loan Schemes | Aswanna'}
        description={isSinhala
          ? 'ශ්‍රී ලංකාවේ ප්‍රමුඛ බැංකු හා රාජ්‍ය ආයතන මඟින් පිරිනමන කෘෂිකාර්මික ණය යෝජනා ක්‍රම සහ ප්‍රතිලාභ.'
          : 'Explore agricultural loan schemes and financial support from leading Sri Lankan banks and institutions.'}
      />

      <PageHero
        title={isSinhala ? 'කෘෂිකාර්මික ණය යෝජනා ක්‍රම' : 'Agricultural Loan Schemes'}
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

      {/* ── Institutions Grid Section ── */}
      <section className="w-full py-8 sm:py-12 bg-[#fbfdfa] flex-1">
        <div className="container mx-auto px-3 sm:px-6 lg:px-12">
          {institutions.length === 0 ? (
            <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100 max-w-lg mx-auto p-8 shadow-sm">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg sm:text-xl font-bold text-gray-700 mb-1">
                {isSinhala ? 'ආයතන හමු නොවීය' : 'No institutions found'}
              </p>
              <p className="text-xs sm:text-sm text-gray-400">
                {isSinhala ? 'මේ මොහොතේ සක්‍රීය ණය ක්‍රම සහිත ආයතන නොමැත.' : 'There are no active institutions at this moment.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
              {institutions.map((inst, index) => {
                const title = isSinhala ? (inst.nameSi || inst.name) : (inst.nameEn || inst.name);
                const parent = isSinhala ? (inst.ministryOrParentOrgSi || inst.ministryOrParentOrg) : (inst.ministryOrParentOrgEn || inst.ministryOrParentOrg);

                return (
                  <Link
                    key={inst.slug || index}
                    to={`/loans/institution/${inst.slug}`}
                    style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                    className="animate-card-pop group relative flex flex-col items-center justify-between p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-200/80 hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Top: Illustration with large organic cloud pastel background shape */}
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
                          {inst.loanCount} {isSinhala ? 'ණය යෝජනා' : 'Schemes'}
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
      </section>
    </div>
  );
}
