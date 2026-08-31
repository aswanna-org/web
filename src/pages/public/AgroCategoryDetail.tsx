import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';

export default function AgroCategoryDetail() {
  const { mainSlug, subSlug } = useParams<{ mainSlug: string; subSlug: string }>();
  const { i18n } = useTranslation();
  
  const [mainCategory, setMainCategory] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/categories/${mainSlug}`).then(res => {
        if (!res.ok) throw new Error('Main category not found');
        return res.json();
      }),
      fetch(`${API_BASE_URL}/categories/${subSlug}`).then(res => {
        if (!res.ok) throw new Error('Sub category not found');
        return res.json();
      })
    ])
      .then(([mainData, subData]) => {
        setMainCategory(mainData);
        setCategory(subData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mainSlug, subSlug, API_BASE_URL]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!mainCategory || !category) return <Navigate to="/agro" replace />;
  const isSinhala = i18n.language === 'si';

  const items = (category.items || []).sort((a: any, b: any) => a.order - b.order);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <section className="relative w-full h-[50vh] min-h-[350px] flex flex-col justify-end pb-10 overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-gray-900"
          style={{
            backgroundImage: category.image ? `url(${category.image})` : 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, #2E7D32dd 0%, rgba(0,0,0,0.5) 55%, transparent 100%)`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 lg:px-12 relative z-10 pt-32">
          {/* Breadcrumb */}
          <Link
            to={`/agro/${mainCategory.slug}`}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {isSinhala ? (mainCategory.sinhalaName || mainCategory.name) : mainCategory.name}
          </Link>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
                {isSinhala ? (mainCategory.sinhalaName || mainCategory.name) : mainCategory.name}
              </p>
              <h1 className="text-white text-4xl sm:text-5xl font-black uppercase tracking-tight drop-shadow-xl">
                {isSinhala ? (category.sinhalaName || category.name) : category.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="w-full py-16">
        <div className="container mx-auto px-4 lg:px-12">
          <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-8">
            {items.length} Products in this category
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product: any) => (
              <Card
                key={product.id}
                to={`/agro/${mainCategory.slug}/${category.slug}/${product.slug}`}
                image={product.images && product.images.length > 0 ? product.images[0] : undefined}
                badge={product.status === 'AVAILABLE' ? "Available" : "Out of Stock"}
                title={product.name}
                subtitle={isSinhala ? (product.sinhalaName || '') : ''}
                meta={[
                  { text: product.price ? `Rs. ${product.price} / ${product.unit}` : '' },
                  { icon: MapPin, text: product.location || '' }
                ].filter(m => m.text)}
                primaryAction={{ text: "View Details" }}
                secondaryAction={{ icon: ShoppingCart }}
              />
            ))}
            
            {items.length === 0 && (
              <div className="col-span-full py-10 text-center text-gray-400">
                <p>No items found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
