import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Coins,
  PhoneCall,
  Mail,
  ExternalLink,
  MapPin,
  Paperclip,
  Download,
  Share2,
  Printer,
  CheckCircle2,
  Building2,
  FileText,
  HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';
import PageHero from '../../components/public/PageHero';
import { sanitizeHtml } from '../../utils/sanitize';
import { getShareUrl, SHARE_BASE_URL } from '../../utils/shareUrl';

interface PdfAttachment {
  id: string;
  slug: string;
  name: string;
  fileSize: string | null;
  fileUrl: string;
  pdfType?: {
    id: string;
    slug: string;
    nameSi: string | null;
    nameEn: string | null;
  } | null;
}

interface LoanDetailData {
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
  eligibilityCriteria: string | null;
  eligibilityCriteriaSi: string | null;
  eligibilityCriteriaEn: string | null;
  requiredDocuments: string | null;
  requiredDocumentsSi: string | null;
  requiredDocumentsEn: string | null;
  howToApply: string | null;
  howToApplySi: string | null;
  howToApplyEn: string | null;
  hotline: string | null;
  email: string | null;
  website: string | null;
  authorityAddress: string | null;
  sector?: { id: string; nameSi: string | null; nameEn: string | null } | null;
  targetBeneficiary?: { id: string; nameSi: string | null; nameEn: string | null } | null;
  mainBranch?: { id: string; nameSi: string | null; nameEn: string | null } | null;
  subCategory?: { id: string; nameSi: string | null; nameEn: string | null } | null;
  pdfAttachments?: PdfAttachment[];
}

