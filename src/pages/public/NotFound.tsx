import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  ShoppingBag, 
  Sprout, 
  BookOpen, 
  Newspaper, 
  Building, 
  ArrowLeft,
  Compass
} from 'lucide-react';
import SEO from '../../components/common/SEO';

export default function NotFound() {
  const { i18n } = useTranslation();
  const isSi = i18n.language === 'si';

  const quickLinks = [
    {
      title: isSi ? 'මුල් පිටුව' : 'Home',
      desc: isSi ? 'ප්‍රධාන පිටුවට යන්න' : 'Return to homepage',
      href: '/',
      icon: Home,
      color: 'bg-emerald-600'
    },
    {
      title: isSi ? 'කෘෂි වෙළඳපොල' : 'Marketplace',
      desc: isSi ? 'කෘෂි ද්‍රව්‍ය හා නිෂ්පාදන' : 'Agri products & supplies',
      href: '/marketplace',
      icon: ShoppingBag,
      color: 'bg-amber-600'
    },
    {
      title: isSi ? 'වගා උපදෙස් හා දැනුම' : 'Agro Knowledge Hub',
      desc: isSi ? 'බෝග වගා තාක්ෂණය' : 'Crop guides & farming tech',
      href: '/agro',
      icon: Sprout,
      color: 'bg-green-700'
    },
    {
      title: isSi ? 'කෘෂි පාඨමාලා' : 'Education & Courses',
      desc: isSi ? 'කෙටිකාලීන හා ඩිප්ලෝමා' : 'Short courses & training',
      href: '/education',
      icon: BookOpen,
      color: 'bg-blue-600'
    },
    {
      title: isSi ? 'නවතම පුවත්' : 'Agri News',
      desc: isSi ? 'දිනපතා කෘෂිකාර්මික තොරතුරු' : 'Latest farming news',
      href: '/news',
      icon: Newspaper,
      color: 'bg-indigo-600'
    },
    {
      title: isSi ? 'ගොවිජන සේවා මධ්‍යස්ථාන' : 'Govijana Sewa',
      desc: isSi ? 'දිවයින පුරා මධ්‍යස්ථාන තොරතුරු' : 'Agrarian service centers',
      href: '/govijana-sewa',
      icon: Building,
      color: 'bg-teal-700'
    }
  ];

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center py-12 sm:py-20 px-4 font-roboto">
      <SEO
        title={isSi ? '404 - පිටුව හමු නොවීය' : '404 - Page Not Found'}
        description={isSi ? 'ඔබ සොයන පිටුව සොයාගත නොහැක. අස්වැන්න මුල් පිටුවට හෝ වෙනත් සේවාවකට පිවිසෙන්න.' : 'The page you are looking for does not exist on Aswanna. Explore our homepage and services.'}
        noindex={true}
      />

      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Visual Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shadow-inner">
            <Compass className="w-12 h-12 sm:w-16 sm:h-16 stroke-[1.8] animate-spin-slow" />
          </div>
          <span className="absolute -top-2 -right-3 bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-3 py-1 rounded-full shadow-md">
            404
          </span>
        </div>

        {/* Titles */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {isSi ? 'කණගාටුයි, පිටුව හමු නොවීය!' : 'Oops! Page Not Found'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            {isSi
              ? 'ඔබ පිවිසීමට උත්සාහ කළ වෙබ් පිටුවේ ලිපිනය වෙනස් වී හෝ ඉවත් කර තිබිය හැක. පහත සබැඳි මඟින් ඔබට අවශ්‍ය අංශය වෙත පහසුවෙන් පිවිසිය හැක.'
              : 'The link you clicked may be broken, or the page may have been moved or removed. Try exploring our popular agriculture sections below.'}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#006837] hover:bg-[#00522b] text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft size={16} />
            <span>{isSi ? 'මුල් පිටුවට යන්න' : 'Back to Home'}</span>
          </Link>
        </div>

        {/* Quick Links Grid */}
        <div className="pt-6 border-t border-gray-100">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            {isSi ? 'ප්‍රධාන අංශ වෙත පිවිසෙන්න' : 'Explore Popular Sections'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
            {quickLinks.map((link) => {
              const IconComp = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${link.color} text-white flex items-center justify-center shrink-0`}>
                      <IconComp size={16} />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {link.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 line-clamp-1">
                    {link.desc}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

