import { useState, useEffect } from 'react';
import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';
import { Search, ShoppingCart, Filter, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Pagination from '../../components/admin/Pagination';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  quantity: number | null;
  image: string | null;
  category: string;
  categorySinhala: string | null;
}

const PREDEFINED_CATEGORIES = [
  { en: "Pohora", si: "පොහොර" },
  { en: "Upakarana", si: "උපකරණ" },
  { en: "Bija", si: "බීජ" },
  { en: "Prakashana", si: "ප්‍රකාශන" }
];

export default function Marketplace() {
  const { t, i18n } = useTranslation();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { addToCart, itemCount, setIsCartOpen } = useCart();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProducts(currentPage);
  }, [searchQuery, selectedCategory, currentPage]);

  const fetchProducts = async (page = 1) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', '12');
      if (searchQuery) queryParams.append('search', searchQuery);
      if (selectedCategory) queryParams.append('category', selectedCategory);
      
      const res = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || data.products || data || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages);
        }
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <PageHero 
        title={t('marketplace.title', 'MARKETPLACE')} 
        description={t('marketplace.desc', 'Buy seeds, fertilizers, and agricultural equipment.')} 
        image="https://images.unsplash.com/photo-1592681890287-1b0337c8b0eb?w=1600&q=80"
        gradientColor="#e6b800"
        icon={ShoppingBag}
        badgeBg="bg-[#e6b800]"
        waveColor="text-gray-50"
      />
      
      {/* Floating Cart Button (Optional, can also put in Navbar) */}
      <div className="fixed bottom-8 right-8 z-40">
        <button 
          onClick={() => setIsCartOpen(true)}
          className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors relative flex items-center justify-center group"
        >
          <ShoppingBag size={24} />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {itemCount}
            </span>
          )}
        </button>
      </div>
      
      <div className="container mx-auto px-4 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar / Filters */}
          <div className="w-full lg:w-1/4">
            <div className="sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Filter size={24} className="text-green-600" />
                {t('marketplace.categories', 'Categories')}
              </h3>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-5 py-4 rounded-xl shadow-sm border transition-all duration-200 hover:-translate-y-1 ${selectedCategory === '' ? 'bg-green-600 border-green-600 text-white shadow-green-200/50 shadow-lg font-medium' : 'bg-white border-gray-100 text-gray-700 hover:border-green-300 hover:shadow-md'}`}
                >
                  <span className="text-base">{t('marketplace.allProducts', 'All Products')}</span>
                </button>
                {PREDEFINED_CATEGORIES.map(cat => {
                  const isSinhala = i18n.language === 'si';
                  const displayCat = isSinhala ? cat.si : cat.en;
                  return (
                    <button 
                      key={cat.en}
                      onClick={() => setSelectedCategory(cat.en)}
                      className={`w-full text-left px-5 py-4 rounded-xl shadow-sm border transition-all duration-200 hover:-translate-y-1 ${selectedCategory === cat.en ? 'bg-green-600 border-green-600 text-white shadow-green-200/50 shadow-lg font-medium' : 'bg-white border-gray-100 text-gray-700 hover:border-green-300 hover:shadow-md'}`}
                    >
                      <span className="text-base">{displayCat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            
            {/* Search Bar */}
            <div className="mb-6 relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-emerald-700">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-full border border-gray-200/90 bg-gray-50/70 hover:bg-white focus:bg-white hover:border-emerald-500/60 focus:border-[#006837] focus:ring-3 focus:ring-[#006837]/15 outline-none transition-all duration-200 text-xs sm:text-sm text-gray-800 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {/* Product Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <ShoppingCart className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or category filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <div 
                    key={product.id} 
                    style={{ animationDelay: `${Math.min(index * 45, 600)}ms` }}
                    className="animate-card-pop bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                  >
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <ShoppingCart className="text-gray-400" size={32} />
                        </div>
                      )}
                      {product.category && (
                        <div 
                          className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-medium text-green-700 shadow-sm max-w-[calc(100%-1.5rem)] truncate"
                          title={product.categorySinhala ? `${product.category} | ${product.categorySinhala}` : product.category}
                        >
                          {product.categorySinhala ? `${product.category} | ${product.categorySinhala}` : product.category}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                        {product.description || "No description available."}
                      </p>
                      
                      <div className="flex items-end justify-between mt-auto">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Price</div>
                          <div className="font-bold text-xl text-green-600">Rs. {product.price?.toFixed(2) || '0.00'}</div>
                        </div>
                        <button 
                          onClick={() => addToCart(product, 1)}
                          className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-lg transition-colors shadow-sm shadow-green-600/30 flex items-center justify-center group-hover:scale-110 duration-300"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
