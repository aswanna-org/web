import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen, ArrowLeft, FileText, Download, ExternalLink,
  Calendar, Building2, User, Share2, Check, AlertCircle
} from 'lucide-react';
import AgroLoader from '../../components/common/AgroLoader';
import SEO from '../../components/common/SEO';

const BookFlipPdfReader = lazy(() => import('../../components/common/BookFlipPdfReader'));

interface PublicSubject {
  id: string;
  slug: string;
  nameSi: string;
  nameEn: string;
}

interface PublicPublication {
  id: string;
  slug: string;
  titleSi: string;
  titleEn: string;
  typeSi?: string | null;
  typeEn?: string | null;
  publisherSi?: string | null;
  publisherEn?: string | null;
  authorSi?: string | null;
  authorEn?: string | null;
  subjectId?: string | null;
  subject?: PublicSubject | null;
  subjectSi?: string | null;
  subjectEn?: string | null;
  pdfUrl?: string | null;
  thumbnail?: string | null;
  activeState: boolean;
  publishedState: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PublicationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [publication, setPublication] = useState<PublicPublication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showPdfReader, setShowPdfReader] = useState(false);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/publications-handbooks/slug/${slug}`)
      .then(async res => {
        if (!res.ok) {
          // Fallback to fetch by id
          return fetch(`${API_BASE_URL}/publications-handbooks/${slug}`);
        }
        return res;
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setPublication(data);
        } else {
          setError('Publication not found / ප්‍රකාශනය හමු නොවීය.');
        }
      })
      .catch(err => {
        console.error('Error fetching publication details:', err);
        setError('Failed to load publication details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, API_BASE_URL]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50/50 py-24 flex items-center justify-center">
        <AgroLoader
          message={
            isSinhala
              ? 'ප්‍රකාශන තොරතුරු පූරණය වෙමින් පවතී...'
              : 'Loading publication details...'
          }
        />
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="w-full min-h-screen bg-gray-50/50 py-20 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {isSinhala ? 'ප්‍රකාශනය හමු නොවීය' : 'Publication Not Found'}
          </h2>
          <p className="text-sm text-gray-500">
            {error || 'The requested publication or handbook does not exist or has been removed.'}
          </p>
          <button
            onClick={() => navigate('/publications-manuals')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>{isSinhala ? 'සියලු ප්‍රකාශන වෙත ආපසු' : 'Back to Publications'}</span>
          </button>
        </div>
      </div>
    );
  }

  const pageTitle = isSinhala
    ? `${publication.titleSi} | Aswanna`
    : `${publication.titleEn} | Aswanna Publications`;

  const metaDesc = isSinhala
    ? `${publication.titleSi} - ${publication.publisherSi || 'කෘෂිකාර්මික ප්‍රකාශන සහ අත්පොත්'}`
    : `${publication.titleEn} - ${publication.publisherEn || 'Agricultural Publications & Handbooks'}`;

  const typeText = isSinhala
    ? (publication.typeSi || publication.typeEn || 'ප්‍රකාශනය')
    : (publication.typeEn || 'Publication');

  const subjectText = publication.subject
    ? (isSinhala ? `${publication.subject.nameSi} (${publication.subject.nameEn})` : publication.subject.nameEn)
    : (isSinhala ? publication.subjectSi : publication.subjectEn) || 'Agricultural Knowledge';

  const authorText = isSinhala
    ? (publication.authorSi || publication.authorEn)
    : (publication.authorEn || publication.authorSi);

  const publisherText = isSinhala
    ? (publication.publisherSi || publication.publisherEn)
    : (publication.publisherEn || publication.publisherSi);

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-20 pt-6">
      <SEO
        title={pageTitle}
        description={metaDesc}
        canonical={`/publications-manuals/${publication.slug}`}
      />

      <div className="container mx-auto px-4 lg:px-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            onClick={() => navigate('/publications-manuals')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-full transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isSinhala ? 'සියලු කෘෂි ප්‍රකාශන වෙත' : 'Back to Publications'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
            title="Copy page link"
          >
            {isCopied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            <span>{isCopied ? (isSinhala ? 'පිටපත් විය!' : 'Copied!') : (isSinhala ? 'බෙදාගන්න' : 'Share')}</span>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column: Thumbnail Cover & Download Actions (5 Cols) ── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Thumbnail Cover Card */}
            <div className="bg-white rounded-3xl p-3 sm:p-4 border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-emerald-50 border border-gray-100 flex items-center justify-center">
                {publication.thumbnail ? (
                  <img
                    src={publication.thumbnail}
                    alt={publication.titleEn}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-20 h-20 rounded-full bg-amber-100/80 text-amber-800 mx-auto flex items-center justify-center shadow-xs">
                      <BookOpen size={40} />
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      {typeText}
                    </span>
                    <p className="text-xs text-gray-500 font-medium">Aswanna Official Document</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Download & Action Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-amber-700" />
                <span>{isSinhala ? 'ඩිජිටල් ලේඛනය (Digital Copy)' : 'Digital Document'}</span>
              </h3>

              {publication.pdfUrl ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowPdfReader(true)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 via-teal-700 to-amber-700 hover:from-emerald-800 hover:via-teal-800 hover:to-amber-800 text-white font-bold py-3.5 px-5 rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer text-sm"
                  >
                    <BookOpen size={18} />
                    <span>{isSinhala ? 'ඩිජිටල් පොත කියවන්න (Flip Book)' : 'Read Digital Flip Book'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={publication.pdfUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-2xl transition-all cursor-pointer text-xs sm:text-sm"
                    >
                      <Download size={16} />
                      <span>{isSinhala ? 'PDF බාගත කරන්න' : 'Download PDF'}</span>
                    </a>

                    <a
                      href={publication.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all cursor-pointer"
                      title="Open in new window"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-center space-y-1">
                  <p className="text-xs font-bold text-amber-900">
                    {isSinhala ? 'PDF ලේඛනය ළඟදීම උඩුගත කෙරේ' : 'PDF Document Coming Soon'}
                  </p>
                  <p className="text-[11px] text-amber-700">
                    {isSinhala
                      ? 'මෙම ප්‍රකාශනය සඳහා වන නිල ඩිජිටල් පිටපත ළඟදීම ලබාගත හැක.'
                      : 'The digital PDF file for this publication is being prepared.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column: Publication Details & Metadata (7 Cols) ── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title & Badge Header */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  <BookOpen size={12} />
                  <span>{typeText}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span>{subjectText}</span>
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
                  {publication.titleEn}
                </h1>
                {publication.titleSi && (
                  <h2 className="text-lg sm:text-xl font-bold text-emerald-800 mt-2 leading-relaxed">
                    {publication.titleSi}
                  </h2>
                )}
              </div>

              {/* Metadata Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                {authorText && (
                  <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <User size={13} />
                      <span>{isSinhala ? 'කර්තෘ / සැකසුම' : 'Author / By'}</span>
                    </span>
                    <p className="text-sm font-bold text-gray-800">{authorText}</p>
                  </div>
                )}

                {publisherText && (
                  <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Building2 size={13} />
                      <span>{isSinhala ? 'ප්‍රකාශකයා' : 'Publisher'}</span>
                    </span>
                    <p className="text-sm font-bold text-gray-800">{publisherText}</p>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>{isSinhala ? 'දිනය' : 'Date Added'}</span>
                  </span>
                  <p className="text-sm font-bold text-gray-800">
                    {new Date(publication.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <FileText size={13} />
                    <span>{isSinhala ? 'ලේඛන ආකෘතිය' : 'Format'}</span>
                  </span>
                  <p className="text-sm font-bold text-gray-800">
                    {publication.pdfUrl ? 'PDF (Adobe Acrobat)' : 'Printed / Digital'}
                  </p>
                </div>
              </div>
            </div>

            {/* Embedded PDF Viewer If Available */}
            {publication.pdfUrl && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={16} className="text-emerald-700" />
                    <span>{isSinhala ? 'ලේඛන පෙරදසුන' : 'Document Preview'}</span>
                  </h3>
                  <a
                    href={publication.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                  >
                    <span>Full Screen</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
                  <iframe
                    src={`${publication.pdfUrl}#toolbar=1`}
                    title={publication.titleEn}
                    className="w-full h-[650px] border-0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PDF POPUP MODAL (Book Flip Viewer with Local Client Cache) ── */}
      {showPdfReader && publication.pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-2 md:p-3 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-stone-950 rounded-xl sm:rounded-2xl w-[98vw] max-w-[1600px] h-[97vh] shadow-2xl border border-stone-800/80 overflow-hidden flex flex-col">
            <Suspense
              fallback={
                <div className="h-full flex flex-col items-center justify-center bg-stone-900 gap-3 text-stone-300">
                  <AgroLoader />
                  <span className="text-xs text-stone-400">පොත සූදානම් වෙමින් පවතී...</span>
                </div>
              }
            >
              <BookFlipPdfReader
                pdfUrl={publication.pdfUrl}
                title={isSinhala ? publication.titleSi : publication.titleEn}
                author={publication.authorEn || publication.authorSi || undefined}
                onClose={() => setShowPdfReader(false)}
                allowDownload={true}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
