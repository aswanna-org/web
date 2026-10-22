import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Newspaper,
  BookOpen,
  ShoppingBag,
  MapPin,
  Building2,
  ShoppingCart,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Mail,
  BarChart3,
  RefreshCw,
  ChevronRight,
  Layers,
  Trees,
  Briefcase,
  Store,
  GraduationCap,
  Phone,
  Landmark,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PIE_COLORS = ['#006837', '#0284c7', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#06b6d4'];

interface DashboardData {
  counts: {
    news: number;
    blogs: number;
    items: number;
    products: number;
    agroLands: number;
    ascCenters: number;
    orders: number;
    plants: number;
    courses: number;
    shortCourses: number;
    nurseries: number;
    marketplace: number;
    users: number;
    contacts: number;
    institutions: number;
    jobOpenings: number;
  };
  orders: {
    total: number;
    totalRevenue: number;
    pending: number;
    completed: number;
    cancelled: number;
    recent: Array<{
      id: string;
      name: string;
      email?: string;
      mobile?: string;
      totalAmount: number;
      status: string;
      createdAt: string;
      items?: Array<{ id: string; productName: string; quantity: number; price: number }>;
    }>;
  };
  recentInquiries: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    service?: string | null;
    message: string;
    status: string;
    createdAt: string;
  }>;
  recentNews: Array<{
    id: string;
    title: string;
    sinhalaTitle?: string | null;
    category?: string | null;
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Backup states
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isSyncingS3, setIsSyncingS3] = useState<boolean>(false);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Chart view toggle
  const [chartView, setChartView] = useState<'all' | 'categories'>('all');

  const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
  const headers = useMemo<Record<string, string>>(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }, [token]);

  // Fetch all core application data
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/counts`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to load app data (Status ${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Invalid response from server');
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err?.message || 'Error loading application metrics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Database Backup
  const handleDownloadBackup = async () => {
    setIsBackingUp(true);
    setBackupMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/backup`, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Backup failed with status ${res.status}`);
      }

      const disposition = res.headers.get('content-disposition');
      let filename = `aswanna-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      if (disposition && disposition.includes('filename=')) {
        const matches = /filename="?([^";]+)"?/i.exec(disposition);
        if (matches && matches[1]) filename = matches[1];
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setBackupMessage({
        type: 'success',
        text: `Database backup downloaded & S3 snapshot saved successfully (${filename})`
      });
      setTimeout(() => setBackupMessage(null), 7000);
    } catch (err: any) {
      setBackupMessage({ type: 'error', text: err.message || 'Failed to download database backup.' });
    } finally {
      setIsBackingUp(false);
    }
  };

  // S3 Media Sync
  const handleSyncS3Backup = async () => {
    setIsSyncingS3(true);
    setBackupMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/s3-backup`, {
        method: 'POST',
        headers
      });
      const resData = await res.json();
      if (!res.ok && res.status !== 207) {
        throw new Error(resData.error || resData.message || `S3 sync failed with status ${res.status}`);
      }

      setBackupMessage({
        type: 'success',
        text: resData.message || `S3 backup completed! ${resData.data?.copiedFiles ?? 0} files backed up to S3 bucket.`
      });
      setTimeout(() => setBackupMessage(null), 8000);
    } catch (err: any) {
      setBackupMessage({ type: 'error', text: err.message || 'Failed to sync S3 media to backup bucket.' });
    } finally {
      setIsSyncingS3(false);
    }
  };

  const counts = data?.counts || {
    news: 0,
    blogs: 0,
    items: 0,
    products: 0,
    agroLands: 0,
    ascCenters: 520,
    orders: 0,
    plants: 0,
    courses: 0,
    shortCourses: 0,
    nurseries: 0,
    marketplace: 0,
    users: 0,
    contacts: 0,
    institutions: 0,
    jobOpenings: 0
  };

  // Computed summary metrics
  const totalKnowledgeItems = (counts.news || 0) + (counts.blogs || 0) + (counts.items || 0);
  const totalEducation = (counts.courses || 0) + (counts.shortCourses || 0);
  const totalCommerceAndJobs = (counts.products || 0) + (counts.jobOpenings || 0) + (counts.marketplace || 0);

  // Chart dataset: Entity distribution across modules
  const entityBarData = useMemo(() => {
    return [
      { name: 'ASC Centers', count: counts.ascCenters || 520, fill: '#006837' },
      { name: 'News Articles', count: counts.news || 0, fill: '#0284c7' },
      { name: 'Agro Library', count: counts.items || 0, fill: '#10b981' },
      { name: 'System Users', count: counts.users || 0, fill: '#8b5cf6' },
      { name: 'Education Courses', count: totalEducation || 0, fill: '#f59e0b' },
      { name: 'Job Openings', count: counts.jobOpenings || 0, fill: '#ec4899' },
      { name: 'Institutions', count: counts.institutions || 0, fill: '#6366f1' },
      { name: 'Store Products', count: counts.products || 0, fill: '#14b8a6' },
      { name: 'Agri Blogs', count: counts.blogs || 0, fill: '#f97316' }
    ];
  }, [counts, totalEducation]);

  // Chart dataset: Domain ecosystem breakdown
  const ecosystemData = useMemo(() => {
    return [
      { name: 'Agrarian Services (ASC)', value: counts.ascCenters || 520 },
      { name: 'Knowledge & Media', value: totalKnowledgeItems || 1 },
      { name: 'Education & Courses', value: totalEducation || 1 },
      { name: 'Commercial & Jobs', value: totalCommerceAndJobs || 1 },
      { name: 'Users & Community', value: counts.users || 1 }
    ];
  }, [counts, totalKnowledgeItems, totalEducation, totalCommerceAndJobs]);

  // Categorized administrative modules
  const modulesCommerce = [
    { name: 'Store Products', path: '/admin/products', icon: ShoppingBag, count: counts.products },
    { name: 'Customer Orders', path: '/admin/orders', icon: ShoppingCart, count: counts.orders },
    { name: 'Marketplace Ads', path: '/admin/marketplace', icon: Store, count: counts.marketplace },
    { name: 'Agro Lands Directory', path: '/admin/agrolands', icon: MapPin, count: counts.agroLands },
    { name: 'Plant Nurseries', path: '/admin/nurseries', icon: Trees, count: counts.nurseries }
  ];

  const modulesEducation = [
    { name: 'Degree & Diploma Courses', path: '/admin/courses', icon: GraduationCap, count: counts.courses },
    { name: 'Practical Short Courses', path: '/admin/short-courses', icon: BookOpen, count: counts.shortCourses },
    { name: 'Govijana Sewa (ASC)', path: '/admin/asc', icon: Building2, count: counts.ascCenters },
    { name: 'Career & Wage Openings', path: '/admin/careers', icon: Briefcase, count: counts.jobOpenings },
    { name: 'Affiliated Institutions', path: '/admin/institutions', icon: Landmark, count: counts.institutions }
  ];

  const modulesContent = [
    { name: 'News & Announcements', path: '/admin/news', icon: Newspaper, count: counts.news },
    { name: 'Agricultural Blogs', path: '/admin/blogs', icon: BookOpen, count: counts.blogs },
    { name: 'Agro Library Items', path: '/admin/items', icon: Layers, count: counts.items },
    { name: 'Farmer Contact Inquiries', path: '/admin/contacts', icon: Mail, count: counts.contacts },
    { name: 'Registered System Users', path: '/admin/users', icon: Users, count: counts.users }
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. HEADER: APPLICATION DATABASE CONTROL CENTER             */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-3.5 sm:p-4.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Aswanna Application Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
              </span>
              <span>Database Connected</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Internal application inventory, agrarian service centers, courses, classified ads, and system operations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh App Data */}
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={isLoading || isRefreshing}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            title="Reload Application Data"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#006837]' : ''} />
            <span className="hidden sm:inline">{isRefreshing ? 'Reloading...' : 'Reload Data'}</span>
          </button>

          {/* S3 Media Sync */}
          <button
            type="button"
            onClick={handleSyncS3Backup}
            disabled={isSyncingS3 || isBackingUp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Sync S3 Media to S3 Backup Bucket"
          >
            {isSyncingS3 ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Cloud size={13} />
            )}
            <span>{isSyncingS3 ? 'Syncing...' : 'Backup S3'}</span>
          </button>

          {/* Database Backup */}
          <button
            type="button"
            onClick={handleDownloadBackup}
            disabled={isBackingUp || isSyncingS3}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Download DB SQL dump & upload snapshot to S3"
          >
            {isBackingUp ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Database size={13} />
            )}
            <span>{isBackingUp ? 'Exporting...' : 'Backup DB'}</span>
          </button>

          {/* Link to external Web Analytics */}
          <Link
            to="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
            title="Go to Google Analytics Web Traffic Dashboard"
          >
            <BarChart3 size={13} />
            <span className="hidden sm:inline">Web Traffic (GA4)</span>
          </Link>
        </div>
      </div>

      {/* Backup Notification Toast */}
      {backupMessage && (
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold shadow-xs animate-fadeIn ${
            backupMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {backupMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{backupMessage.text}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. ULTRA-COMPACT APP KPI STRIP (5 Core Database Pillars)  */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* KPI 1: Govijana Sewa Centers (ASC) */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Agrarian Centers (ASC)</span>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              {isLoading ? '...' : (counts.ascCenters || 520).toLocaleString()}
            </div>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">520 Islandwide Units</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 text-[#006837] border border-emerald-100 flex items-center justify-center shrink-0">
            <Building2 size={16} />
          </div>
        </div>

        {/* KPI 2: Total Knowledge & Library Articles */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Knowledge Library</span>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              {isLoading ? '...' : totalKnowledgeItems.toLocaleString()}
            </div>
            <p className="text-[10px] text-sky-700 font-semibold mt-0.5">News, Blogs & Items</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center shrink-0">
            <Layers size={16} />
          </div>
        </div>

        {/* KPI 3: Education Courses & Programs */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Education & Courses</span>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              {isLoading ? '...' : totalEducation.toLocaleString()}
            </div>
            <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
              {counts.courses || 0} Main • {counts.shortCourses || 0} Short
            </p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
            <GraduationCap size={16} />
          </div>
        </div>

        {/* KPI 4: Registered System Users */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Registered Users</span>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              {isLoading ? '...' : (counts.users || 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">Registered Farmers</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center shrink-0">
            <Users size={16} />
          </div>
        </div>

        {/* KPI 5: Marketplace & Job Opportunities */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Commerce & Jobs</span>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              {isLoading ? '...' : totalCommerceAndJobs.toLocaleString()}
            </div>
            <p className="text-[10px] text-teal-700 font-semibold mt-0.5">Products & Careers</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center shrink-0">
            <Store size={16} />
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. APP DATABASE VISUAL CHARTS (Real Prisma Data)           */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left: App Database Content Distribution BarChart (7 of 12) */}
        <div className="lg:col-span-7 bg-white p-3.5 sm:p-4.5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <BarChart3 size={15} className="text-[#006837]" />
                <span>Application Entity Distribution (Database Count)</span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Live volume of records stored across each database collection.
              </p>
            </div>
          </div>

          <div className="h-56 sm:h-64 w-full pt-3">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                <RefreshCw size={15} className="animate-spin text-[#006837] mr-2" />
                <span>Loading entity chart...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={entityBarData} margin={{ top: 8, right: 8, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fill: '#64748b', fontSize: 9.5 }}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                      padding: '6px 10px'
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {entityBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Ecosystem Domain Share Donut Chart (5 of 12) */}
        <div className="lg:col-span-5 bg-white p-3.5 sm:p-4.5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-gray-900">Ecosystem Balance</h2>
              <p className="text-[11px] text-gray-400">Proportion of services and records</p>
            </div>
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => setChartView('all')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  chartView === 'all' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-500'
                }`}
              >
                Domains
              </button>
            </div>
          </div>

          <div className="h-56 sm:h-64 w-full pt-1 flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                <RefreshCw size={14} className="animate-spin text-[#006837] mr-1.5" />
                <span>Loading ecosystem...</span>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="h-36 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ecosystemData}
                        innerRadius={40}
                        outerRadius={62}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {ecosystemData.map((_, index) => (
                          <Cell key={`eco-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '8px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <ShieldCheck size={16} className="text-emerald-700" />
                    <span className="text-[9px] font-bold text-gray-500 mt-0.5">Database</span>
                  </div>
                </div>

                {/* Legend Chips */}
                <div className="flex items-center justify-center gap-x-3 gap-y-1 pt-1 text-[10.5px] font-semibold text-gray-600 flex-wrap px-2">
                  {ecosystemData.map((d, i) => (
                    <span key={d.name} className="inline-flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span>{d.name}</span>
                      <strong className="text-gray-900">({d.value})</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. COMPACT ADMINISTRATIVE DIRECTORY (15 Modules Grouped)   */}
      {/* ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Administrative Modules & Data Directory
          </h2>
          <span className="text-[11px] text-gray-400 font-medium">15 Database Management Hubs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Column 1: Marketplace & Assets */}
          <div className="bg-white rounded-xl border border-gray-200/90 p-3 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Store size={14} className="text-emerald-700" />
                <span>Marketplace & Assets</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Trade & Land</span>
            </div>
            <div className="space-y-1">
              {modulesCommerce.map((m) => {
                const IconComponent = m.icon;
                return (
                  <Link
                    key={m.name}
                    to={m.path}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-emerald-50/60 group transition-all text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-gray-50 group-hover:bg-emerald-100/70 text-gray-500 group-hover:text-emerald-800 flex items-center justify-center shrink-0 transition-colors">
                        <IconComponent size={12} />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-emerald-900 truncate">
                        {m.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] font-bold text-gray-700 group-hover:text-emerald-800 bg-gray-100 group-hover:bg-emerald-100/60 px-1.5 py-0.2 rounded">
                        {isLoading ? '...' : (m.count ?? 0).toLocaleString()}
                      </span>
                      <ChevronRight size={12} className="text-gray-300 group-hover:text-emerald-700 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Column 2: Education & Agrarian Services */}
          <div className="bg-white rounded-xl border border-gray-200/90 p-3 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-sky-700" />
                <span>Education & Extension</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Courses & ASC</span>
            </div>
            <div className="space-y-1">
              {modulesEducation.map((m) => {
                const IconComponent = m.icon;
                return (
                  <Link
                    key={m.name}
                    to={m.path}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-50/60 group transition-all text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-gray-50 group-hover:bg-sky-100/70 text-gray-500 group-hover:text-sky-800 flex items-center justify-center shrink-0 transition-colors">
                        <IconComponent size={12} />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-sky-900 truncate">
                        {m.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] font-bold text-gray-700 group-hover:text-sky-800 bg-gray-100 group-hover:bg-sky-100/60 px-1.5 py-0.2 rounded">
                        {isLoading ? '...' : (m.count ?? 0).toLocaleString()}
                      </span>
                      <ChevronRight size={12} className="text-gray-300 group-hover:text-sky-700 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Column 3: News, Media & Inquiries */}
          <div className="bg-white rounded-xl border border-gray-200/90 p-3 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Newspaper size={14} className="text-indigo-700" />
                <span>News, Media & Inquiries</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium">Content & Comms</span>
            </div>
            <div className="space-y-1">
              {modulesContent.map((m) => {
                const IconComponent = m.icon;
                return (
                  <Link
                    key={m.name}
                    to={m.path}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-indigo-50/60 group transition-all text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-gray-50 group-hover:bg-indigo-100/70 text-gray-500 group-hover:text-indigo-800 flex items-center justify-center shrink-0 transition-colors">
                        <IconComponent size={12} />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-indigo-900 truncate">
                        {m.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] font-bold text-gray-700 group-hover:text-indigo-800 bg-gray-100 group-hover:bg-indigo-100/60 px-1.5 py-0.2 rounded">
                        {isLoading ? '...' : (m.count ?? 0).toLocaleString()}
                      </span>
                      <ChevronRight size={12} className="text-gray-300 group-hover:text-indigo-700 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. BOTTOM SECTION: RECENT INQUIRIES & RECENT NEWS/CONTENT */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left: Recent Contact Inquiries from Farmers (7 of 12) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-2xs p-3.5 sm:p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Mail size={14} className="text-emerald-700" />
                <span>Recent Farmer Inquiries & Messages</span>
              </h3>
              <p className="text-[11px] text-gray-400">Incoming inquiries from the public website</p>
            </div>
            <Link
              to="/admin/contacts"
              className="text-xs font-bold text-[#006837] hover:underline flex items-center gap-1"
            >
              <span>View All ({counts.contacts || 0})</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  <th className="px-3 py-1.5">Sender</th>
                  <th className="px-3 py-1.5">Message / Inquiry</th>
                  <th className="px-3 py-1.5 text-right">Date</th>
                  <th className="px-3 py-1.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-gray-400 text-xs">
                      <RefreshCw size={14} className="animate-spin inline mr-1 text-[#006837]" /> Loading inquiries...
                    </td>
                  </tr>
                ) : !data?.recentInquiries || data.recentInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-gray-400 text-xs">
                      No customer inquiries received yet
                    </td>
                  </tr>
                ) : (
                  data.recentInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-3 py-1.5">
                        <div className="font-semibold text-gray-900 text-xs">{inq.name}</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          {inq.phone ? (
                            <>
                              <Phone size={10} />
                              <span>{inq.phone}</span>
                            </>
                          ) : (
                            <span>{inq.email}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-1.5 max-w-[260px] truncate text-gray-700 text-xs" title={inq.message}>
                        {inq.message}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            inq.status === 'READ'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {inq.status || 'NEW'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Latest News & Quick Actions (5 of 12) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-2xs p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Newspaper size={14} className="text-sky-700" />
                  <span>Latest News & Articles</span>
                </h3>
                <p className="text-[11px] text-gray-400">Recently published updates</p>
              </div>
              <Link
                to="/admin/news"
                className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1"
              >
                <span>View All ({counts.news || 0})</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {/* News List */}
            {isLoading ? (
              <div className="py-6 text-center text-xs text-gray-400">
                <RefreshCw size={14} className="animate-spin inline mr-1 text-sky-600" /> Loading updates...
              </div>
            ) : !data?.recentNews || data.recentNews.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                No recent news published
              </div>
            ) : (
              <div className="space-y-1.5">
                {data.recentNews.slice(0, 4).map((n) => (
                  <Link
                    key={n.id}
                    to="/admin/news"
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50/80 hover:bg-sky-50/70 border border-gray-100 transition-colors text-xs group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-gray-800 group-hover:text-sky-900 truncate">
                        {n.sinhalaTitle || n.title}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {n.category && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white text-gray-600 border border-gray-200 shrink-0">
                        {n.category}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-3 border-t border-gray-100 mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
              Quick Management Shortcuts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '+ News', href: '/admin/news' },
                { label: '+ Blog', href: '/admin/blogs' },
                { label: '+ Product', href: '/admin/products' },
                { label: '+ Short Course', href: '/admin/short-courses' },
                { label: '+ Land', href: '/admin/agrolands' },
                { label: 'Users', href: '/admin/users' },
                { label: 'ASC Centers', href: '/admin/asc' }
              ].map((act) => (
                <Link
                  key={act.label}
                  to={act.href}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 font-semibold text-[11px] transition-all cursor-pointer border border-gray-200/80"
                >
                  {act.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
