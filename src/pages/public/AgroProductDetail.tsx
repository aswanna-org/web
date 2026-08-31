import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ShoppingCart, Tag, Check, Leaf, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AgroProductDetail() {
  const { mainSlug, subSlug, productId } = useParams<{ mainSlug: string; subSlug: string; productId: string }>();
  const { i18n } = useTranslation();
  
  const [mainCategory, setMainCategory] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/categories/${mainSlug}`).then(res => res.ok ? res.json() : null),
      fetch(`${API_BASE_URL}/categories/${subSlug}`).then(res => res.ok ? res.json() : null),
      fetch(`${API_BASE_URL}/items/slug/${productId}`).then(res => res.ok ? res.json() : null)
    ])
      .then(([mainData, subData, productData]) => {
        setMainCategory(mainData);
        setCategory(subData);
        setProduct(productData);
        
        if (subData && productData) {
            const related = (subData.items || []).filter((p: any) => p.id !== productData.id && p.status === 'AVAILABLE').slice(0, 4);
            setRelatedProducts(related);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mainSlug, subSlug, productId, API_BASE_URL]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!mainCategory || !category || !product) return <Navigate to="/agro" replace />;

  const isSinhala = i18n.language === 'si';
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80';

  return (
    <div className="w-full min-h-screen bg-white">
      <section className="relative w-full h-[30vh] min-h-[280px] overflow-hidden">
        <img src={mainImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, #2E7D32cc 0%, rgba(0,0,0,0.35) 55%, transparent 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {/* We add pt-28 here to push the breadcrumb down below the transparent header */}
        <div className="absolute top-0 left-0 right-0 z-10 container mx-auto px-4 lg:px-12 pt-[100px]">
          <Link to={`/agro/${mainCategory.slug}/${category.slug}`} className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {isSinhala ? (category.sinhalaName || category.name) : category.name}
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 lg:px-12 pb-8">
          <p className="text-white/60 text-sm uppercase tracking-[0.2em] font-medium mb-1">
            {isSinhala ? (category.sinhalaName || category.name) : category.name} · {isSinhala ? (product.sinhalaName || product.name) : product.name}
          </p>
          <h1 className="text-white text-4xl sm:text-5xl font-black tracking-tight mb-3">
            {isSinhala ? (product.sinhalaName || product.name) : product.name}
          </h1>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (<Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />))}
              <span className="text-white/50 text-xs ml-2">Farmers Verified</span>
            </div>
            {product.status === 'AVAILABLE' ? (
              <span className="flex items-center gap-1.5 bg-green-500/20 border border-green-400/40 text-green-300 text-xs font-bold px-3 py-1 rounded-full">
                <Check className="w-3 h-3" /> In Stock
              </span>
            ) : (
              <span className="bg-gray-500/30 text-gray-300 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-12 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 min-w-0">
            {product.price && (
              <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-gray-100">
                <span className="text-5xl font-black text-[var(--color-secondary)]">Rs. {product.price}</span>
                <span className="text-gray-400 text-lg">per {product.unit || 'unit'}</span>
              </div>
            )}
            
            <div className="mb-10">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">About this product</p>
              <div 
                className="text-gray-700 text-lg leading-relaxed prose max-w-none break-words"
                dangerouslySetInnerHTML={{ __html: isSinhala ? (product.sinhalaDescription || product.description || '') : (product.description || '') }} 
              />
            </div>
            
            {(product.farmingGuide || product.sinhalaFarmingGuide) && (
              <div className="mb-10 p-6 bg-green-50 rounded-2xl border border-green-100 overflow-hidden">
                <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3">Farming Guide</p>
                <div 
                  className="text-gray-800 leading-relaxed prose max-w-none prose-green break-words"
                  dangerouslySetInnerHTML={{ __html: isSinhala ? (product.sinhalaFarmingGuide || product.farmingGuide || '') : (product.farmingGuide || '') }} 
                />
              </div>
            )}

            <ul className="space-y-2 mb-10">
              <li className="flex items-start gap-2 text-gray-600"><Check className="w-4 h-4 text-[var(--color-secondary)] shrink-0 mt-1" />Sourced directly from verified local farmers</li>
              <li className="flex items-start gap-2 text-gray-600"><Check className="w-4 h-4 text-[var(--color-secondary)] shrink-0 mt-1" />Quality checked before listing on Aswanna</li>
              <li className="flex items-start gap-2 text-gray-600"><Check className="w-4 h-4 text-[var(--color-secondary)] shrink-0 mt-1" />Supports sustainable and ethical farming practices</li>
            </ul>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-10 border-b border-gray-100">
              <div><div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><MapPin className="w-3.5 h-3.5" /> Origin</div><p className="font-semibold text-gray-800 truncate">{product.location || 'Sri Lanka'}</p></div>
              <div><div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><Tag className="w-3.5 h-3.5" /> Unit</div><p className="font-semibold text-gray-800 truncate">Per {product.unit || 'unit'}</p></div>
              <div><div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><Leaf className="w-3.5 h-3.5" /> Status</div><p className={`font-semibold ${product.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-500'} truncate`}>{product.status === 'AVAILABLE' ? 'Available' : 'Unavailable'}</p></div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-gray-200 p-6">
              {product.price && (
                <>
                  <p className="text-2xl font-black text-[var(--color-secondary)] mb-1">Rs. {product.price}</p>
                  <p className="text-sm text-gray-400 mb-6">per {product.unit || 'unit'}</p>
                </>
              )}
              <button className="w-full py-4 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-white font-bold rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 mb-3 shadow-md hover:shadow-lg">
                <ShoppingCart className="w-5 h-5" />Add to Inquiry
              </button>
              <p className="text-center text-xs text-gray-400">Contact us for bulk pricing</p>
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-[var(--color-secondary)] shrink-0" /><span className="truncate">From {product.location || 'Sri Lanka'}</span></div>
                <Link to={`/agro/${mainCategory.slug}/${category.slug}`} className="flex items-center gap-2 text-sm text-[var(--color-secondary)] hover:underline font-medium">
                  <ArrowLeft className="w-4 h-4 shrink-0" /><span className="truncate">Back to {isSinhala ? (category.sinhalaName || category.name) : category.name}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-8">More in <span className="text-[var(--color-secondary)]">{isSinhala ? (category.sinhalaName || category.name) : category.name}</span></h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p) => (
                <Link key={p.id} to={`/agro/${mainCategory.slug}/${category.slug}/${p.slug}`} className="group rounded-2xl overflow-hidden border border-gray-100 hover:border-[var(--color-secondary)]/30 hover:shadow-lg transition-all duration-300">
                  <div className="h-40 overflow-hidden"><img src={p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-0.5 truncate">{isSinhala ? p.sinhalaName : ''}</p>
                    <h3 className="font-bold text-gray-900 group-hover:text-[var(--color-secondary)] transition-colors text-sm truncate">{isSinhala ? (p.sinhalaName || p.name) : p.name}</h3>
                    {p.price && <p className="font-black text-[var(--color-secondary)] text-sm mt-2">Rs. {p.price}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
