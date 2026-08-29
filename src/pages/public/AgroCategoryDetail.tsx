import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ShoppingCart } from 'lucide-react';
import { getCategoryBySlug, getMainCategoryBySlug } from '../../data/agroData';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';

export default function AgroCategoryDetail() {
  const { mainSlug, subSlug } = useParams<{ mainSlug: string; subSlug: string }>();
  const { i18n } = useTranslation();
  
  const mainCategory = getMainCategoryBySlug(mainSlug ?? '');
  const category = getCategoryBySlug(subSlug ?? '');

  if (!mainCategory || !category) return <Navigate to="/agro" replace />;
  const isSinhala = i18n.language === 'si';

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
            to={`/agro/${mainCategory.slug}`}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {isSinhala ? mainCategory.nameSi : mainCategory.name}
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
              <Card
                key={product.id}
                to={`/agro/${mainCategory.slug}/${category.slug}/${product.id}`}
                image={product.image}
                badge={product.available ? "Available" : "Out of Stock"}
                title={product.name}
                subtitle={product.nameSi}
                meta={[
                  { text: product.price },
                  { icon: MapPin, text: product.origin }
                ]}
                primaryAction={{ text: "View Details" }}
                secondaryAction={{ icon: ShoppingCart }}
              />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
