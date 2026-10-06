import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Users,
  Eye,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  Clock
} from 'lucide-react';
import AgroLoader from '../../components/common/AgroLoader';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface DailyTrendItem {
  date: string;
  views: number;
  visitors: number;
}

interface TrafficSourceItem {
  source: string;
  count: number;
  percentage: number;
}

interface DeviceItem {
  device: string;
  count: number;
  percentage: number;
}

interface TopPageItem {
  path: string;
  title: string;
  views: number;
  visitors: number;
}

interface PageVisitRow {
  path: string;
  title: string;
  views: number;
  visitors: number;
  lastVisited: string;
}

export default function Analytics() {
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Summary State
  const [realTimeUsers, setRealTimeUsers] = useState<number>(0);
  const [totalViews, setTotalViews] = useState<number>(0);
  const [totalVisitors, setTotalVisitors] = useState<number>(0);
  const [viewsGrowth, setViewsGrowth] = useState<number>(0);
  const [visitorsGrowth, setVisitorsGrowth] = useState<number>(0);
  const [dailyTrend, setDailyTrend] = useState<DailyTrendItem[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSourceItem[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [topPages, setTopPages] = useState<TopPageItem[]>([]);

  // Explorer Table State
  const [allPages, setAllPages] = useState<PageVisitRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'crops' | 'services' | 'info'>('all');

  const token = localStorage.getItem('admin_token');
  const headers = { Authorization: `Bearer ${token}` };

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/summary?period=${period}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setRealTimeUsers(data.realTimeActiveUsers || 0);
        setTotalViews(data.totalViews || 0);
        setTotalVisitors(data.totalUniqueVisitors || 0);
        setViewsGrowth(data.viewsGrowth || 0);
        setVisitorsGrowth(data.visitorsGrowth || 0);
        setDailyTrend(data.dailyTrend || []);
        setTrafficSources(data.trafficSources || []);
        setDevices(data.devices || []);
        setTopPages(data.topPages || []);
      }
    } catch {
      // silently ignore analytics fetch errors
    }
  }, [period]);

  // Fetch all pages (searchable table)
  const fetchAllPages = useCallback(async () => {
    try {
      setIsTableLoading(true);
      const params = new URLSearchParams();
      params.append('period', period);
      params.append('page', page.toString());
      params.append('limit', '15');
      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim());
      }

      const res = await fetch(`${API_BASE_URL}/analytics/pages?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAllPages(data.data || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
          setTotalRecords(data.meta.total || 0);
        }
      }
    } catch {
      // silently ignore
    } finally {
      setIsTableLoading(false);
    }
  }, [period, page, debouncedSearch]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchSummary(), fetchAllPages()]);
    setIsLoading(false);
  }, [fetchSummary, fetchAllPages]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Periodic refresh for real-time visitors every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSummary();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchSummary]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchSummary(), fetchAllPages()]);
    setIsRefreshing(false);
  };

  // Filter allPages by category client-side (server already paginates; category filter is visual only)
  const filteredPages = allPages.filter((item) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'crops') return item.path.startsWith('/agro') || item.path.startsWith('/plant-finder');
    if (categoryFilter === 'services') return item.path.startsWith('/govijana-sewa');
    if (categoryFilter === 'info') return item.path.startsWith('/agri-info-hub') || item.path.startsWith('/institutions');
    return true;
  });

  // Origin of the public site (strip /admin prefix)
  const publicOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  // SVG Chart calculation
  const maxDailyViews = Math.max(...dailyTrend.map(d => d.views), 10);
  const chartHeight = 160;
  const chartWidth = 700;

  const points = dailyTrend.map((d, index) => {
    const x = dailyTrend.length > 1 ? (index / (dailyTrend.length - 1)) * (chartWidth - 40) + 20 : chartWidth / 2;
    const y = chartHeight - (d.views / maxDailyViews) * (chartHeight - 30) - 15;
    return { x, y, date: d.date, views: d.views, visitors: d.visitors };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = points.length > 0
    ? `20,${chartHeight} ${polylinePoints} ${points[points.length - 1].x},${chartHeight}`
    : '';

  const formatRelativeTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Website Analytics & Crop Visits
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Real-time visitor tracking, crop demand metrics, and complete traffic logs directly from your database.
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector & Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-gray-100/80 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            {(['today', '7d', '30d', 'all'] as const).map((p) => {
              const labels = {
                today: 'Today',
                '7d': 'Last 7 Days',
                '30d': 'Last 30 Days',
                all: 'All Time'
              };
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPeriod(p);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    period === p
                      ? 'bg-white text-emerald-800 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-emerald-600' : ''} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex items-center justify-center">
          <AgroLoader message="Loading live analytics metrics..." />
        </div>
      ) : (
        <>
          {/* ── 4 Top Metrics Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* 1. Real-Time Active Users */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Live Real-time</span>
                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>Active Now</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {realTimeUsers}
                </span>
                <span className="text-xs text-gray-500 font-medium">visitors on site</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                <Clock size={12} />
                <span>Active in the last 5 minutes</span>
              </p>
              <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-emerald-50 rounded-full -z-0 opacity-40 pointer-events-none" />
            </div>

            {/* 2. Total Page Views */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Page Views</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Eye size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {totalViews.toLocaleString()}
                </span>
                {viewsGrowth !== 0 && (
                  <span className={`inline-flex items-center text-xs font-bold ${viewsGrowth > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {viewsGrowth > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(viewsGrowth)}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Total hits across all pages & crops
              </p>
            </div>

            {/* 3. Unique Visitors */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Unique Visitors</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {totalVisitors.toLocaleString()}
                </span>
                {visitorsGrowth !== 0 && (
                  <span className={`inline-flex items-center text-xs font-bold ${visitorsGrowth > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {visitorsGrowth > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(visitorsGrowth)}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Distinct user browser sessions
              </p>
            </div>

            {/* 4. Avg. Views / Visitor */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Pages / Visitor</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {totalVisitors > 0 ? (totalViews / totalVisitors).toFixed(1) : '1.0'}
                </span>
                <span className="text-xs text-gray-500 font-medium">pages / visit</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Higher depth reflects strong engagement
              </p>
            </div>

          </div>

          {/* ── Daily Traffic Trend Chart (SVG) ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Activity size={18} className="text-emerald-600" />
                  <span>Daily Traffic Trend</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visual distribution of page views and unique sessions over time
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Page Views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-400" />
                  <span>Visitors</span>
                </div>
              </div>
            </div>

            {dailyTrend.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-gray-400 text-xs">
                <Activity size={32} className="text-gray-300 mb-2" />
                <span>No traffic records registered yet for this date range.</span>
                <span className="text-gray-400 mt-1">Browse the public website to record new visits in real-time.</span>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px]">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    <line x1="20" y1={chartHeight - 15} x2={chartWidth - 20} y2={chartHeight - 15} stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1={chartHeight / 2} x2={chartWidth - 20} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="20" x2={chartWidth - 20} y2="20" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Area fill under curve */}
                    {areaPoints && (
                      <polygon points={areaPoints} fill="url(#viewsGradient)" />
                    )}

                    {/* Polyline */}
                    {polylinePoints && (
                      <polyline
                        fill="none"
                        stroke="#059669"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polylinePoints}
                      />
                    )}

                    {/* Data Points */}
                    {points.map((p, i) => (
                      <g key={i} className="group cursor-pointer">
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="4"
                          fill="#ffffff"
                          stroke="#059669"
                          strokeWidth="2.5"
                          className="hover:r-6 transition-all"
                        />
                        <text
                          x={p.x}
                          y={chartHeight + 12}
                          fontSize="9"
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontWeight="bold"
                        >
                          {p.date.slice(5)}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* ── Mid Section: Top 5 Crops/Pages + Traffic Acquisition Breakdown ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Top 5 Most Popular Crops & Pages */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-500" />
                      <span>Top Visited Crops & Pages</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Most viewed agricultural content by visitors</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Highest Demand
                  </span>
                </div>

                {topPages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    No page views recorded in this period yet.
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {topPages.slice(0, 5).map((pageItem, index) => {
                      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                      const percent = totalViews > 0 ? Math.round((pageItem.views / totalViews) * 100) : 0;

                      return (
                        <div key={pageItem.path} className="p-3 rounded-xl bg-gray-50/70 hover:bg-emerald-50/50 transition-colors border border-gray-100">
                          <div className="flex items-center justify-between gap-3 mb-1.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-sm font-bold text-gray-600 shrink-0">{medal}</span>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                  {pageItem.title || pageItem.path}
                                </p>
                                <p className="text-[11px] font-mono text-gray-400 truncate">
                                  {pageItem.path}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs sm:text-sm font-extrabold text-emerald-800">
                                {pageItem.views.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-gray-400 block font-medium">views ({percent}%)</span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-gray-200/80 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Traffic Sources & Devices Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between space-y-6">
              
              {/* Traffic Sources */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Globe size={18} className="text-blue-600" />
                    <span>Traffic Acquisition Sources</span>
                  </h2>
                  <span className="text-xs text-gray-400 font-medium">Referrers</span>
                </div>

                {trafficSources.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">
                    No referral source data available.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {trafficSources.slice(0, 5).map((source) => (
                      <div key={source.source} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700">{source.source}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${source.percentage}%` }}
                            />
                          </div>
                          <span className="font-bold text-gray-900 min-w-[5.5rem] text-right whitespace-nowrap">
                            {source.count} ({source.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Devices Breakdown */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-gray-400" />
                  <span>Device Distribution</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {devices.map((dev) => (
                    <div key={dev.device} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                        {dev.device.toLowerCase() === 'mobile' ? <Smartphone size={16} /> : <Monitor size={16} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{dev.device}</p>
                        <p className="text-[11px] text-gray-500 font-semibold">{dev.count} views ({dev.percentage}%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* ── 3. FULL EXPLORER TABLE (EVERY CROP & PAGE WITH VISITS) ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            
            {/* Table Header Controls */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Layers size={18} className="text-emerald-700" />
                  <span>All Pages & Crops Traffic Explorer</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Check exact visit counts and unique visitor volume for every crop, service, and page.
                </p>
              </div>

              {/* Category Pills & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                
                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'crops', label: 'Crops' },
                    { key: 'services', label: 'Services' },
                    { key: 'info', label: 'Info Hub' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setCategoryFilter(tab.key as any)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        categoryFilter === tab.key ? 'bg-white text-emerald-800 font-bold shadow-2xs' : 'text-gray-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[220px]">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search crop or page..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-5 w-16 text-center">Rank</th>
                    <th className="py-3 px-4">Page / Crop Title & Path</th>
                    <th className="py-3 px-4 text-center">Unique Visitors</th>
                    <th className="py-3 px-4 text-center">Total Views</th>
                    <th className="py-3 px-4 text-center">Share</th>
                    <th className="py-3 px-4 text-right">Last Visit</th>
                    <th className="py-3 px-4 text-center w-14">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isTableLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Filtering page records...</span>
                      </td>
                    </tr>
                  ) : filteredPages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        No pages found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredPages.map((row, index) => {
                      const rank = (page - 1) * 15 + index + 1;
                      const percent = totalViews > 0 ? ((row.views / totalViews) * 100).toFixed(1) : '0';

                      return (
                        <tr key={row.path} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-5 text-center font-bold text-gray-400">
                            #{rank}
                          </td>
                          <td className="py-3.5 px-4 min-w-[200px]">
                            <p className="font-bold text-gray-900 line-clamp-1">
                              {row.title || row.path}
                            </p>
                            <p className="text-[11px] font-mono text-gray-400 line-clamp-1">
                              {row.path}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                            {row.visitors.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center font-extrabold text-emerald-800">
                            {row.views.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[11px] font-bold">
                              {percent}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-gray-500 font-medium text-xs whitespace-nowrap">
                            {formatRelativeTime(row.lastVisited)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <a
                              href={`${publicOrigin}${row.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-emerald-700 p-1 inline-block rounded-md transition-colors"
                              title={`Open ${row.path} in new tab`}
                            >
                              <ExternalLink size={14} />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <span>
                Showing {filteredPages.length} of {totalRecords.toLocaleString()} total tracked pages
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <span className="font-bold text-gray-800 px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
