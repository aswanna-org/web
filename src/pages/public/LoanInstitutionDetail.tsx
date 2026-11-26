import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  PhoneCall,
  Mail,
  ExternalLink,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Building2,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import PageHero from '../../components/public/PageHero';

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
  logoBadgeUrl: string | null;
  coverBannerUrl: string | null;
  closingDate: string | null;
  isOngoing: boolean;
  isActive: boolean;
  sector?: { id: string; nameSi: string | null; nameEn: string | null } | null;
  targetBeneficiary?: { id: string; nameSi: string | null; nameEn: string | null } | null;
  mainBranch?: { id: string; nameSi: string | null; nameEn: string | null } | null;
  subCategory?: { id: string; nameSi: string | null; nameEn: string | null } | null;
  pdfAttachments?: any[];
}

interface InstitutionDetail {
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
  loans: LoanScheme[];
}

export default function LoanInstitutionDetail() {
  const { institutionSlug } = useParams<{ institutionSlug: string }>();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [institution, setInstitution] = useState<InstitutionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/loans/public/institutions/${institutionSlug}`);
        if (!res.ok) {
          throw new Error('Institution not found');
        }
        const json = await res.json();
        const data = json.data || json.institution;
        setInstitution(data);
      } catch (err: any) {
        console.error('Failed to load institution loans:', err);
        setError(err.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    if (institutionSlug) {
      fetchInstitution();
    }
  }, [API_BASE_URL, institutionSlug]);

  const filteredLoans = useMemo(() => {
    if (!institution?.loans) return [];
    if (!search.trim()) return institution.loans;
    const q = search.trim().toLowerCase();
    return institution.loans.filter((loan) => {
      const pSi = (loan.programNameSi || '').toLowerCase();
      const pEn = (loan.programNameEn || '').toLowerCase();
      const secSi = (loan.sector?.nameSi || '').toLowerCase();
      const secEn = (loan.sector?.nameEn || '').toLowerCase();
      const benSi = (loan.targetBeneficiary?.nameSi || '').toLowerCase();
      const benEn = (loan.targetBeneficiary?.nameEn || '').toLowerCase();
      return pSi.includes(q) || pEn.includes(q) || secSi.includes(q) || secEn.includes(q) || benSi.includes(q) || benEn.includes(q);
    });
  }, [institution, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfdfa] flex items-center justify-center pt-24 pb-16">
        <AgroLoader message={isSinhala ? 'ආයතනයේ ණය යෝජනා ක්‍රම තොරතුරු පූරණය වෙමින් පවතී...' : 'Loading institution loan schemes...'} />
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="min-h-screen bg-[#fbfdfa] flex flex-col items-center justify-center p-6 text-center">
        <AgroLoader
          message={isSinhala ? 'ආයතනයේ ණය යෝජනා ක්‍රම සකස් වෙමින් පවතී...' : 'Preparing institution loan schemes...'}
          subMessage={isSinhala ? 'කරුණාකර රැඳී සිටින්න' : 'Please check back soon'}
        />
        <div className="mt-8">
          <Link
            to="/loans"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isSinhala ? 'සියලු ආයතන වෙත' : 'Back to All Institutions'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const instTitle = isSinhala ? (institution.nameSi || institution.name) : (institution.nameEn || institution.name);
  const ministryTitle = isSinhala
    ? (institution.ministryOrParentOrgSi || institution.ministryOrParentOrg)
    : (institution.ministryOrParentOrgEn || institution.ministryOrParentOrg);

  const bannerImg = institution.coverBannerUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1600';

  return (
    <div className="min-h-screen bg-[#fbfdfa] flex flex-col">
      <SEO
        title={`${instTitle} | ${isSinhala ? 'කෘෂිකාර්මික ණය යෝජනා' : 'Agricultural Loan Schemes'}`}
        description={`${instTitle} ${isSinhala ? 'මඟින් ලබා දෙන කෘෂිකාර්මික ණය යෝජනා ක්‍රම' : 'Agricultural credit and loan schemes'}`}
      />

      {/* ── Standard PageHero Section ── */}
      <PageHero
        title={instTitle}
        subtitle={ministryTitle || undefined}
        image={bannerImg}
        gradientColor="#054a29"
        icon={institution.logoBadgeUrl ? undefined : Building2}
        iconUrl={institution.logoBadgeUrl || undefined}
        badgeBg="bg-[#054a29]"
        waveColor="text-[#fbfdfa]"
      >
        <Link
          to="/loans"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-white/80 hover:text-white text-xs sm:text-sm mt-3 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{isSinhala ? 'සියලු ආයතන වෙත' : 'All Institutions'}</span>
        </Link>
      </PageHero>

      {/* ── Search Bar Section ── */}
      <section className="animate-fade-smooth w-full py-4 sm:py-6 bg-[#fbfdfa] border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">
              {isSinhala ? 'ණය යෝජනා ක්‍රම' : 'Available Loan Schemes'}
            </h2>
            <p className="text-xs text-gray-500">
              {isSinhala
                ? `මෙම ආයතනය යටතේ සක්‍රීය ණය ක්‍රම ${institution.loans.length} ක් ඇත`
                : `${institution.loans.length} active schemes available`}
            </p>
          </div>

          <div className="relative w-full sm:w-80 group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isSinhala ? 'ණය යෝජනා ක්‍රම සොයන්න...' : 'Search schemes...'}
              className="w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-full border border-gray-200/90 bg-white hover:border-emerald-500/60 focus:border-[#006837] focus:ring-3 focus:ring-[#006837]/15 outline-none transition-all duration-200 text-xs sm:text-sm text-gray-800 shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Loan Schemes Cards Grid ── */}
      <section className="w-full py-8 sm:py-12 bg-[#fbfdfa] flex-1">
        <div className="container mx-auto px-4 lg:px-12">
          {filteredLoans.length === 0 ? (
            <div className="py-16 sm:py-24 text-center max-w-lg mx-auto flex flex-col items-center justify-center">
              <AgroLoader
                message={isSinhala ? 'මෙම සෙවුමට අදාළ ණය යෝජනා ක්‍රම සකස් වෙමින් පවතී...' : 'Preparing loan schemes...'}
                subMessage={isSinhala ? 'කරුණාකර රැඳී සිටින්න' : 'Please check back soon'}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLoans.map((loan) => {
                const programName = isSinhala
                  ? (loan.programNameSi || loan.programNameEn || 'කෘෂිකාර්මික ණය යෝජනා ක්‍රමය')
                  : (loan.programNameEn || loan.programNameSi || 'Agricultural Loan Scheme');

                const sectorName = isSinhala
                  ? (loan.sector?.nameSi || loan.sector?.nameEn)
                  : (loan.sector?.nameEn || loan.sector?.nameSi);

                const beneficiaryName = isSinhala
                  ? (loan.targetBeneficiary?.nameSi || loan.targetBeneficiary?.nameEn)
                  : (loan.targetBeneficiary?.nameEn || loan.targetBeneficiary?.nameSi);

                return (
                  <div
                    key={loan.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-200/80 transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                  >
                    {/* Card Header */}
                    <div className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        {/* Sector or Status Badge */}
                        <div className="flex flex-wrap gap-1.5">
                          {sectorName && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                              {sectorName}
                            </span>
                          )}
                          {loan.isOngoing ? (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                              {isSinhala ? 'ක්‍රියාත්මකයි' : 'Ongoing'}
                            </span>
                          ) : loan.closingDate ? (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-100">
                              {isSinhala ? 'අවසාන දිනය: ' : 'Closes: '}
                              {new Date(loan.closingDate).toLocaleDateString()}
                            </span>
                          ) : null}
                        </div>

                        {loan.logoBadgeUrl && (
                          <img
                            src={loan.logoBadgeUrl}
                            alt=""
                            className="w-8 h-8 object-contain rounded-md border border-gray-100 p-0.5 shrink-0"
                          />
                        )}
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                        {programName}
                      </h3>

                      {beneficiaryName && (
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                          <strong className="text-gray-700">{isSinhala ? 'ප්‍රතිලාභීන්: ' : 'Target: '}</strong>
                          {beneficiaryName}
                        </p>
                      )}
                    </div>

                    {/* Key Highlights Grid */}
                    <div className="px-5 py-3 bg-gray-50/70 border-y border-gray-100/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                          {isSinhala ? 'උපරිම ණය මුදල' : 'Max Amount'}
                        </span>
                        <span className="font-bold text-emerald-800 text-xs sm:text-sm">
                          {loan.maxLoanAmount ? `රු. ${loan.maxLoanAmount}` : 'විමසන්න'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                          {isSinhala ? 'පොලී අනුපාතය' : 'Interest Rate'}
                        </span>
                        <span className="font-bold text-gray-800 text-xs sm:text-sm">
                          {loan.annualInterestRate || 'විමසන්න'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                          {isSinhala ? 'ආපසු ගෙවීම' : 'Repayment'}
                        </span>
                        <span className="font-medium text-gray-700 text-xs">
                          {loan.repaymentPeriod || 'නියමිතයි'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                          {isSinhala ? 'සහන කාලය' : 'Grace Period'}
                        </span>
                        <span className="font-medium text-gray-700 text-xs">
                          {loan.gracePeriod || 'අදාළ නොවේ'}
                        </span>
                      </div>
                    </div>

                    {/* Official Contact Details inside the Card */}
                    {(institution.hotline || institution.email || institution.website || institution.authorityAddress) && (
                      <div className="px-5 py-2.5 bg-gray-50/40 border-b border-gray-100/80 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-600">
                        {institution.hotline && (
                          <a
                            href={`tel:${institution.hotline}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold transition-colors"
                          >
                            <PhoneCall size={11} className="text-emerald-700 shrink-0" />
                            <span>{institution.hotline}</span>
                          </a>
                        )}

                        {institution.email && (
                          <a
                            href={`mailto:${institution.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-gray-600 hover:text-emerald-700 transition-colors"
                          >
                            <Mail size={11} className="text-gray-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{institution.email}</span>
                          </a>
                        )}

                        {institution.website && (
                          <a
                            href={institution.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-medium"
                          >
                            <span>{isSinhala ? 'නිල වෙබ් අඩවිය' : 'Website'}</span>
                            <ExternalLink size={10} className="shrink-0" />
                          </a>
                        )}

                        {institution.authorityAddress && (
                          <div className="inline-flex items-center gap-1 text-gray-400">
                            <MapPin size={11} className="shrink-0" />
                            <span className="truncate max-w-[170px]">{institution.authorityAddress}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card Footer / View Details */}
                    <div className="p-4 bg-white flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-700" />
                        <span>{isSinhala ? 'තහවුරු කළ ණය ක්‍රමයකි' : 'Verified Scheme'}</span>
                      </span>

                      <Link
                        to={`/loans/institution/${institutionSlug}/${loan.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs group-hover:shadow-md cursor-pointer"
                      >
                        <span>{isSinhala ? 'විස්තර බලන්න' : 'View Details'}</span>
                        <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
