import { useState, useEffect } from 'react';
import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';
import { Search, ShoppingCart, Filter, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

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
  
  const { addToCart, itemCount, setIsCartOpen } = useCart();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (selectedCategory) queryParams.append('category', selectedCategory);
      
      const res = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
      if (res.ok) {
        setProducts(await res.json());
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
            <div className="mb-8 relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 shadow-sm transition-shadow"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
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
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-medium text-green-700 shadow-sm">
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
          </div>
          
        </div>
      </div>
    </div>
  );
}
