import HeroCarousel from '../../components/public/HeroCarousel';
import ProductsSection from '../../components/public/ProductsSection';
import FeaturesSection from '../../components/public/FeaturesSection';
import AboutSection from '../../components/public/AboutSection';
import MarketPricesSection from '../../components/public/MarketPricesSection';
import PromoBanner from '../../components/public/PromoBanner';
import GovijanaSewaPromo from '../../components/public/GovijanaSewaPromo';
import NewsSection from '../../components/public/NewsSection';
import BlogsSection from '../../components/public/BlogsSection';
import SmarterGrowthSection from '../../components/public/SmarterGrowthSection';
import CoursesSection from '../../components/public/CoursesSection';
import Footer from '../../components/public/Footer';
import useScrollReveal from '../../utils/useScrollReveal';
import SEO from '../../components/common/SEO';

export default function Home() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEO 
        title="Aswanna - Digital Hub for Sri Lankan Agriculture | අස්වැන්න"
        description="ශ්‍රී ලාංකේය කෘෂිකර්මාන්තයට නවීන තාක්ෂණයේ සවිය එක් කරමින්, බිම් මට්ටමේ ගොවියාගේ සිට වාණිජ ව්‍යවසායකයා දක්වා නිවැරදි දැනුමෙන් සන්නද්ධ කරන පුරෝගාමී ඩිජිටල් කේන්ද්‍රස්ථානය - Aswanna Ceylon Agro."
        keywords="Aswanna, අස්වැන්න, Sri Lanka Agriculture, කෘෂිකර්මාන්තය, ගොවිතැන, Govijana Sewa, Modern Farming, Crop Advisory, Agro Marketplace"
        canonical="/"
      />
      <main className="flex-grow">
        <HeroCarousel />
        <FeaturesSection />
        <GovijanaSewaPromo />
        <ProductsSection />
        <AboutSection />
        <MarketPricesSection />
        <NewsSection />
        <PromoBanner />
        <BlogsSection />
        <SmarterGrowthSection />
        <CoursesSection />
        <Footer />
      </main>
    </div>
  );
}
