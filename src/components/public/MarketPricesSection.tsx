import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketItem {
  id: string;
  image: string;
  nameKey: string;
  nameSinhala: string | null;
  price: string;
  trend: 'up' | 'down';
  change: string;
}

export default function MarketPricesSection() {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketPrices = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/products/market-prices`);
        if (res.ok) {
          const data = await res.json();
          setMarketData(data);
        }
      } catch (error) {
        console.error('Failed to fetch market prices', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketPrices();
  }, []);

  // Duplicate the array to create a seamless infinite scrolling effect if there is data
  const displayData = marketData.length > 0 ? [...marketData, ...marketData] : [];

  return (
    <section className="w-full py-16 relative overflow-hidden font-roboto">
      {/* Soft gradient background to enhance glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e0f2f1] to-[#f4f7f6] z-0"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--color-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 z-0"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Column: Market Prices */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="mb-10 text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-secondary)] mb-3">
                {t('market.title')}
              </h2>
              <p className="text-gray-600 max-w-2xl text-lg">
                {t('market.subtitle')}
              </p>
            </div>

            <div className="w-full pr-0 lg:pr-8 flex-1">
              {/* Scrolling Container */}
              <div className="h-[450px] lg:h-full min-h-[400px] overflow-hidden relative" style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-2"></div>
                    Loading prices...
                  </div>
                ) : marketData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No market prices available.
                  </div>
                ) : (
                  <div className="flex flex-col animate-vertical-scroll gap-4 pt-4 pb-12 absolute inset-0">
                    {displayData.map((item, index) => (
                      <div 
                        key={`${item.id}-${index}`} 
                        className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md border border-white/20 shadow-md rounded-2xl transition-transform hover:-translate-y-1 w-full shrink-0"
                      >
                        
                        {/* Product Info */}
                        <div className="flex items-center gap-4 w-1/2">
                          <img 
                            src={item.image} 
                            alt={isSinhala && item.nameSinhala ? item.nameSinhala : item.nameKey} 
                            className="w-12 h-12 rounded-full object-cover shadow-sm border border-white"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-lg">
                              {isSinhala && item.nameSinhala ? item.nameSinhala : item.nameKey}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">1 Kg</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="w-1/4 text-right">
                           <p className="font-bold text-gray-900 text-lg">{item.price.replace('Rs. ', '')}</p>
                           <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Rs</p>
                        </div>

                        {/* Trend Indicator */}
                        <div className="w-1/4 flex flex-col items-end justify-center">
                          <div className={`flex items-center gap-1 font-bold ${item.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                            {item.trend === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            <span className="text-base">{item.change}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">Trend</span>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Market Insights & Subscribe */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0 flex flex-col">
             <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[450px] lg:h-full flex-1">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80" 
                  alt="Fresh Market Produce" 
                  className="w-full h-full object-cover absolute inset-0" 
                />
                
                {/* Dark Overlay for text readability */}
                <div className="absolute inset-0 bg-black/50"></div>

                {/* Floating Glassmorphism Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                    {t('market.insightsTitle')}
                  </h3>
                  <p className="text-white/90 text-lg mb-8 leading-relaxed max-w-md">
                    {t('market.insightsDesc')}
                  </p>
                  
                  <div className="flex flex-col gap-4 w-full max-w-md">
                    <input 
                      type="email" 
                      placeholder={t('market.emailPlaceholder')} 
                      className="w-full px-5 py-4 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 outline-none focus:border-white transition-colors text-center"
                    />
                    <button className="w-full py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold rounded-full transition-colors shadow-lg uppercase tracking-wider">
                      {t('market.subscribe')}
                    </button>
                  </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
