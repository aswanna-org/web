import HeroCarousel from '../../components/public/HeroCarousel';
import ProductsSection from '../../components/public/ProductsSection';
import FeaturesSection from '../../components/public/FeaturesSection';
import AboutSection from '../../components/public/AboutSection';
import MarketPricesSection from '../../components/public/MarketPricesSection';
import PromoBanner from '../../components/public/PromoBanner';
import GovijanaSewaPromo from '../../components/public/GovijanaSewaPromo';

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
        <PromoBanner />
      </main>
    </div>
  );
}