export default function LoanDetail() {
  const { institutionSlug, slug } = useParams<{ institutionSlug?: string; slug: string }>();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [loan, setLoan] = useState<LoanDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<'si' | 'en' | 'both'>('si');
  const [copied, setCopied] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/loans/slug/${slug}`);
        if (!res.ok) {
          throw new Error('Loan scheme not found');
        }
        const json = await res.json();
        const data = json.data || json.loan;
        setLoan(data);
      } catch (err: any) {
        console.error('Failed to load loan details by slug:', err);
        setError(err.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchLoan();
    }
  }, [API_BASE_URL, slug]);

  const handleShare = async () => {
    if (!loan) return;
    const rawInst = loan.institutionNameEn || loan.institutionName || loan.institutionNameSi || '';
    const instSlug = institutionSlug || (rawInst ? rawInst.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '');
    const shareUrl = instSlug
      ? `${SHARE_BASE_URL}/share/loans/institution/${encodeURIComponent(instSlug)}/${encodeURIComponent(loan.slug || loan.id)}`
      : getShareUrl('loans', loan.slug || loan.id);
    const shareTitle = `${programName} - ${instTitle}`;
    const shareText = isSinhala
      ? `${programName} - කෘෂිකාර්මික ණය යෝජනා ක්‍රමය පිළිබඳ විස්තර Aswanna හරහා දැනගන්න.`
      : `${programName} - Agricultural Loan Scheme details on Aswanna.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfdfa] flex items-center justify-center pt-24 pb-16">
        <AgroLoader message={isSinhala ? 'ණය යෝජනා ක්‍රමයේ විස්තර පූරණය වෙමින් පවතී...' : 'Loading loan details...'} />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="min-h-screen bg-[#fbfdfa] flex flex-col items-center justify-center p-6 text-center">
        <Coins className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {isSinhala ? 'ණය යෝජනා ක්‍රමය හමු නොවීය' : 'Loan Scheme Not Found'}
        </h2>
        <p className="text-gray-500 text-sm max-w-md mb-6">
          {isSinhala
            ? 'ඔබ සොයන ණය යෝජනා ක්‍රමය ඉවත් කර හෝ ලිපිනය වැරදි විය හැක.'
            : 'The loan scheme you are looking for may have expired or the link is incorrect.'}
        </p>
        <Link
          to="/loans"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isSinhala ? 'සියලු ණය යෝජනා වෙත' : 'Back to All Loan Schemes'}</span>
        </Link>
      </div>
    );
  }

  const programName = isSinhala
    ? (loan.programNameSi || loan.programNameEn || 'කෘෂිකාර්මික ණය යෝජනා ක්‍රමය')
    : (loan.programNameEn || loan.programNameSi || 'Agricultural Loan Scheme');

  const instTitle = isSinhala
    ? (loan.institutionNameSi || loan.institutionName || 'ආයතනය')
    : (loan.institutionNameEn || loan.institutionName || 'Institution');

  const ministryTitle = isSinhala
    ? (loan.ministryOrParentOrgSi || loan.ministryOrParentOrg)
    : (loan.ministryOrParentOrgEn || loan.ministryOrParentOrg);

  const sectorName = isSinhala
    ? (loan.sector?.nameSi || loan.sector?.nameEn)
    : (loan.sector?.nameEn || loan.sector?.nameSi);

  const beneficiaryName = isSinhala
    ? (loan.targetBeneficiary?.nameSi || loan.targetBeneficiary?.nameEn)
    : (loan.targetBeneficiary?.nameEn || loan.targetBeneficiary?.nameSi);

  const bannerImg = loan.coverBannerUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1600';

  // Check language availability for guidelines
  const hasSiContent = Boolean(loan.eligibilityCriteriaSi || loan.requiredDocumentsSi || loan.howToApplySi || loan.eligibilityCriteria);
  const hasEnContent = Boolean(loan.eligibilityCriteriaEn || loan.requiredDocumentsEn || loan.howToApplyEn);

  return (
    <div className="min-h-screen bg-[#fbfdfa] flex flex-col">
      <SEO
        title={`${programName} | ${instTitle} | Aswanna`}
        description={`${programName} - ${instTitle}. ${isSinhala ? 'කෘෂිකාර්මික ණය යෝජනා ක්‍රමය, පොලී අනුපාත, සුදුසුකම් සහ අයදුම් කිරීමේ විස්තර.' : 'Agricultural loan scheme details, interest rates, eligibility criteria, and application forms.'}`}
        image={loan.coverBannerUrl || loan.logoBadgeUrl || undefined}
      />

      {/* ── Standard PageHero Section matching Reference Design ── */}
      <PageHero
        title={programName}
        subtitle={instTitle + (ministryTitle ? ` • ${ministryTitle}` : '')}
        image={bannerImg}
        gradientColor="#054a29"
        icon={loan.logoBadgeUrl ? undefined : Building2}
        iconUrl={loan.logoBadgeUrl || undefined}
        badgeBg="bg-[#054a29]"
        waveColor="text-[#fbfdfa]"
      />

      {/* ── Main Content Section ── */}
      <section className="w-full pt-14 sm:pt-16 md:pt-20 pb-8 sm:py-12 bg-[#fbfdfa] flex-1">
        <div className="container mx-auto px-4 lg:px-12">
          {/* Action Bar (Back, Share, Print) placed safely in content area */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200/80">
            <Link
              to={institutionSlug ? `/loans/institution/${institutionSlug}` : '/loans'}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-900 bg-white hover:bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isSinhala ? (institutionSlug ? 'ආපසු ආයතනය වෙත' : 'ආපසු සියලු ණය ක්‍රම වෙත') : (institutionSlug ? 'Back to Institution' : 'Back to All Loans')}</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-xs font-medium shadow-2xs"
              >
                <Share2 size={13} className="text-emerald-700" />
                <span>{copied ? (isSinhala ? 'පිටපත් විය!' : 'Copied!') : (isSinhala ? 'බෙදාගන්න' : 'Share')}</span>
              </button>
            </div>
          </div>
          {/* Top Key Financial Highlights Bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/60">
              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                {isSinhala ? 'උපරිම ණය මුදල' : 'Max Loan Amount'}
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-800">
                {loan.maxLoanAmount ? `රු. ${loan.maxLoanAmount}` : 'විමසන්න'}
              </span>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100/60">
              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                {isSinhala ? 'වාර්ෂික පොලී අනුපාතය' : 'Annual Interest'}
              </span>
              <span className="text-base sm:text-lg font-black text-blue-900">
                {loan.annualInterestRate || 'විමසන්න'}
              </span>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100/60">
              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                {isSinhala ? 'ආපසු ගෙවීමේ කාලය' : 'Repayment Period'}
              </span>
              <span className="text-base sm:text-lg font-black text-amber-900">
                {loan.repaymentPeriod || 'නියමිතයි'}
              </span>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100/60">
              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                {isSinhala ? 'සහන කාලය' : 'Grace Period'}
              </span>
              <span className="text-base sm:text-lg font-black text-purple-900">
                {loan.gracePeriod || 'අදාළ නොවේ'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Detailed Guidelines */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bilingual Tab Switcher (if both languages exist) */}
              {hasSiContent && hasEnContent && (
                <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium pl-2">
                    {isSinhala ? 'මාර්ගෝපදේශ භාෂාව තෝරන්න:' : 'Select Language:'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveLangTab('si')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${activeLangTab === 'si'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      🇱🇰 සිංහල
                    </button>
                    <button
                      onClick={() => setActiveLangTab('en')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${activeLangTab === 'en'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      🇬🇧 English
                    </button>
                    <button
                      onClick={() => setActiveLangTab('both')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${activeLangTab === 'both'
                        ? 'bg-gray-800 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      දෙකම (Both)
                    </button>
                  </div>
                </div>
              )}

              {/* 1. Eligibility Criteria Section */}
              {(loan.eligibilityCriteriaSi || loan.eligibilityCriteriaEn || loan.eligibilityCriteria) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">
                      {isSinhala ? 'සුදුසුකම් (Eligibility Criteria)' : 'Eligibility Criteria'}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {(activeLangTab === 'si' || activeLangTab === 'both') && (loan.eligibilityCriteriaSi || loan.eligibilityCriteria) && (
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                        {activeLangTab === 'both' && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block mb-1">
                            🇱🇰 සිංහල (Sinhala)
                          </span>
                        )}
                        <div
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(loan.eligibilityCriteriaSi || loan.eligibilityCriteria || ''),
                          }}
                        />
                      </div>
                    )}

                    {(activeLangTab === 'en' || activeLangTab === 'both') && loan.eligibilityCriteriaEn && (
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed pt-3 border-t border-gray-100/80">
                        {activeLangTab === 'both' && (
                          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block mb-1">
                            🇬🇧 English
                          </span>
                        )}
                        <div
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(loan.eligibilityCriteriaEn),
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Required Documents Section */}
              {(loan.requiredDocumentsSi || loan.requiredDocumentsEn || loan.requiredDocuments) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <FileText className="w-5 h-5 text-blue-700" />
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">
                      {isSinhala ? 'අවශ්‍ය ලියකියවිලි (Required Documents)' : 'Required Documents'}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {(activeLangTab === 'si' || activeLangTab === 'both') && (loan.requiredDocumentsSi || loan.requiredDocuments) && (
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                        {activeLangTab === 'both' && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block mb-1">
                            🇱🇰 සිංහල (Sinhala)
                          </span>
                        )}
                        <div
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(loan.requiredDocumentsSi || loan.requiredDocuments || ''),
                          }}
                        />
                      </div>
                    )}

                    {(activeLangTab === 'en' || activeLangTab === 'both') && loan.requiredDocumentsEn && (
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed pt-3 border-t border-gray-100/80">
                        {activeLangTab === 'both' && (
                          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block mb-1">
                            🇬🇧 English
                          </span>
                        )}
                        <div
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(loan.requiredDocumentsEn),
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. How to Apply Section */}
              {(loan.howToApplySi || loan.howToApplyEn || loan.howToApply) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <HelpCircle className="w-5 h-5 text-amber-700" />
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">
                      {isSinhala ? 'අයදුම් කරන ආකාරය (How to Apply)' : 'How to Apply'}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {(activeLangTab === 'si' || activeLangTab === 'both') && (loan.howToApplySi || loan.howToApply) && (
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                        {activeLangTab === 'both' && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block mb-1">
                            🇱🇰 සිංහල (Sinhala)
                          </span>
                        )}
                        <div
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(loan.howToApplySi || loan.howToApply || ''),
                          }}
                        />
                      </div>
                    )}

                    {(activeLangTab === 'en' || activeLangTab === 'both') && loan.howToApplyEn && (
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed pt-3 border-t border-gray-100/80">
                        {activeLangTab === 'both' && (
                          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block mb-1">
                            🇬🇧 English
                          </span>
                        )}
                        <div
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(loan.howToApplyEn),
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. PDF Attachments Section */}
              {loan.pdfAttachments && loan.pdfAttachments.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <Paperclip className="w-5 h-5 text-emerald-700" />
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">
                      {isSinhala ? 'බාගත හැකි ලිපිගොනු සහ අයදුම්පත්' : 'Downloadable Documents & Forms'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {loan.pdfAttachments.map((att) => {
                      const typeName = isSinhala
                        ? (att.pdfType?.nameSi || att.pdfType?.nameEn)
                        : (att.pdfType?.nameEn || att.pdfType?.nameSi);

                      return (
                        <div
                          key={att.id}
                          className="p-3.5 rounded-xl border border-gray-200/80 bg-gray-50/60 hover:bg-white hover:border-emerald-300 transition-all flex flex-col justify-between gap-3 group"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                {att.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                                {typeName && <span className="font-semibold text-emerald-700">{typeName}</span>}
                                {att.fileSize && <span>{att.fileSize}</span>}
                              </div>
                            </div>
                          </div>

                          <a
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Download size={12} />
                            <span>{isSinhala ? 'බාගත කරන්න (PDF)' : 'Download PDF'}</span>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Taxonomy, Authority Info, Contacts Sidebar */}
            <div className="space-y-6">
              {/* Institution Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6">
                <div className="flex items-center gap-3 mb-4">
                  {loan.logoBadgeUrl ? (
                    <img
                      src={loan.logoBadgeUrl}
                      alt={instTitle}
                      className="w-12 h-12 object-contain rounded-xl border border-gray-100 p-1"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Building2 size={24} />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">
                      {isSinhala ? 'පිරිනමන ආයතනය' : 'Offered By'}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900 leading-snug">{instTitle}</h3>
                    {ministryTitle && <p className="text-[11px] text-gray-400">{ministryTitle}</p>}
                  </div>
                </div>

                {/* Contact List */}
                <div className="space-y-3 pt-4 border-t border-gray-100 text-xs">
                  {loan.hotline && (
                    <div className="flex items-start gap-2.5">
                      <PhoneCall size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Hotline</span>
                        <a href={`tel:${loan.hotline}`} className="font-semibold text-gray-800 hover:text-emerald-700 transition-colors">
                          {loan.hotline}
                        </a>
                      </div>
                    </div>
                  )}

                  {loan.email && (
                    <div className="flex items-start gap-2.5">
                      <Mail size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Email</span>
                        <a href={`mailto:${loan.email}`} className="font-semibold text-gray-800 hover:text-emerald-700 transition-colors break-all">
                          {loan.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {loan.website && (
                    <div className="flex items-start gap-2.5">
                      <ExternalLink size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Website</span>
                        <a
                          href={loan.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-emerald-700 hover:underline break-all"
                        >
                          {isSinhala ? 'නිල වෙබ් අඩවියට පිවිසෙන්න' : 'Visit Official Website'}
                        </a>
                      </div>
                    </div>
                  )}

                  {loan.authorityAddress && (
                    <div className="flex items-start gap-2.5">
                      <MapPin size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Address</span>
                        <p className="text-gray-700">{loan.authorityAddress}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Taxonomy Summary Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 space-y-3 text-xs">
                <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">
                  {isSinhala ? 'ණය වර්ගීකරණ තොරතුරු' : 'Classification Details'}
                </h4>

                {sectorName && (
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Sector / අංශය</span>
                    <span className="font-semibold text-gray-800">{sectorName}</span>
                  </div>
                )}

                {beneficiaryName && (
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Target Beneficiary / ඉලක්කගත ප්‍රතිලාභීන්</span>
                    <span className="font-semibold text-gray-800">{beneficiaryName}</span>
                  </div>
                )}

                {loan.mainBranch && (
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Main Branch / ප්‍රධාන ශාඛාව</span>
                    <span className="font-semibold text-gray-800">
                      {isSinhala ? (loan.mainBranch.nameSi || loan.mainBranch.nameEn) : (loan.mainBranch.nameEn || loan.mainBranch.nameSi)}
                    </span>
                  </div>
                )}

                {loan.subCategory && (
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Sub Category / උප කාණ්ඩය</span>
                    <span className="font-semibold text-gray-800">
                      {isSinhala ? (loan.subCategory.nameSi || loan.subCategory.nameEn) : (loan.subCategory.nameEn || loan.subCategory.nameSi)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
