import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Check } from 'lucide-react';
import { getCategoryBySlug } from '../../data/agroData';

export default function AgroCategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategoryBySlug(slug ?? '');

  if (!category) return <Navigate to="/agro" replace />;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <section className="relative w-full h-[50vh] min-h-[350px] flex flex-col justify-end pb-10 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${category.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${category.color}dd 0%, rgba(0,0,0,0.5) 55%, transparent 100%)`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 lg:px-12 relative z-10 pt-32">
          {/* Breadcrumb */}
          <Link
            to="/agro"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Categories
          </Link>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
                {category.nameSi}
              </p>
              <h1 className="text-white text-4xl sm:text-5xl font-black uppercase tracking-tight drop-shadow-xl">
                {category.name}
              </h1>
            </div>
          </div>
          <p className="text-gray-300 mt-4 max-w-2xl leading-relaxed">{category.description}</p>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="w-full py-16">
        <div className="container mx-auto px-4 lg:px-12">
          <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-8">
            {category.products.length} Products in this category
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {category.products.map((product) => (
              <Link
                key={product.id}
                to={`/agro/${slug}/${product.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 cursor-pointer border border-gray-100 hover:border-[var(--color-secondary)]/30"
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
                  />
                  {product.available ? (
                    <span className="absolute top-3 right-3 bg-[var(--color-secondary)] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Available
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <p className="text-xs text-[var(--color-secondary)] font-bold uppercase tracking-widest mb-1">
                    {product.nameSi}
                  </p>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--color-secondary)] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" /> {product.origin}
                    </div>
                    <span className="text-[var(--color-secondary)] font-black text-base">{product.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
