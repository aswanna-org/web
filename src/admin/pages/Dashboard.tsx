import { useState, useEffect } from 'react';
import { Users, Newspaper, BookOpen, ShoppingBag, MapPin, Building2, ShoppingCart, Sprout, Database, Cloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface StatCard { label: string; count: number | null; icon: React.ReactNode; href: string; color: string; }

export default function Dashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isSyncingS3, setIsSyncingS3] = useState(false);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const token = localStorage.getItem('admin_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchStat = async (endpoint: string, key: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const count = data.meta?.total ?? (Array.isArray(data) ? data.length : data.total ?? null);
        if (count !== null) setStats(prev => ({ ...prev, [key]: count }));
      }
    } catch (_) {}
  };

  useEffect(() => {
    const fetches = [
      fetchStat('news?limit=1', 'news'),
      fetchStat('blogs?limit=1', 'blogs'),
      fetchStat('items?limit=1', 'items'),
      fetchStat('products?limit=1', 'products'),
      fetchStat('agrolands?limit=1', 'agrolands'),
      fetchStat('asc?limit=1', 'asc'),
      fetchStat('orders?limit=1', 'orders'),
      fetchStat('plants?limit=1', 'plants'),
      fetchStat('courses/admin?limit=1', 'courses'),
      fetchStat('careers/openings?limit=1', 'careers'),
    ];
    Promise.all(fetches).finally(() => setIsLoading(false));
  }, []);

  const handleDownloadBackup = async () => {
    setIsBackingUp(true);
    setBackupMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/backup`, {
        headers,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Backup failed with status ${res.status}`);
      }

      const disposition = res.headers.get('content-disposition');
      let filename = `aswanna-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      if (disposition && disposition.includes('filename=')) {
        const matches = /filename="?([^";]+)"?/i.exec(disposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
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

      setBackupMessage({ type: 'success', text: `Database backup downloaded & S3 copy saved successfully (${filename})` });
      setTimeout(() => setBackupMessage(null), 7000);
    } catch (err: any) {
      setBackupMessage({ type: 'error', text: err.message || 'Failed to download database backup.' });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleSyncS3Backup = async () => {
    setIsSyncingS3(true);
    setBackupMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/s3-backup`, {
        method: 'POST',
        headers,
      });

      const data = await res.json();
      if (!res.ok && res.status !== 207) {
        throw new Error(data.error || data.message || `S3 sync failed with status ${res.status}`);
      }

      setBackupMessage({
        type: 'success',
        text: data.message || `S3 backup completed! ${data.data?.copiedFiles ?? 0} files backed up to S3 bucket.`,
      });
      setTimeout(() => setBackupMessage(null), 8000);
    } catch (err: any) {
      setBackupMessage({ type: 'error', text: err.message || 'Failed to sync S3 media to backup bucket.' });
    } finally {
      setIsSyncingS3(false);
    }
  };

  const cards: StatCard[] = [
    { label: 'News Articles', count: stats.news ?? null, icon: <Newspaper size={24} />, href: '/admin/news', color: 'bg-blue-500' },
    { label: 'Blog Posts', count: stats.blogs ?? null, icon: <Newspaper size={24} />, href: '/admin/blogs', color: 'bg-purple-500' },
    { label: 'Agro Items', count: stats.items ?? null, icon: <BookOpen size={24} />, href: '/admin/items', color: 'bg-green-500' },
    { label: 'Products', count: stats.products ?? null, icon: <ShoppingBag size={24} />, href: '/admin/products', color: 'bg-orange-500' },
    { label: 'Agro Lands', count: stats.agrolands ?? null, icon: <MapPin size={24} />, href: '/admin/agrolands', color: 'bg-teal-500' },
    { label: 'ASC Centers', count: stats.asc ?? null, icon: <Building2 size={24} />, href: '/admin/asc', color: 'bg-indigo-500' },
    { label: 'Orders', count: stats.orders ?? null, icon: <ShoppingCart size={24} />, href: '/admin/orders', color: 'bg-red-500' },
    { label: 'Plants', count: stats.plants ?? null, icon: <Sprout size={24} />, href: '/admin/plants', color: 'bg-lime-500' },
    { label: 'Courses', count: stats.courses ?? null, icon: <BookOpen size={24} />, href: '/admin/courses', color: 'bg-sky-500' },
    { label: 'Job Openings', count: stats.careers ?? null, icon: <Users size={24} />, href: '/admin/careers', color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's an overview of your content.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSyncS3Backup}
            disabled={isSyncingS3 || isBackingUp}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Copy all uploaded S3 images & files to S3 backup bucket"
          >
            {isSyncingS3 ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Syncing S3...</span>
              </>
            ) : (
              <>
                <Cloud size={16} />
                <span>Backup S3 Media</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownloadBackup}
            disabled={isBackingUp || isSyncingS3}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Download DB dump and upload snapshot copy to S3"
          >
            {isBackingUp ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Exporting DB...</span>
              </>
            ) : (
              <>
                <Database size={16} />
                <span>Backup Database</span>
              </>
            )}
          </button>
        </div>
      </div>

      {backupMessage && (
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium animate-fadeIn ${
            backupMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {backupMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{backupMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cards.map(card => (
          <Link key={card.label} to={card.href}
            className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-10 h-10 rounded-xl ${card.color} text-white flex items-center justify-center`}>
              {card.icon}
            </div>
            <div>
              {isLoading ? (
                <div className="h-7 w-12 bg-gray-100 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-800">{card.count ?? '—'}</p>
              )}
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Add News', href: '/admin/news' },
            { label: 'Add Blog Post', href: '/admin/blogs' },
            { label: 'Add Product', href: '/admin/products' },
            { label: 'Add Land', href: '/admin/agrolands' },
            { label: 'Add Course', href: '/admin/courses' },
            { label: 'View Orders', href: '/admin/orders' },
          ].map(action => (
            <Link key={action.label} to={action.href}
              className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg text-sm hover:bg-green-100 transition-colors">
              {action.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleDownloadBackup}
            disabled={isBackingUp || isSyncingS3}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg text-sm hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Database size={14} />
            {isBackingUp ? 'Exporting...' : 'Backup Database'}
          </button>
          <button
            type="button"
            onClick={handleSyncS3Backup}
            disabled={isSyncingS3 || isBackingUp}
            className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg text-sm hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Cloud size={14} />
            {isSyncingS3 ? 'Syncing...' : 'Backup S3 Media'}
          </button>
        </div>
      </div>
    </div>
  );
}
