import HeroCarousel from '../../components/public/HeroCarousel';
import ProductsSection from '../../components/public/ProductsSection';
import FeaturesSection from '../../components/public/FeaturesSection';
import AboutSection from '../../components/public/AboutSection';
import MarketPricesSection from '../../components/public/MarketPricesSection';
import PromoBanner from '../../components/public/PromoBanner';
import GovijanaSewaPromo from '../../components/public/GovijanaSewaPromo';
import NewsSection from '../../components/public/NewsSection';
import BlogsSection from '../../components/public/BlogsSection';
import Footer from '../../components/public/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
        <Footer />
      </main>
    </div>
  );
}
