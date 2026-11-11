import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Trees,
  Sparkles,
  MapPin,
  Briefcase,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sparkle,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UserDashboardOverview = () => {
  const { user, token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    nurseriesTotal: 0,
    nurseriesApproved: 0,
    nurseriesPending: 0,
    mushroomsTotal: 0,
    mushroomsActive: 0,
    landsTotal: 0,
    landsApproved: 0,
    landsPending: 0,
    jobsTotal: 0,
    jobsApproved: 0,
    jobsPending: 0,
  });

  const fetchUserSummary = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const [nursRes, mushRes, landsRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/nurseries?userId=${user.id}&approvalStatus=ALL&limit=100`, { headers }),
        fetch(`${API_BASE_URL}/mushroom-suppliers?userId=${user.id}&limit=100`, { headers }),
        fetch(`${API_BASE_URL}/agri-lands/my/listings`, { headers }),
        fetch(`${API_BASE_URL}/careers/jobs?userId=${user.id}&limit=100`, { headers })
      ]);

      const nursJson = nursRes.ok ? await nursRes.json() : { data: [] };
      const mushJson = mushRes.ok ? await mushRes.json() : { data: [] };
      const landsJson = landsRes.ok ? await landsRes.json() : { data: [] };
      const jobsJson = jobsRes.ok ? await jobsRes.json() : { data: [] };

      const nList: any[] = Array.isArray(nursJson.data) ? nursJson.data : [];
      const mList: any[] = Array.isArray(mushJson.data) ? mushJson.data : [];
      const lList: any[] = Array.isArray(landsJson.data) ? landsJson.data : [];
      const jList: any[] = Array.isArray(jobsJson.data) ? jobsJson.data : [];

      setStats({
        nurseriesTotal: nList.length,
        nurseriesApproved: nList.filter((n) => n.approvalStatus === 'APPROVED').length,
        nurseriesPending: nList.filter((n) => n.approvalStatus === 'PENDING').length,
        mushroomsTotal: mList.length,
        mushroomsActive: mList.filter((m) => m.activeState).length,
        landsTotal: lList.length,
        landsApproved: lList.filter((l) => l.approvalStatus === 'APPROVED').length,
        landsPending: lList.filter((l) => l.approvalStatus === 'PENDING').length,
        jobsTotal: jList.length,
        jobsApproved: jList.filter((j) => j.approvalStatus === 'APPROVED').length,
        jobsPending: jList.filter((j) => j.approvalStatus === 'PENDING').length,
      });
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, user?.id, token]);

  useEffect(() => {
    fetchUserSummary();
  }, [fetchUserSummary]);

  return (
    <div className="space-y-4">
      {/* Welcome Banner (Compact) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#006837] via-emerald-700 to-teal-800 rounded-xl p-4 sm:p-5 text-white shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-xs text-[10px] font-semibold text-emerald-100 mb-1.5">
            <Sparkle size={11} className="text-yellow-300" />
            <span>Aswanna User Control Portal</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold tracking-tight">
            ආයුබෝවන්, {user?.name || 'User'}!
          </h2>
          <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-0.5 leading-relaxed">
            ඔබ විසින් ඇතුළත් කරන ලද පැළ තවාන්, බිම්මල් ව්‍යාපාර, කෘෂි ඉඩම් සහ රැකියා දැන්වීම් මෙතැනින් පාලනය කරන්න.
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Link
              to="/dashboard/nurseries"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-emerald-900 text-[11px] font-bold hover:bg-emerald-50 transition shadow-2xs"
            >
              <Trees size={12} className="text-emerald-700" />
              <span>Nurseries</span>
            </Link>
            <Link
              to="/dashboard/mushrooms"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-emerald-900 text-[11px] font-bold hover:bg-emerald-50 transition shadow-2xs"
            >
              <Sparkles size={12} className="text-purple-700" />
              <span>Mushrooms</span>
            </Link>
            <Link
              to="/dashboard/lands"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-emerald-900 text-[11px] font-bold hover:bg-emerald-50 transition shadow-2xs"
            >
              <MapPin size={12} className="text-amber-700" />
              <span>Lands</span>
            </Link>
            <Link
              to="/dashboard/jobs"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-emerald-900 text-[11px] font-bold hover:bg-emerald-50 transition shadow-2xs"
            >
              <Briefcase size={12} className="text-blue-700" />
              <span>Jobs</span>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 pointer-events-none flex items-center justify-center">
          <Trees size={200} className="text-white transform translate-x-12 translate-y-4" />
        </div>
      </div>

      {/* 4 Compact Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Nursery */}
        <div className="bg-white rounded-xl p-3 border border-gray-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Trees size={14} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 truncate">
                Plant Nurseries
              </span>
            </div>
            <Link
              to="/dashboard/nurseries"
              className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition shrink-0"
              title="Go to Nurseries"
            >
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="flex items-baseline gap-1.5 my-1.5">
            <h3 className="text-xl font-black text-gray-900 leading-none">
              {loading ? '—' : stats.nurseriesTotal}
            </h3>
            <span className="text-[10px] text-gray-400 font-medium">Listings</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 size={10} />
              {stats.nurseriesApproved} Approved
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
              <Clock size={10} />
              {stats.nurseriesPending} Pending
            </span>
          </div>
        </div>

        {/* 2. Mushrooms */}
        <div className="bg-white rounded-xl p-3 border border-gray-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Sparkles size={14} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 truncate">
                Mushroom Profiles
              </span>
            </div>
            <Link
              to="/dashboard/mushrooms"
              className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition shrink-0"
              title="Go to Mushrooms"
            >
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="flex items-baseline gap-1.5 my-1.5">
            <h3 className="text-xl font-black text-gray-900 leading-none">
              {loading ? '—' : stats.mushroomsTotal}
            </h3>
            <span className="text-[10px] text-gray-400 font-medium">Profiles</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
            <span className="inline-flex items-center gap-1 text-purple-700 font-semibold">
              <CheckCircle2 size={10} />
              {stats.mushroomsActive} Active
            </span>
            <span className="text-gray-400 font-medium">Grower profile</span>
          </div>
        </div>

        {/* 3. Lands */}
        <div className="bg-white rounded-xl p-3 border border-gray-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <MapPin size={14} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 truncate">
                Agri Lands
              </span>
            </div>
            <Link
              to="/dashboard/lands"
              className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition shrink-0"
              title="Go to Lands"
            >
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="flex items-baseline gap-1.5 my-1.5">
            <h3 className="text-xl font-black text-gray-900 leading-none">
              {loading ? '—' : stats.landsTotal}
            </h3>
            <span className="text-[10px] text-gray-400 font-medium">Parcels</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 size={10} />
              {stats.landsApproved} Approved
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
              <Clock size={10} />
              {stats.landsPending} Pending
            </span>
          </div>
        </div>

        {/* 4. Jobs */}
        <div className="bg-white rounded-xl p-3 border border-gray-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Briefcase size={14} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 truncate">
                Job Postings
              </span>
            </div>
            <Link
              to="/dashboard/jobs"
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition shrink-0"
              title="Go to Jobs"
            >
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="flex items-baseline gap-1.5 my-1.5">
            <h3 className="text-xl font-black text-gray-900 leading-none">
              {loading ? '—' : stats.jobsTotal}
            </h3>
            <span className="text-[10px] text-gray-400 font-medium">Posts</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 size={10} />
              {stats.jobsApproved} Approved
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
              <Clock size={10} />
              {stats.jobsPending} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Quick Launch & Guidelines Card (Ultra-compact) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Quick Launch */}
        <div className="bg-white rounded-xl p-3.5 border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-emerald-600" />
              <span>Quick Create Actions</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              නව අයිතමයක් ක්ෂණිකව එකතු කිරීමට පහත බොත්තමක් තෝරන්න.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-2.5">
              <Link
                to="/dashboard/nurseries"
                className="p-2 rounded-lg border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/70 transition flex items-center gap-2 text-[11px] font-bold text-emerald-900 cursor-pointer"
              >
                <Plus size={13} className="text-emerald-700" />
                <span>Add Nursery</span>
              </Link>
              <Link
                to="/dashboard/mushrooms"
                className="p-2 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-100/70 transition flex items-center gap-2 text-[11px] font-bold text-purple-900 cursor-pointer"
              >
                <Plus size={13} className="text-purple-700" />
                <span>Add Mushroom</span>
              </Link>
              <Link
                to="/dashboard/lands"
                className="p-2 rounded-lg border border-amber-100 bg-amber-50/50 hover:bg-amber-100/70 transition flex items-center gap-2 text-[11px] font-bold text-amber-900 cursor-pointer"
              >
                <Plus size={13} className="text-amber-700" />
                <span>Add Agri Land</span>
              </Link>
              <Link
                to="/dashboard/jobs"
                className="p-2 rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-100/70 transition flex items-center gap-2 text-[11px] font-bold text-blue-900 cursor-pointer"
              >
                <Plus size={13} className="text-blue-700" />
                <span>Post a Job</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Visibility Info */}
        <div className="bg-white rounded-xl p-3.5 border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-600" />
              <span>Listing & Approval Guidelines</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              ඔබගේ දැන්වීම් ප්‍රසිද්ධ වෙබ් අඩවියේ දිස්වීම පිළිබඳ තොරතුරු:
            </p>

            <ul className="mt-2.5 space-y-1.5 text-[11px] text-gray-600">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <span><strong>Approved:</strong> පරිපාලක අනුමැතිය ලද පසු සජීවීව පෙනේ.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                <span><strong>Pending:</strong> අලුතින් එක් කළ පසු තහවුරු කිරීම සඳහා පරීක්ෂාවට ලක් වේ.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                <span><strong>Edit / Delete:</strong> ඕනෑම වේලාවක සංස්කරණය හෝ ඉවත් කළ හැකිය.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardOverview;

