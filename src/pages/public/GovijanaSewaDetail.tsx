import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Copy,
  Check,
  Search,
  PhoneCall,
  ChevronRight
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AscOfficer {
  id?: string;
  name: string;
  nameSi?: string | null;
  position: string;
  positionSi?: string | null;
  phone?: string | null;
  email?: string | null;
  isPrimary?: boolean;
  order?: number;
}

interface CenterDetail {
  id: string;
  ascId: string;
  name: string;
  nameSi?: string | null;
  province: string;
  district: string;
  address?: string | null;
  addressSi?: string | null;
  officePhone?: string | null;
  mobilePhone?: string | null;
  email?: string | null;
  officerInCharge?: string | null;
  officerInChargeSi?: string | null;
  officerDesignation?: string | null;
  officerDesignationSi?: string | null;
  googleMapsUrl?: string | null;
  specialNote?: string | null;
  specialNoteSi?: string | null;
  officers?: AscOfficer[];
}

export default function GovijanaSewaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [center, setCenter] = useState<CenterDetail | null>(null);
  const [districtCenters, setDistrictCenters] = useState<CenterDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [officerSearch, setOfficerSearch] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;

    setIsLoading(true);
    fetch(`${API_BASE_URL}/asc/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch center');
        return res.json();
      })
      .then((data: CenterDetail) => {
        setCenter(data);
        // Fetch other centers in the same district for sidebar navigation
        if (data.district) {
          fetch(`${API_BASE_URL}/asc?district=${encodeURIComponent(data.district)}`)
            .then(r => r.ok ? r.json() : [])
            .then((list: CenterDetail[]) => {
              setDistrictCenters(list.filter(c => c.id !== data.id && c.ascId !== data.ascId).slice(0, 6));
            })
            .catch(() => {});
        }
      })
      .catch(err => {
        console.error('Error fetching ASC detail:', err);
        setCenter(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: center ? (isSinhala ? (center.nameSi || center.name) : center.name) : 'Govijana Sewa Center',
        url: window.location.href
      }).catch(() => {});
    } else {
      copyToClipboard(window.location.href, 'share');
    }
  };

  // Extract Officers list
  const extractAllOfficers = () => {
    if (!center) return { primary: null, allOfficers: [] };

    let list: AscOfficer[] = [];
    if (Array.isArray(center.officers) && center.officers.length > 0) {
      list = [...center.officers];
    } else if (center.officerInCharge) {
      list = [{
        name: center.officerInCharge,
        nameSi: center.officerInChargeSi || null,
        position: center.officerDesignation || 'Agrarian Development Officer (ADO)',
        positionSi: center.officerDesignationSi || 'ගොවිජන සංවර්ධන නිලධාරී',
        phone: center.mobilePhone || center.officePhone || null,
        email: center.email || null,
        isPrimary: true
      }];
    }

    const primary = list.find(o => o.isPrimary) || (list.length > 0 ? list[0] : null);
    return { primary, allOfficers: list };
  };

  const { primary, allOfficers } = extractAllOfficers();

  // Filter staff by officer search query
  const filteredStaff = allOfficers.filter(o => {
    if (!officerSearch.trim()) return true;
    const q = officerSearch.toLowerCase();
    return (
      (o.name && o.name.toLowerCase().includes(q)) ||
      (o.nameSi && o.nameSi.toLowerCase().includes(q)) ||
      (o.position && o.position.toLowerCase().includes(q)) ||
      (o.positionSi && o.positionSi.toLowerCase().includes(q)) ||
      (o.phone && o.phone.includes(q)) ||
      (o.email && o.email.toLowerCase().includes(q))
    );
  });

  const centerName = center
    ? (isSinhala ? (center.nameSi || center.name) : center.name)
    : '';
  const secondaryName = center
    ? (isSinhala ? center.name : (center.nameSi || ''))
    : '';

  const primaryPhone = primary?.phone || center?.mobilePhone || center?.officePhone;
  const primaryEmail = primary?.email || center?.email;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center gap-4 py-32">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
        <p className="text-gray-600 font-medium text-sm">
          {isSinhala ? 'මධ්‍යස්ථාන තොරතුරු පූරණය වෙමින් පවතී...' : 'Loading agrarian service center details...'}
        </p>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="w-full min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-700 rounded-3xl flex items-center justify-center mb-4 border border-amber-200">
          <Building size={36} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isSinhala ? 'මධ්‍යස්ථානය හමු නොවීය' : 'Agrarian Service Center Not Found'}
        </h2>
        <p className="text-gray-500 text-sm max-w-md mb-6">
          {isSinhala
            ? 'ඔබ සොයන ගොවිජන සේවා මධ්‍යස්ථාන තොරතුරු ලබාගත නොහැක හෝ ඉවත් කර ඇත.'
            : 'The agrarian service center details you requested are not available or may have been removed.'}
        </p>
        <button
          onClick={() => navigate('/govijana-sewa')}
          className="glass-btn-green px-6 py-3 text-sm font-bold cursor-pointer"
        >
          <span>{isSinhala ? 'ගොවිජන සේවා නාමාවලියට' : 'Back to ASC Directory'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f8faf9] pb-24 font-roboto">
      {/* ── Page Hero ── */}
      <PageHero
        title={centerName}
        description={
          isSinhala
            ? `${center.district} දිස්ත්‍රික්කයේ ${center.name} ගොවිජන සේවා මධ්‍යස්ථානයේ නිල තොරතුරු සහ සම්බන්ධතා ජාලය`
            : `Official directory and contact information for ${center.name} Agrarian Service Center in ${center.district} district.`
        }
        image="https://images.unsplash.com/photo-1592982537447-6f232490287b?w=1600&q=80"
        gradientColor="#0f5132"
      />

      {/* ── Breadcrumb & Quick Actions Bar ── */}
      <div className="bg-white border-b border-gray-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="container mx-auto px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb Links */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium truncate">
            <Link to="/" className="hover:text-emerald-800 transition-colors">
              {isSinhala ? 'මුල් පිටුව' : 'Home'}
            </Link>
            <span>/</span>
            <Link to="/govijana-sewa" className="hover:text-emerald-800 transition-colors">
              {isSinhala ? 'ගොවිජන සේවා' : 'Agrarian Services'}
            </Link>
            <span>/</span>
            <span className="text-emerald-900 font-bold truncate max-w-[200px] sm:max-w-none">
              {centerName}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="glass-btn-light px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
              title="Share Center Details"
            >
              {copiedField === 'share' ? (
                <span className="text-emerald-800 font-bold">{isSinhala ? 'පිටපත් විය' : 'Link Copied'}</span>
              ) : (
                <span>{isSinhala ? 'බෙදාගන්න' : 'Share'}</span>
              )}
            </button>

            <Link
              to="/govijana-sewa"
              className="glass-btn-green px-4 py-1.5 text-xs font-bold"
            >
              <span>{isSinhala ? 'නැවත නාමාවලියට' : 'Back to Directory'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="container mx-auto px-4 lg:px-8 mt-8">
        
        {/* ── Center Header Overview Card ── */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 relative overflow-hidden mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              {/* Metadata Bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium mb-3">
                <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {center.ascId}
                </span>
                <span>•</span>
                <span className="font-semibold text-gray-700">{center.district} District</span>
                <span>•</span>
                <span className="text-gray-500">{center.province} Province</span>
              </div>

              {/* Title & Secondary Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                {centerName}
              </h1>
              {secondaryName && secondaryName !== centerName && (
                <p className="text-sm sm:text-base font-normal text-gray-500 mt-1">
                  {secondaryName}
                </p>
              )}
            </div>

            {/* Quick Action Contact Hub */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {primaryPhone && (
                <a
                  href={`tel:${primaryPhone.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <PhoneCall size={15} />
                  <span>{primaryPhone}</span>
                </a>
              )}

              {center.mobilePhone && (
                <a
                  href={`https://wa.me/94${center.mobilePhone.replace(/\D/g, '').replace(/^0/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <MessageSquare size={15} />
                  <span>WhatsApp</span>
                </a>
              )}

              {primaryEmail && (
                <a
                  href={`mailto:${primaryEmail}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <Mail size={15} />
                  <span>{isSinhala ? 'විද්‍යුත් තැපෑල' : 'Email Office'}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Grid: Left Main Section (Officers & Info) + Right Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ── Left 2-Column Content Area ── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Special Notice Alert (If Available) */}
            {(center.specialNote || center.specialNoteSi) && (
              <div className="p-5 rounded-3xl bg-amber-50/90 border border-amber-200/90 shadow-2xs flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-amber-950 text-sm sm:text-base">
                    {isSinhala ? 'විශේෂ නිවේදනය / දැනුම්දීම' : 'Official Special Notice'}
                  </h3>
                  <p className="text-amber-950/90 text-xs sm:text-sm leading-relaxed mt-1 whitespace-pre-line font-medium">
                    {isSinhala ? (center.specialNoteSi || center.specialNote) : (center.specialNote || center.specialNoteSi)}
                  </p>
                </div>
              </div>
            )}

            {/* In-Charge Head Officer Spotlight Card */}
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-sm">
              <div className="text-emerald-800 font-bold text-xs uppercase tracking-wider mb-4 pb-3 border-b border-gray-100">
                <span>{isSinhala ? 'ප්‍රධාන භාරකාර නිලධාරී' : 'Officer In-Charge (Head of Center)'}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    {isSinhala ? 'භාරකාර නිලධාරී' : 'Officer In-Charge'}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 truncate">
                    {primary
                      ? (isSinhala ? (primary.nameSi || primary.name) : primary.name)
                      : (center.officerInCharge || (isSinhala ? 'පත් කර නොමැත' : 'Not Assigned'))}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 font-normal">
                    {primary
                      ? (isSinhala ? (primary.positionSi || primary.position) : primary.position)
                      : (center.officerDesignation || 'Agrarian Development Officer (ADO)')}
                  </p>
                </div>

                {/* Direct Connect Quick Buttons */}
                <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                  {primaryPhone && (
                    <a
                      href={`tel:${primaryPhone.replace(/\D/g, '')}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold border border-emerald-200 transition-colors"
                    >
                      <Phone size={13} />
                      <span>{primaryPhone}</span>
                    </a>
                  )}

                  {primaryEmail && (
                    <a
                      href={`mailto:${primaryEmail}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 transition-colors"
                      title={primaryEmail}
                    >
                      <Mail size={13} />
                      <span>{isSinhala ? 'Email යවන්න' : 'Send Email'}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ── Complete Appointed Officers & Staff Directory ── */}
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    {isSinhala ? 'නිලධාරී හා කාර්ය මණ්ඩල ලැයිස්තුව' : 'Officers & Agricultural Staff'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isSinhala ? 'මධ්‍යස්ථානයට අනුයුක්ත සියලුම නිලධාරීන්ගේ තොරතුරු' : 'All officers and staff attached to this Agrarian Center'}
                  </p>
                </div>

                {allOfficers.length > 3 && (
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder={isSinhala ? "නිලධාරී නම, තනතුර සොයන්න..." : "Search officer or position..."}
                      value={officerSearch}
                      onChange={e => setOfficerSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                )}
              </div>

              {filteredStaff.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <p className="text-xs">
                    {officerSearch
                      ? (isSinhala ? 'සෙවුමට ගැලපෙන නිලධාරීන් හමු නොවීය.' : 'No officers found matching your search.')
                      : (isSinhala ? 'අමතර නිලධාරීන්ගේ තොරතුරු ඇතුළත් කර නොමැත.' : 'No additional staff listed for this center.')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredStaff.map((officer, idx) => {
                    const offName = isSinhala ? (officer.nameSi || officer.name) : officer.name;
                    const offPosition = isSinhala ? (officer.positionSi || officer.position) : officer.position;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          officer.isPrimary
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-gray-50/70 hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-sm truncate">
                              {offName}
                            </h4>
                            {officer.isPrimary && (
                              <span className="text-[10px] font-bold text-emerald-800">
                                ({isSinhala ? 'ප්‍රධාන නිලධාරී' : 'Primary'})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 font-normal mt-0.5 truncate">
                            {offPosition}
                          </p>
                          {officer.email && (
                            <a
                              href={`mailto:${officer.email}`}
                              className="text-xs text-emerald-800 hover:underline break-all block mt-1 font-medium"
                            >
                              {officer.email}
                            </a>
                          )}
                        </div>

                        {/* Officer Contact Buttons */}
                        {officer.phone && (
                          <div className="shrink-0 pt-1 sm:pt-0">
                            <a
                              href={`tel:${officer.phone.replace(/\D/g, '')}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-gray-200 hover:border-emerald-300 rounded-xl text-xs font-semibold transition-colors"
                              title={`Call ${officer.phone}`}
                            >
                              <Phone size={12} />
                              <span>{officer.phone}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-6">
            
            {/* Quick Contact & Info Card */}
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-4 pb-3 border-b border-gray-100">
                <span>{isSinhala ? 'සම්බන්ධතා විස්තර' : 'Direct Contacts'}</span>
              </h3>

              <div className="space-y-4 text-xs">
                {/* Office Phone */}
                {center.officePhone && (
                  <div className="flex items-start justify-between gap-2 p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="min-w-0">
                      <span className="text-gray-400 font-medium block text-[10px] uppercase">
                        {isSinhala ? 'කාර්යාල දුරකථන' : 'Office Landline'}
                      </span>
                      <a
                        href={`tel:${center.officePhone.replace(/\D/g, '')}`}
                        className="font-bold text-gray-900 hover:text-emerald-800 text-sm block mt-0.5"
                      >
                        {center.officePhone}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(center.officePhone!, 'officePhone')}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Copy Number"
                    >
                      {copiedField === 'officePhone' ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}

                {/* Mobile Phone */}
                {center.mobilePhone && (
                  <div className="flex items-start justify-between gap-2 p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="min-w-0">
                      <span className="text-gray-400 font-medium block text-[10px] uppercase">
                        {isSinhala ? 'ජංගම දුරකථන / WhatsApp' : 'Mobile / WhatsApp'}
                      </span>
                      <a
                        href={`tel:${center.mobilePhone.replace(/\D/g, '')}`}
                        className="font-bold text-gray-900 hover:text-emerald-800 text-sm block mt-0.5"
                      >
                        {center.mobilePhone}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(center.mobilePhone!, 'mobilePhone')}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Copy Number"
                    >
                      {copiedField === 'mobilePhone' ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}

                {/* Email Address - Fully Displayed */}
                {center.email && (
                  <div className="flex items-start justify-between gap-2 p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="min-w-0 flex-1">
                      <span className="text-gray-400 font-medium block text-[10px] uppercase">
                        {isSinhala ? 'විද්‍යුත් තැපෑල' : 'Email Address'}
                      </span>
                      <a
                        href={`mailto:${center.email}`}
                        className="font-semibold text-emerald-800 hover:text-emerald-950 hover:underline text-xs break-all block mt-0.5"
                      >
                        {center.email}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(center.email!, 'email')}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shrink-0"
                      title="Copy Email"
                    >
                      {copiedField === 'email' ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Map Card */}
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-700" />
                <span>{isSinhala ? 'ලිපිනය සහ පිහිටීම' : 'Address & Location'}</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                  <span className="text-gray-400 font-medium block text-[10px] uppercase mb-1">
                    {isSinhala ? 'නිල ලිපිනය' : 'Official Postal Address'}
                  </span>
                  <p className="font-semibold text-gray-800 leading-relaxed text-xs sm:text-sm">
                    {isSinhala
                      ? (center.addressSi || center.address || 'ලිපිනය ඇතුළත් කර නොමැත')
                      : (center.address || 'Address not listed')}
                  </p>
                </div>

                {center.googleMapsUrl ? (
                  <a
                    href={center.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-btn-green w-full py-3 text-xs font-bold"
                  >
                    <span>{isSinhala ? 'Google Maps හි බලන්න' : 'Open in Google Maps'}</span>
                  </a>
                ) : (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${center.name} Agrarian Service Center, ${center.district}, Sri Lanka`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-btn-light w-full py-3 text-xs font-bold"
                  >
                    <span>{isSinhala ? 'Google Maps හි සොයන්න' : 'Search on Google Maps'}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Other Centers in District */}
            {districtCenters.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    {isSinhala ? `${center.district} දිස්ත්‍රික්කයේ වෙනත් මධ්‍යස්ථාන` : `Other Centers in ${center.district}`}
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {districtCenters.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {districtCenters.map(dc => (
                    <button
                      key={dc.id}
                      type="button"
                      onClick={() => navigate(`/govijana-sewa/${dc.ascId || dc.id}`)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50/70 border border-gray-200 hover:border-emerald-300 text-left transition-all flex items-center justify-between gap-2 cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-emerald-800 block">
                          {dc.ascId}
                        </span>
                        <h4 className="font-bold text-gray-900 group-hover:text-emerald-950 text-xs truncate">
                          {isSinhala ? (dc.nameSi || dc.name) : dc.name}
                        </h4>
                      </div>
                      <ChevronRight size={14} className="text-gray-400 group-hover:text-emerald-700 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
