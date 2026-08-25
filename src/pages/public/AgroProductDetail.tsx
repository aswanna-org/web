import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, ShoppingCart, Tag, Check, Leaf, Star } from 'lucide-react';
import { getCategoryBySlug } from '../../data/agroData';

export default function AgroProductDetail() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const category = getCategoryBySlug(slug ?? '');
  const product = category?.products.find((p) => p.id === productId);

  if (!category || !product) return <Navigate to="/agro" replace />;

  const relatedProducts = category.products.filter((p) => p.id !== product.id);

  return (
    <div className="w-full min-h-screen bg-white">
      <section className="relative w-full h-[65vh] min-h-[420px] overflow-hidden">
        <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, ${category.color}cc 0%, rgba(0,0,0,0.35) 55%, transparent 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 right-0 z-10 container mx-auto px-4 lg:px-12 pt-28">
          <Link to={`/agro/${slug}`} className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {category.name}
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 lg:px-12 pb-10">
          <p className="text-white/60 text-sm uppercase tracking-[0.2em] font-medium mb-2">{category.name} · {product.nameSi}</p>
          <h1 className="text-white text-5xl sm:text-6xl font-black tracking-tight mb-4">{product.name}</h1>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (<Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />))}
              <span className="text-white/50 text-xs ml-2">Farmers Verified</span>
            </div>
            {product.available ? (
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
          <div className="lg:col-span-2">
            <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-gray-100">
              <span className="text-5xl font-black text-[var(--color-secondary)]">{product.price}</span>
              <span className="text-gray-400 text-lg">per {product.unit}</span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">About this product</p>
            <p className="text-gray-700 text-lg leading-relaxed mb-5">{product.description}</p>
            <ul className="space-y-2 mb-10">
              <li className="flex items-start gap-2 text-gray-600"><Check className="w-4 h-4 text-[var(--color-secondary)] shrink-0 mt-1" />Sourced directly from verified local farmers</li>
              <li className="flex items-start gap-2 text-gray-600"><Check className="w-4 h-4 text-[var(--color-secondary)] shrink-0 mt-1" />Quality checked before listing on Aswanna</li>
              <li className="flex items-start gap-2 text-gray-600"><Check className="w-4 h-4 text-[var(--color-secondary)] shrink-0 mt-1" />Supports sustainable and ethical farming practices</li>
            </ul>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-10 border-b border-gray-100">
              <div><div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><MapPin className="w-3.5 h-3.5" /> Origin</div><p className="font-semibold text-gray-800">{product.origin}</p></div>
              <div><div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><Clock className="w-3.5 h-3.5" /> Season</div><p className="font-semibold text-gray-800">{product.season}</p></div>
              <div><div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><Tag className="w-3.5 h-3.5" /> Unit</div><p className="font-semibold text-gray-800">Per {product.unit}</p></div>
              <div><div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><Leaf className="w-3.5 h-3.5" /> Status</div><p className={`font-semibold ${product.available ? 'text-green-600' : 'text-red-500'}`}>{product.available ? 'Available' : 'Unavailable'}</p></div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-gray-200 p-6">
              <p className="text-2xl font-black text-[var(--color-secondary)] mb-1">{product.price}</p>
              <p className="text-sm text-gray-400 mb-6">per {product.unit}</p>
              <button className="w-full py-4 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-white font-bold rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 mb-3 shadow-md hover:shadow-lg">
                <ShoppingCart className="w-5 h-5" />Add to Inquiry
              </button>
              <p className="text-center text-xs text-gray-400">Contact us for bulk pricing</p>
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-[var(--color-secondary)] shrink-0" />From {product.origin}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="w-4 h-4 text-[var(--color-secondary)] shrink-0" />Season: {product.season}</div>
                <Link to={`/agro/${slug}`} className="flex items-center gap-2 text-sm text-[var(--color-secondary)] hover:underline font-medium">
                  <ArrowLeft className="w-4 h-4" />Back to {category.name}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-8">More in <span className="text-[var(--color-secondary)]">{category.name}</span></h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p) => (
                <Link key={p.id} to={`/agro/${slug}/${p.id}`} className="group rounded-2xl overflow-hidden border border-gray-100 hover:border-[var(--color-secondary)]/30 hover:shadow-lg transition-all duration-300">
                  <div className="h-40 overflow-hidden"><img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-0.5">{p.nameSi}</p>
                    <h3 className="font-bold text-gray-900 group-hover:text-[var(--color-secondary)] transition-colors text-sm">{p.name}</h3>
                    <p className="font-black text-[var(--color-secondary)] text-sm mt-2">{p.price}</p>
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
