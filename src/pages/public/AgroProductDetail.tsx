import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AgroProductDetail() {
  const { mainSlug, subSlug, productId } = useParams<{ mainSlug: string; subSlug: string; productId: string }>();
  const { t, i18n } = useTranslation();

  const [mainCategory, setMainCategory] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
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
  if (product.status === 'UNAVAILABLE') {
    return <Navigate to={`/agro/${mainCategory.slug}/${category.slug}`} replace />;
  }

  const isSinhala = i18n.language === 'si';
  let productImages: string[] = [];
  if (Array.isArray(product.images)) {
    productImages = product.images;
  } else if (typeof product.images === 'object' && product.images !== null) {
    productImages = Object.values(product.images) as string[];
  } else if (typeof product.images === 'string') {
    productImages = [product.images];
  }

  const defaultImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80';
  const headerImage = (productImages.length > 1 && productImages[1]) ? productImages[1] : (productImages[0] || defaultImage);

  return (
    <div className="w-full min-h-screen bg-white">
      <section className="relative w-full min-h-[40vh] overflow-hidden flex flex-col justify-center">
        <img src={headerImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
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

          {product.status === 'UNAVAILABLE' && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-amber-950 font-bold text-xs uppercase tracking-wider mb-4 w-fit shadow-md border border-amber-300 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-amber-900 animate-pulse" />
              {t('agro.comingSoon', 'Coming Soon')}
            </div>
          )}

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
              <div
                className="text-gray-700 text-lg leading-relaxed prose max-w-none rich-content"
                dangerouslySetInnerHTML={{ __html: (isSinhala ? (product.sinhalaDescription || product.description || '') : (product.description || '')).replace(/&nbsp;|\u00a0/g, ' ') }}
              />
            </div>

            {(product.farmingGuide || product.sinhalaFarmingGuide) && (
              <div className="mb-10 p-6 bg-green-50 rounded-2xl border border-green-100 overflow-hidden">
                <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3">{t('agro.farmingGuide', 'Farming Guide')}</p>
                <div
                  className="text-gray-800 leading-relaxed prose max-w-none prose-green rich-content"
                  dangerouslySetInnerHTML={{ __html: (isSinhala ? (product.sinhalaFarmingGuide || product.farmingGuide || '') : (product.farmingGuide || '')).replace(/&nbsp;|\u00a0/g, ' ') }}
                />
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-gray-200 p-6">
              <div className="space-y-5">
                {product.scientificName && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('agro.scientificName', 'Scientific Name')}</p>
                    <p className="text-sm font-medium text-gray-800 italic">{product.scientificName}</p>
                  </div>
                )}

                {/* Sri Lanka Agri Data */}
                {Boolean(
                  product.slAgriData && (
                    product.slAgriData.cultivationArea ||
                    product.slAgriData.sinhalaCultivationArea ||
                    product.slAgriData.annualProduction ||
                    product.slAgriData.sinhalaAnnualProduction ||
                    product.slAgriData.averageYield ||
                    product.slAgriData.sinhalaAverageYield ||
                    (product.slAgriData.districts && product.slAgriData.districts.length > 0)
                  )
                ) && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">{t('agro.slData', 'Sri Lanka Data')}</p>

                      {(product.slAgriData.cultivationArea || product.slAgriData.sinhalaCultivationArea) && (
                        <div className="flex justify-between items-center text-sm gap-2">
                          <span className="text-gray-500">{t('agro.cultivationArea', 'Cultivation Area')}:</span>
                          <span className="font-medium text-gray-800 text-right">
                            {isSinhala
                              ? (product.slAgriData.sinhalaCultivationArea || product.slAgriData.cultivationArea)
                              : (product.slAgriData.cultivationArea || product.slAgriData.sinhalaCultivationArea)}
                          </span>
                        </div>
                      )}

                      {(product.slAgriData.annualProduction || product.slAgriData.sinhalaAnnualProduction) && (
                        <div className="flex justify-between items-center text-sm gap-2">
                          <span className="text-gray-500">{t('agro.annualProd', 'Annual Prod')}:</span>
                          <span className="font-medium text-gray-800 text-right">
                            {isSinhala
                              ? (product.slAgriData.sinhalaAnnualProduction || product.slAgriData.annualProduction)
                              : (product.slAgriData.annualProduction || product.slAgriData.sinhalaAnnualProduction)}
                          </span>
                        </div>
                      )}

                      {(product.slAgriData.averageYield || product.slAgriData.sinhalaAverageYield) && (
                        <div className="flex justify-between items-center text-sm gap-2">
                          <span className="text-gray-500">{t('agro.avgYield', 'Avg Yield')}:</span>
                          <span className="font-medium text-gray-800 text-right">
                            {isSinhala
                              ? (product.slAgriData.sinhalaAverageYield || product.slAgriData.averageYield)
                              : (product.slAgriData.averageYield || product.slAgriData.sinhalaAverageYield)}
                          </span>
                        </div>
                      )}

                      {product.slAgriData.districts && product.slAgriData.districts.length > 0 && (
                        <div className="pt-1">
                          <p className="text-xs text-gray-500 mb-2">{t('agro.topDistricts', 'Top Districts')}:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {product.slAgriData.districts.map((d: any, idx: number) => (
                              <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100 font-medium">
                                {isSinhala ? (d.sinhalaDistrictName || d.districtName) : (d.districtName || d.sinhalaDistrictName)} {d.percentage}%
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Global Agri Data */}
                {product.globalAgriData && product.globalAgriData.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">{t('agro.globalData', 'Global Data')}</p>
                    {product.globalAgriData.map((g: any, idx: number) => {
                      const countryLabel = isSinhala ? (g.sinhalaCountryName || g.countryName) : (g.countryName || g.sinhalaCountryName);
                      return (
                        <div key={idx} className="text-sm bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-center mb-1.5 border-b border-gray-200/50 pb-1.5">
                            <span className="font-bold text-gray-800">#{g.rank || idx + 1} {countryLabel}</span>
                          </div>
                          <div className="flex flex-col gap-1 text-xs text-gray-500 font-medium">
                            {g.production && (
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-gray-400 whitespace-nowrap">{t('agro.production', 'Production')}:</span>
                                <span className="text-right text-gray-700">{g.production}</span>
                              </div>
                            )}
                            {g.cultivationArea && (
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-gray-400 whitespace-nowrap">{t('agro.area', 'Area')}:</span>
                                <span className="text-right text-gray-700">{g.cultivationArea}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
