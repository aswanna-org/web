import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AgroProductDetail() {
  const { mainSlug, subSlug, productId } = useParams<{ mainSlug: string; subSlug: string; productId: string }>();
  const { t, i18n } = useTranslation();

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
  const mainImage = Array.isArray(product.images)
    ? product.images[0]
    : (typeof product.images === 'object' && product.images !== null
      ? Object.values(product.images)[0]
      : product.images) || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80';

  return (
    <div className="w-full min-h-screen bg-white">
      <section className="relative w-full min-h-[40vh] overflow-hidden flex flex-col justify-center">
        <img src={mainImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, #2E7D32cc 0%, rgba(0,0,0,0.35) 55%, transparent 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="relative z-10 container mx-auto px-4 lg:px-12 pt-32 pb-12 flex flex-col mt-auto">
          <Link to={`/agro/${mainCategory.slug}/${category.slug}`} className="inline-flex items-center w-fit gap-2 text-white/70 hover:text-white text-sm transition-colors group mb-8">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {isSinhala ? (category.sinhalaName || category.name) : category.name}
          </Link>
          <h1 className="text-white text-4xl sm:text-5xl font-black tracking-tight mb-4 drop-shadow-md">
            {isSinhala ? (product.sinhalaName || product.name) : product.name}
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-12 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 min-w-0">
            {product.price && (
              <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-gray-100">
                <span className="text-5xl font-black text-[var(--color-secondary)]">Rs. {product.price}</span>
                <span className="text-gray-400 text-lg">{t('agro.per', 'per')} {product.unit || t('agro.unit', 'unit')}</span>
              </div>
            )}

            <div className="mb-10">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('agro.aboutProduct', 'About this product')}</p>
              <div
                className="text-gray-700 text-lg leading-relaxed prose max-w-none break-words"
                dangerouslySetInnerHTML={{ __html: isSinhala ? (product.sinhalaDescription || product.description || '') : (product.description || '') }}
              />
            </div>

            {(product.farmingGuide || product.sinhalaFarmingGuide) && (
              <div className="mb-10 p-6 bg-green-50 rounded-2xl border border-green-100 overflow-hidden">
                <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3">{t('agro.farmingGuide', 'Farming Guide')}</p>
                <div
                  className="text-gray-800 leading-relaxed prose max-w-none prose-green break-words"
                  dangerouslySetInnerHTML={{ __html: isSinhala ? (product.sinhalaFarmingGuide || product.farmingGuide || '') : (product.farmingGuide || '') }}
                />
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-gray-200 p-6">
              <div className="mt-6 pt-5 border-gray-100 space-y-5">
                {product.scientificName && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('agro.scientificName', 'Scientific Name')}</p>
                    <p className="text-sm font-medium text-gray-800 italic">{product.scientificName}</p>
                  </div>
                )}

                {product.slAgriData && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">{t('agro.slData', 'Sri Lanka Data')}</p>

                    {product.slAgriData.cultivationArea && (
                      <div className="flex justify-between items-center text-sm gap-2">
                        <span className="text-gray-500">{t('agro.cultivationArea', 'Cultivation Area')}:</span>
                        <span className="font-medium text-gray-800 text-right">{isSinhala ? (product.slAgriData.sinhalaCultivationArea || product.slAgriData.cultivationArea) : product.slAgriData.cultivationArea}</span>
                      </div>
                    )}

                    {product.slAgriData.annualProduction && (
                      <div className="flex justify-between items-center text-sm gap-2">
                        <span className="text-gray-500">{t('agro.annualProd', 'Annual Prod')}:</span>
                        <span className="font-medium text-gray-800 text-right">{isSinhala ? (product.slAgriData.sinhalaAnnualProduction || product.slAgriData.annualProduction) : product.slAgriData.annualProduction}</span>
                      </div>
                    )}

                    {product.slAgriData.averageYield && (
                      <div className="flex justify-between items-center text-sm gap-2">
                        <span className="text-gray-500">{t('agro.avgYield', 'Avg Yield')}:</span>
                        <span className="font-medium text-gray-800 text-right">{isSinhala ? (product.slAgriData.sinhalaAverageYield || product.slAgriData.averageYield) : product.slAgriData.averageYield}</span>
                      </div>
                    )}

                    {product.slAgriData.districts && product.slAgriData.districts.length > 0 && (
                      <div className="pt-1">
                        <p className="text-xs text-gray-500 mb-2">{t('agro.topDistricts', 'Top Districts')}:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {product.slAgriData.districts.map((d: any, idx: number) => (
                            <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100 font-medium">
                              {isSinhala ? (d.sinhalaDistrictName || d.districtName) : d.districtName} {d.percentage}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {product.globalAgriData && product.globalAgriData.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">{t('agro.globalData', 'Global Data')}</p>
                    {product.globalAgriData.slice(0, 3).map((g: any, idx: number) => (
                      <div key={idx} className="text-sm bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-1.5 border-b border-gray-200/50 pb-1.5">
                          <span className="font-bold text-gray-800">#{g.rank} {isSinhala ? (g.sinhalaCountryName || g.countryName) : g.countryName}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-xs text-gray-500 font-medium">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-gray-400 whitespace-nowrap">{t('agro.production', 'Production')}:</span>
                            <span className="text-right text-gray-700">{g.production}</span>
                          </div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-gray-400 whitespace-nowrap">{t('agro.area', 'Area')}:</span>
                            <span className="text-right text-gray-700">{g.cultivationArea}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 space-y-3 border-t border-gray-100 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                    <MapPin className="w-4 h-4 text-[var(--color-secondary)] shrink-0" />
                    <span className="truncate">{t('agro.from', 'From')} {product.location || 'Sri Lanka'}</span>
                  </div>
                  <Link to={`/agro/${mainCategory.slug}/${category.slug}`} className="flex items-center gap-2 text-sm text-[var(--color-secondary)] hover:underline font-medium">
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t('agro.backTo', 'Back to')} {isSinhala ? (category.sinhalaName || category.name) : category.name}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-8">{t('agro.moreIn', 'More in')} <span className="text-[var(--color-secondary)]">{isSinhala ? (category.sinhalaName || category.name) : category.name}</span></h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p) => (
                <Link 
                  key={p.id} 
                  to={`/agro/${mainCategory.slug}/${category.slug}/${p.slug}`} 
                  className="group relative block w-full aspect-square rounded-full-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 bg-gray-100"
                >
                  <img
                    src={
                      (Array.isArray(p.images) && p.images.length > 0
                        ? p.images[0]
                        : (typeof p.images === 'object' && p.images !== null
                          ? Object.values(p.images)[0]
                          : p.images)) || 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80'
                    }
                    alt={isSinhala ? (p.sinhalaName || p.name) : p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 backdrop-blur-[2px]">
                    <h3 className="text-white text-xl font-bold text-center drop-shadow-md translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {isSinhala ? (p.sinhalaName || p.name) : p.name}
                    </h3>
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
