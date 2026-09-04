import { useState, useEffect } from 'react';
import { Users, Newspaper, BookOpen, ShoppingBag, MapPin, Building2, ShoppingCart, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface StatCard { label: string; count: number | null; icon: React.ReactNode; href: string; color: string; }

export default function Dashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token');
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's an overview of your content.</p>
      </div>

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
        </div>
      </div>
    </div>
  );
}
