import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import worldCountries from 'world-countries';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import {
  Globe,
  RefreshCw,
  Search,
  Users,
  Eye,
  TrendingUp,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  ArrowUpDown,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  Radio,
  MapPin,
  Share2,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const GEO_URL = '/data/countries-110m.json';

export interface PageTrafficItem {
  path: string;
  title: string;
  views: number;
  users: number;
  viewsPerUser: number;
  percentage: number;
}

export interface CountryTrafficItem {
  country: string;
  countryCode: string;
  activeUsers: number;
  screenPageViews: number;
  percentage: number;
}

export interface ChannelItem {
  channel: string;
  sessions: number;
  users: number;
  percentage: number;
}

export interface DeviceItem {
  device: string;
  users: number;
  percentage: number;
}

export interface CityItem {
  city: string;
  country: string;
  users: number;
  percentage: number;
}

export interface DailyTrendItem {
  date: string;
  rawDate: string;
  users: number;
  views: number;
}

export interface GA4DashboardData {
  success: boolean;
  configured: boolean;
  message?: string;
  error?: string;
  dateRange: {
    startDate: string;
    endDate: string;
    days: number;
  };
  summary: {
    realtimeActiveUsers: number;
    totalActiveUsers: number;
    totalScreenViews: number;
    totalSessions: number;
    totalCountries: number;
    totalRoutes: number;
  };
  pages: PageTrafficItem[];
  countries: CountryTrafficItem[];
  channels: ChannelItem[];
  devices: DeviceItem[];
  cities: CityItem[];
  dailyTrend?: DailyTrendItem[];
}

interface TooltipState {
  country: string;
  flag?: string;
  users: number;
  views: number;
  percentage: number;
  x: number;
  y: number;
}

// Route categories for filtering
interface RouteCategoryConfig {
  id: string;
  label: string;
  icon: string;
  match?: string | string[];
  isExact?: boolean;
}

const ROUTE_CATEGORIES: RouteCategoryConfig[] = [
  { id: 'all', label: 'All Routes', icon: '🌐' },
  { id: 'careers', label: 'Careers & Jobs', match: '/careers', icon: '💼' },
  { id: 'marketplace', label: 'Marketplace', match: '/marketplace', icon: '🛒' },
  { id: 'plants', label: 'Plant Finder & Nurseries', match: ['/plant-finder', '/nurseries', '/plants'], icon: '🌱' },
  { id: 'agrolands', label: 'Agro Lands', match: ['/agrolands', '/agro-lands', '/agri-lands'], icon: '🌾' },
  { id: 'courses', label: 'Courses & Education', match: ['/courses', '/short-courses', '/education'], icon: '🎓' },
  { id: 'media', label: 'News & Blogs', match: ['/news', '/blogs', '/publications'], icon: '📰' },
  { id: 'institutions', label: 'Gov & Institutions', match: ['/institutions', '/asc', '/govijana-sewa'], icon: '🏛️' },
  { id: 'home', label: 'Home / Root', match: '/', isExact: true, icon: '🏠' }
];

// Color palette for charts
const CHANNEL_COLORS = ['#006837', '#0284c7', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
const DEVICE_COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f97316'];

export default function AnalyticsMap() {
  const [data, setData] = useState<GA4DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(30);

  // Active view tab: 'pages' | 'charts' | 'map' | 'acquisition'
  const [activeTab, setActiveTab] = useState<'pages' | 'charts' | 'map' | 'acquisition'>('pages');

  // Trend Metric Toggle in AreaChart: 'both' | 'users' | 'views'
  const [trendMetric, setTrendMetric] = useState<'both' | 'users' | 'views'>('both');

  // Map Controls State
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [20, 10],
    zoom: 1
  });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // ── Pages / Routes Table State ──
  const [pageSearch, setPageSearch] = useState<string>('');
  const [selectedRouteCategory, setSelectedRouteCategory] = useState<string>('all');
  const [pageSortField, setPageSortField] = useState<'views' | 'users' | 'path' | 'viewsPerUser'>('views');
  const [pageSortDirection, setPageSortDirection] = useState<'asc' | 'desc'>('desc');
  const [pageCurrentPage, setPageCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // ── Countries Table State ──
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [countrySortField, setCountrySortField] = useState<'users' | 'views' | 'country'>('users');
  const [countrySortDirection, setCountrySortDirection] = useState<'asc' | 'desc'>('desc');
  const [countryCurrentPage, setCountryCurrentPage] = useState<number>(1);
  const [countryPageSize, setCountryPageSize] = useState<number>(10);

  // Country lookup map for flags & codes
  const countryMetaMap = useMemo(() => {
    const map = new Map<string, { name: string; flag: string; cca2: string; ccn3: string }>();
    worldCountries.forEach((c) => {
      const entry = {
        name: c.name.common,
        flag: c.flag,
        cca2: c.cca2.toUpperCase(),
        ccn3: c.ccn3 || ''
      };
      map.set(c.cca2.toUpperCase(), entry);
      map.set(c.cca3.toUpperCase(), entry);
      if (c.ccn3) map.set(c.ccn3, entry);
      map.set(c.name.common.toLowerCase(), entry);
      if (c.name.official) map.set(c.name.official.toLowerCase(), entry);
    });
    return map;
  }, []);

  // Fetch all GA4 metrics from backend
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const refreshParam = forceRefresh ? '&refresh=true' : '';
      const response = await fetch(
        `${API_BASE_URL}/analytics/ga4-dashboard?days=${selectedDays}${refreshParam}`,
        { headers }
      );

      const json: GA4DashboardData = await response.json();

      if (!response.ok && !json.configured) {
        throw new Error(json.error || json.message || 'Failed to fetch GA4 dashboard data');
      }

      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Error connecting to analytics endpoint');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Lookup map for country heatmap
  const countryTrafficLookup = useMemo(() => {
    const map = new Map<string, CountryTrafficItem>();
    if (!data?.countries) return map;

    data.countries.forEach((c) => {
      if (c.countryCode) {
        map.set(c.countryCode.toUpperCase(), c);
      }
      if (c.country) {
        map.set(c.country.toLowerCase(), c);
      }
    });
    return map;
  }, [data]);

  // Map scale
  const maxCountryUsers = useMemo(() => {
    if (!data?.countries || data.countries.length === 0) return 1;
    return Math.max(...data.countries.map((c) => c.activeUsers), 1);
  }, [data]);

  const colorScale = useMemo(() => {
    return scaleLinear<string>()
      .domain([0, 1, Math.max(2, maxCountryUsers * 0.2), Math.max(5, maxCountryUsers)])
      .range(['#f1f5f9', '#a7f3d0', '#10b981', '#006837']);
  }, [maxCountryUsers]);

  const getTrafficForGeo = useCallback((geo: any): CountryTrafficItem | undefined => {
    const geoName = geo.properties?.name;
    const geoId = geo.id;

    if (geoId) {
      const meta = countryMetaMap.get(String(geoId));
      if (meta && countryTrafficLookup.has(meta.cca2)) {
        return countryTrafficLookup.get(meta.cca2);
      }
    }

    if (geoName) {
      const lower = geoName.toLowerCase();
      if (countryTrafficLookup.has(lower)) {
        return countryTrafficLookup.get(lower);
      }
      if (lower === 'united states of america' && countryTrafficLookup.has('united states')) {
        return countryTrafficLookup.get('united states');
      }
      if (lower === 'russian federation' && countryTrafficLookup.has('russia')) {
        return countryTrafficLookup.get('russia');
      }
      if (lower === 'korea, republic of' && countryTrafficLookup.has('south korea')) {
        return countryTrafficLookup.get('south korea');
      }
    }

    return undefined;
  }, [countryMetaMap, countryTrafficLookup]);

  // ── Filtered & Paginated Pages/Routes ──
  const filteredPages = useMemo(() => {
    if (!data?.pages) return [];
    let list = [...data.pages];

    if (selectedRouteCategory !== 'all') {
      const cat = ROUTE_CATEGORIES.find((c) => c.id === selectedRouteCategory);
      if (cat) {
        if (cat.isExact) {
          list = list.filter((p) => p.path === '/' || p.path === '');
        } else if (cat.match) {
          const matchers: string[] = Array.isArray(cat.match) ? cat.match : [cat.match];
          list = list.filter((p) => matchers.some((m) => p.path.toLowerCase().startsWith(m)));
        }
      }
    }

    if (pageSearch.trim()) {
      const q = pageSearch.toLowerCase().trim();
      list = list.filter(
        (p) => p.path.toLowerCase().includes(q) || p.title.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let valA: string | number = a.views;
      let valB: string | number = b.views;

      if (pageSortField === 'path') {
        valA = a.path.toLowerCase();
        valB = b.path.toLowerCase();
      } else if (pageSortField === 'users') {
        valA = a.users;
        valB = b.users;
      } else if (pageSortField === 'viewsPerUser') {
        valA = a.viewsPerUser;
        valB = b.viewsPerUser;
      }

      if (valA < valB) return pageSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return pageSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [data, selectedRouteCategory, pageSearch, pageSortField, pageSortDirection]);

  const totalPageCount = Math.max(1, Math.ceil(filteredPages.length / pageSize));
  const paginatedPages = useMemo(() => {
    const start = (pageCurrentPage - 1) * pageSize;
    return filteredPages.slice(start, start + pageSize);
  }, [filteredPages, pageCurrentPage, pageSize]);

  const togglePageSort = (field: 'views' | 'users' | 'path' | 'viewsPerUser') => {
    if (pageSortField === field) {
      setPageSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setPageSortField(field);
      setPageSortDirection('desc');
    }
    setPageCurrentPage(1);
  };

  // ── Filtered & Paginated Countries ──
  const filteredCountries = useMemo(() => {
    if (!data?.countries) return [];
    let list = [...data.countries];

    if (countrySearch.trim()) {
      const q = countrySearch.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.country.toLowerCase().includes(q) ||
          c.countryCode.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let valA: string | number = a.activeUsers;
      let valB: string | number = b.activeUsers;

      if (countrySortField === 'country') {
        valA = a.country.toLowerCase();
        valB = b.country.toLowerCase();
      } else if (countrySortField === 'views') {
        valA = a.screenPageViews;
        valB = b.screenPageViews;
      }

      if (valA < valB) return countrySortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return countrySortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [data, countrySearch, countrySortField, countrySortDirection]);

  const totalCountryPages = Math.max(1, Math.ceil(filteredCountries.length / countryPageSize));
  const paginatedCountries = useMemo(() => {
    const start = (countryCurrentPage - 1) * countryPageSize;
    return filteredCountries.slice(start, start + countryPageSize);
  }, [filteredCountries, countryCurrentPage, countryPageSize]);

  const toggleCountrySort = (field: 'users' | 'views' | 'country') => {
    if (countrySortField === field) {
      setCountrySortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setCountrySortField(field);
      setCountrySortDirection('desc');
    }
    setCountryCurrentPage(1);
  };

  // ── Top 8 Routes for BarChart ──
  const topRoutesForChart = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.slice(0, 8).map((p) => ({
      name: p.path.length > 22 ? p.path.substring(0, 20) + '...' : p.path,
      fullPath: p.path,
      views: p.views,
      users: p.users
    }));
  }, [data]);

  // ── Top 6 Cities for BarChart ──
  const topCitiesForChart = useMemo(() => {
    if (!data?.cities) return [];
    return data.cities.slice(0, 6).map((c) => ({
      city: c.city,
      users: c.users
    }));
  }, [data]);

  return (
    <div className="space-y-6 font-sans">
      {/* ── Top Header Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006837] border border-emerald-200/80 text-[11px] font-bold">
              <Globe size={13} className="shrink-0" />
              <span>Google Analytics 4 Live Suite</span>
            </div>

            {/* Realtime Pulse Indicator */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>
                {isLoading ? '...' : (data?.summary?.realtimeActiveUsers || 0)} Active Now
              </span>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
            GA4 Realtime & Route Analytics
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Detailed route visit tracking, country heatmap, visual charts, and device intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold">
            {[
              { label: '1D', value: 1 },
              { label: '7D', value: 7 },
              { label: '30D', value: 30 },
              { label: '90D', value: 90 }
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  setSelectedDays(p.value);
                  setPageCurrentPage(1);
                  setCountryCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedDays === p.value
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh Live GA4 Data"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#006837]' : ''} />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ── Configuration Setup Banner (if credentials missing) ── */}
      {data && !data.configured && (
        <div className="p-5 bg-amber-50/90 border border-amber-200 rounded-2xl text-amber-900 space-y-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <AlertCircle size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-950">
                Google Analytics 4 Configuration Required
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Add <code className="font-mono bg-amber-100/80 px-1.5 py-0.5 rounded text-amber-900">GA_PROPERTY_ID</code> and Service Account credentials to <code className="font-mono bg-amber-100/80 px-1.5 py-0.5 rounded">aswanna-api/.env</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error loading GA4 metrics: </span>
              <span>{error}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchData(true)}
            className="text-xs font-bold underline hover:no-underline cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Key Metric KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Realtime Users */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-400 tracking-wider">
              Real-time Active
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-0.5 sm:mt-1 flex items-center gap-2">
              <span>{isLoading ? '...' : (data?.summary?.realtimeActiveUsers || 0)}</span>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                Online
              </span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Last 30 minutes</div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-[#006837] flex items-center justify-center border border-emerald-100 shrink-0">
            <Radio size={20} className="animate-pulse" />
          </div>
        </div>

        {/* Card 2: Total Screen Page Views */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-400 tracking-wider">
              Total Page Views
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-0.5 sm:mt-1">
              {isLoading ? '...' : (data?.summary?.totalScreenViews || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              {selectedDays === 1 ? 'Past 24 Hours (1D)' : `Past ${selectedDays} Days`}
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
            <Eye size={20} />
          </div>
        </div>

        {/* Card 3: Total Active Users */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-400 tracking-wider">
              Active Visitors
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-0.5 sm:mt-1">
              {isLoading ? '...' : (data?.summary?.totalActiveUsers || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Unique Users</div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shrink-0">
            <Users size={20} />
          </div>
        </div>

        {/* Card 4: Total Sessions */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-400 tracking-wider">
              Total Sessions
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-0.5 sm:mt-1">
              {isLoading ? '...' : (data?.summary?.totalSessions || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">User Sessions</div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Card 5: Tracked Routes */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-400 tracking-wider">
              Tracked Routes
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-0.5 sm:mt-1">
              {isLoading ? '...' : (data?.summary?.totalRoutes || 0)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Active Paths</div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shrink-0">
            <Compass size={20} />
          </div>
        </div>
      </div>

      {/* ── View Selection Tabs ── */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('pages')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'pages'
              ? 'bg-[#006837] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Compass size={14} />
          <span>Route & Page Traffic ({data?.pages?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('charts')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'charts'
              ? 'bg-[#006837] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <BarChart3 size={14} />
          <span>Visual Charts & Daily Trends</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'map'
              ? 'bg-[#006837] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Globe size={14} />
          <span>World Map & Countries ({data?.countries?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('acquisition')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'acquisition'
              ? 'bg-[#006837] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Share2 size={14} />
          <span>Acquisition, Devices & Cities</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: Route & Page Traffic Table with Category Filters    */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'pages' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden space-y-4 p-4 sm:p-5">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Route & URL Performance Explorer
              </h3>
              <p className="text-[11px] text-gray-500">
                Total page visits, unique visitors, and relative engagement for each website route.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={pageSearch}
                onChange={(e) => {
                  setPageSearch(e.target.value);
                  setPageCurrentPage(1);
                }}
                placeholder="Search path (e.g. /careers, /marketplace)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] bg-gray-50/50"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Filter size={11} /> Filter:
            </span>
            {ROUTE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedRouteCategory(cat.id);
                  setPageCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 border flex items-center gap-1 ${
                  selectedRouteCategory === cat.id
                    ? 'bg-[#006837] text-white border-[#006837] shadow-2xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Ultra-compact Table adhering to AGENTS.md */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs text-gray-700">
                <thead>
                  <tr className="bg-gray-50/90 border-b border-gray-200">
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap w-12 text-center">
                      #
                    </th>
                    <th
                      onClick={() => togglePageSort('path')}
                      className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-900"
                    >
                      <div className="flex items-center gap-1">
                        <span>Route Path & Title</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>
                    <th
                      onClick={() => togglePageSort('views')}
                      className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-right cursor-pointer hover:text-gray-900"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Total Views</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>
                    <th
                      onClick={() => togglePageSort('users')}
                      className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-right cursor-pointer hover:text-gray-900"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Active Users</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>
                    <th
                      onClick={() => togglePageSort('viewsPerUser')}
                      className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-right cursor-pointer hover:text-gray-900"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Views / User</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap w-40">
                      Traffic Share
                    </th>
                    <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap w-16 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw size={14} className="animate-spin text-[#006837]" />
                          <span>Fetching GA4 route records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedPages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-gray-400 text-xs">
                        {pageSearch
                          ? 'No routes found matching your search filter.'
                          : 'No GA4 page visits recorded for this category and date range.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedPages.map((p, idx) => {
                      const absoluteIndex = (pageCurrentPage - 1) * pageSize + idx + 1;

                      let badgeColor = 'bg-gray-100 text-gray-700';
                      if (p.path.startsWith('/careers')) badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                      else if (p.path.startsWith('/marketplace')) badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      else if (p.path.startsWith('/plant')) badgeColor = 'bg-green-50 text-green-700 border-green-200';
                      else if (p.path.startsWith('/agro')) badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                      else if (p.path.startsWith('/courses') || p.path.startsWith('/education'))
                        badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';

                      return (
                        <tr key={p.path + idx} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-3 py-1.5 text-center font-mono text-[11px] text-gray-400">
                            {absoluteIndex}
                          </td>
                          <td className="px-3 py-1.5 max-w-md">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold border truncate max-w-[280px] sm:max-w-xs ${badgeColor}`}
                                title={p.path}
                              >
                                {p.path}
                              </span>
                            </div>
                            {p.title && (
                              <div className="text-[10px] text-gray-400 truncate max-w-sm mt-0.5" title={p.title}>
                                {p.title}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-1.5 text-right font-bold text-gray-900 font-mono">
                            {p.views.toLocaleString()}
                          </td>
                          <td className="px-3 py-1.5 text-right text-gray-700 font-mono">
                            {p.users.toLocaleString()}
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono text-gray-500">
                            {p.viewsPerUser}x
                          </td>
                          <td className="px-3 py-1.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-[#006837] h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(p.percentage, 100)}%` }}
                                />
                              </div>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-emerald-50 text-[#006837] font-mono shrink-0">
                                {p.percentage}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <a
                              href={p.path}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 inline-flex text-gray-400 hover:text-emerald-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                              title={`Open ${p.path} in new tab`}
                            >
                              <ExternalLink size={13} />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <span>
                Showing{' '}
                <span className="font-semibold text-gray-800">
                  {filteredPages.length === 0 ? 0 : (pageCurrentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-gray-800">
                  {Math.min(pageCurrentPage * pageSize, filteredPages.length)}
                </span>{' '}
                of <span className="font-semibold text-gray-800">{filteredPages.length}</span> routes
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-gray-400">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageCurrentPage(1);
                  }}
                  className="px-2 py-0.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPageCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={pageCurrentPage <= 1}
                className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 font-mono text-xs text-gray-700">
                Page {pageCurrentPage} of {totalPageCount}
              </span>
              <button
                type="button"
                onClick={() => setPageCurrentPage((p) => Math.min(p + 1, totalPageCount))}
                disabled={pageCurrentPage >= totalPageCount}
                className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: VISUAL CHARTS & TRENDS (Powered by Recharts)        */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {/* Chart 1: Daily Time-Series AreaChart */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#006837]" />
                  <span>Daily Traffic & Visitor Growth Trend</span>
                </h3>
                <p className="text-[11px] text-gray-500">
                  Day-by-day active visitors and screen page views over the selected time window.
                </p>
              </div>

              {/* Metric filter buttons */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-xs font-semibold">
                {[
                  { id: 'both', label: 'All Metrics' },
                  { id: 'users', label: 'Active Users' },
                  { id: 'views', label: 'Page Views' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTrendMetric(m.id as any)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      trendMetric === m.id
                        ? 'bg-white text-gray-900 shadow-2xs font-bold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts AreaChart */}
            <div className="h-64 sm:h-72 w-full pt-2">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                  <RefreshCw size={16} className="animate-spin text-[#006837] mr-2" />
                  <span>Rendering trend chart...</span>
                </div>
              ) : !data?.dailyTrend || data.dailyTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                  No daily trend data available for this range.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006837" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#006837" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    {(trendMetric === 'both' || trendMetric === 'views') && (
                      <Area
                        type="monotone"
                        dataKey="views"
                        name="Page Views"
                        stroke="#0284c7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                      />
                    )}
                    {(trendMetric === 'both' || trendMetric === 'users') && (
                      <Area
                        type="monotone"
                        dataKey="users"
                        name="Active Visitors"
                        stroke="#006837"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Row of 2 Charts: Top Routes Bar Chart & Acquisition Donut Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 2: Top Visited Routes BarChart */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <BarChart3 size={15} className="text-[#006837]" />
                    <span>Top Visited Routes Comparison</span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Highest traffic sections of Aswanna platform.
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-[#006837] px-2 py-0.5 rounded-full font-mono font-bold">
                  Top 8
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                {topRoutesForChart.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                    No routes available.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topRoutesForChart}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={90}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Bar dataKey="views" name="Page Views" fill="#006837" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 3: Acquisition Channels Donut Chart */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <PieChartIcon size={15} className="text-[#006837]" />
                    <span>User Acquisition Channels</span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Proportion of traffic channels driving sessions.
                  </p>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-mono font-bold">
                  Acquisition
                </span>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                {!data?.channels || data.channels.length === 0 ? (
                  <div className="text-gray-400 text-xs">No channel data available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.channels}
                        dataKey="sessions"
                        nameKey="channel"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {data.channels.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Row of 2 Charts: Devices Donut & Top Regional Cities Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 4: Hardware Devices Pie Chart */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Smartphone size={15} className="text-[#006837]" />
                    <span>Hardware Devices Distribution</span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Mobile, Desktop, and Tablet market share.
                  </p>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-mono">
                  Devices
                </span>
              </div>

              <div className="h-60 w-full flex items-center justify-center">
                {!data?.devices || data.devices.length === 0 ? (
                  <div className="text-gray-400 text-xs">No device data available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.devices}
                        dataKey="users"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                      >
                        {data.devices.map((_, index) => (
                          <Cell key={`dev-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 5: Top Regional Cities Bar Chart */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <MapPin size={15} className="text-[#006837]" />
                    <span>Top Regional Cities (Visitors)</span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Highest active visitor density by city in Sri Lanka.
                  </p>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  Top 6 Cities
                </span>
              </div>

              <div className="h-60 w-full pt-1">
                {topCitiesForChart.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                    No city data available.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCitiesForChart} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="city" tickLine={false} tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }} />
                      <YAxis tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Bar dataKey="users" name="Active Users" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 3: Interactive World Map & Country Breakdown Table     */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'map' && (
        <div className="space-y-6">
          {/* World Map */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden relative">
            <div className="px-5 py-3.5 bg-gray-50/90 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800">Global Visitor Heatmap</span>
                <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500 font-mono">
                  Choropleth Projection
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPosition({ coordinates: [80.7, 7.8], zoom: 4.5 })}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#006837] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="Focus Sri Lanka"
                >
                  <span>🇱🇰</span>
                  <span>Sri Lanka</span>
                </button>
                <div className="h-4 w-px bg-gray-200 mx-1" />
                <button
                  type="button"
                  onClick={() => setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }))}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }))}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPosition({ coordinates: [20, 10], zoom: 1 })}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  title="Reset View"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            <div className="relative w-full h-[360px] sm:h-[460px] lg:h-[500px] bg-[#f8fafc] overflow-hidden select-none">
              {isLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-30 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw size={24} className="animate-spin text-[#006837]" />
                    <span className="text-xs font-semibold text-gray-600">Loading Map Data...</span>
                  </div>
                </div>
              )}

              <ComposableMap
                projection="geoEqualEarth"
                projectionConfig={{ scale: 155 }}
                className="w-full h-full outline-hidden"
              >
                <ZoomableGroup
                  zoom={position.zoom}
                  center={position.coordinates}
                  onMoveEnd={(pos: any) =>
                    setPosition({
                      coordinates: pos.coordinates || [20, 10],
                      zoom: pos.zoom || 1
                    })
                  }
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const traffic = getTrafficForGeo(geo);
                        const userCount = traffic?.activeUsers || 0;
                        const isHighlighted = userCount > 0;
                        const fillColor = isHighlighted ? colorScale(userCount) : '#e2e8f0';

                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={fillColor}
                            stroke="#cbd5e1"
                            strokeWidth={0.5}
                            style={{
                              default: { outline: 'none', transition: 'all 250ms' },
                              hover: {
                                fill: isHighlighted ? '#f59e0b' : '#cbd5e1',
                                stroke: '#006837',
                                strokeWidth: 1.2,
                                outline: 'none',
                                cursor: isHighlighted ? 'pointer' : 'default'
                              },
                              pressed: { outline: 'none' }
                            } as any}
                            onMouseEnter={(evt) => {
                              const countryName = traffic?.country || geo.properties?.name || 'Unknown';
                              const meta = traffic?.countryCode ? countryMetaMap.get(traffic.countryCode) : undefined;

                              setTooltip({
                                country: countryName,
                                flag: meta?.flag,
                                users: userCount,
                                views: traffic?.screenPageViews || 0,
                                percentage: traffic?.percentage || 0,
                                x: evt.clientX,
                                y: evt.clientY
                              });
                            }}
                            onMouseMove={(evt) => {
                              setTooltip((prev) => (prev ? { ...prev, x: evt.clientX, y: evt.clientY } : null));
                            }}
                            onMouseLeave={() => {
                              setTooltip(null);
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>

              {tooltip && (
                <div
                  className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 bg-gray-900/95 text-white rounded-xl shadow-xl backdrop-blur-xs border border-gray-800 text-xs space-y-1 transition-opacity duration-150"
                  style={{ left: `${tooltip.x}px`, top: `${tooltip.y - 12}px` }}
                >
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <span>{tooltip.flag || '🌐'}</span>
                    <span>{tooltip.country}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 text-[11px] text-gray-300 pt-0.5 border-t border-gray-800">
                    <div>
                      Active Users:{' '}
                      <span className="font-bold text-emerald-400">{tooltip.users.toLocaleString()}</span>
                    </div>
                    <div>
                      Views:{' '}
                      <span className="font-bold text-gray-100">{tooltip.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-gray-200/90 shadow-sm text-[10px] font-semibold text-gray-700 flex flex-col gap-1.5">
                <div className="text-gray-500 uppercase tracking-wider text-[9px] font-bold">
                  Traffic Density
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">0</span>
                  <div className="w-24 h-2.5 rounded-sm bg-gradient-to-r from-[#e2e8f0] via-[#10b981] to-[#006837] border border-gray-200" />
                  <span className="text-emerald-700 font-bold">{maxCountryUsers.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Country Breakdown Table with Pagination */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden space-y-3 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Country-Wise Visitor Breakdown
                </h3>
                <p className="text-[11px] text-gray-500">
                  International active sessions and page impressions grouped by territory.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => {
                    setCountrySearch(e.target.value);
                    setCountryCurrentPage(1);
                  }}
                  placeholder="Filter country or code..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#006837] focus:border-[#006837] bg-gray-50/50"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs text-gray-700">
                  <thead>
                    <tr className="bg-gray-50/90 border-b border-gray-200">
                      <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap w-12 text-center">
                        #
                      </th>
                      <th
                        onClick={() => toggleCountrySort('country')}
                        className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap cursor-pointer hover:text-gray-900"
                      >
                        <div className="flex items-center gap-1">
                          <span>Country / Territory</span>
                          <ArrowUpDown size={11} />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleCountrySort('users')}
                        className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-right cursor-pointer hover:text-gray-900"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Active Users</span>
                          <ArrowUpDown size={11} />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleCountrySort('views')}
                        className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap text-right cursor-pointer hover:text-gray-900"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Page Views</span>
                          <ArrowUpDown size={11} />
                        </div>
                      </th>
                      <th className="px-3 py-2 text-[11px] uppercase font-bold text-gray-500 whitespace-nowrap w-44">
                        Distribution Share
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw size={14} className="animate-spin text-[#006837]" />
                            <span>Fetching records...</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedCountries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-gray-400 text-xs">
                          No country records match your filter.
                        </td>
                      </tr>
                    ) : (
                      paginatedCountries.map((c, idx) => {
                        const meta = countryMetaMap.get(c.countryCode) || countryMetaMap.get(c.country.toLowerCase());
                        const flag = meta?.flag || '🌐';
                        const absoluteIndex = (countryCurrentPage - 1) * countryPageSize + idx + 1;

                        return (
                          <tr key={c.country + idx} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-3 py-1.5 text-center font-mono text-[11px] text-gray-400">
                              {absoluteIndex}
                            </td>
                            <td className="px-3 py-1.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-sm shrink-0">{flag}</span>
                                <span className="font-semibold text-gray-900 truncate text-xs">
                                  {c.country}
                                </span>
                                {c.countryCode && (
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    ({c.countryCode})
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-gray-900 font-mono">
                              {c.activeUsers.toLocaleString()}
                            </td>
                            <td className="px-3 py-1.5 text-right text-gray-600 font-mono">
                              {c.screenPageViews.toLocaleString()}
                            </td>
                            <td className="px-3 py-1.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-[#006837] h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(c.percentage, 100)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-emerald-50 text-[#006837] font-mono shrink-0">
                                  {c.percentage}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls for Countries Table */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <span>
                  Showing{' '}
                  <span className="font-semibold text-gray-800">
                    {filteredCountries.length === 0 ? 0 : (countryCurrentPage - 1) * countryPageSize + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-gray-800">
                    {Math.min(countryCurrentPage * countryPageSize, filteredCountries.length)}
                  </span>{' '}
                  of <span className="font-semibold text-gray-800">{filteredCountries.length}</span> territories
                </span>

                <select
                  value={countryPageSize}
                  onChange={(e) => {
                    setCountryPageSize(Number(e.target.value));
                    setCountryCurrentPage(1);
                  }}
                  className="px-2 py-0.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCountryCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={countryCurrentPage <= 1}
                  className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-2 font-mono text-xs text-gray-700">
                  Page {countryCurrentPage} of {totalCountryPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCountryCurrentPage((p) => Math.min(p + 1, totalCountryPages))}
                  disabled={countryCurrentPage >= totalCountryPages}
                  className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 4: Acquisition Channels, Devices & Regional Cities     */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'acquisition' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Box 1: Traffic Acquisition Channels */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Share2 size={15} className="text-[#006837]" />
                <span>Acquisition Channels</span>
              </h3>
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                {data?.channels?.length || 0} Channels
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Where your visitors originated from (Direct, Social, Search).
            </p>

            <div className="space-y-2.5 pt-1">
              {data?.channels?.map((ch) => (
                <div key={ch.channel} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800">{ch.channel}</span>
                    <span className="font-mono text-gray-500">
                      {ch.sessions.toLocaleString()} sessions ({ch.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${ch.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: Device Categories */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Smartphone size={15} className="text-[#006837]" />
                <span>Device Breakdown</span>
              </h3>
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                Hardware
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Visitor distribution across mobile, desktop, and tablets.
            </p>

            <div className="space-y-3 pt-1">
              {data?.devices?.map((dev) => {
                const isMobile = dev.device.toLowerCase() === 'mobile';
                const isDesktop = dev.device.toLowerCase() === 'desktop';

                return (
                  <div key={dev.device} className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {isMobile ? (
                          <Smartphone size={15} className="text-emerald-700" />
                        ) : isDesktop ? (
                          <Monitor size={15} className="text-blue-700" />
                        ) : (
                          <Tablet size={15} className="text-purple-700" />
                        )}
                        <span className="font-bold capitalize text-gray-900">{dev.device}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-800">{dev.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#006837] h-full rounded-full"
                        style={{ width: `${dev.percentage}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono text-right">
                      {dev.users.toLocaleString()} active users
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Box 3: Top Regional Cities */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin size={15} className="text-[#006837]" />
                <span>Top Regional Cities</span>
              </h3>
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                Local Traffic
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Cities in Sri Lanka & globally generating the highest visits.
            </p>

            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
              {data?.cities?.map((c, i) => (
                <div key={c.city + i} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-mono text-[11px] w-4">{i + 1}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{c.city}</div>
                      <div className="text-[10px] text-gray-400">{c.country}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-gray-900">{c.users} users</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">{c.percentage}% share</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
