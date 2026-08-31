import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';

export default function PlantFinder() {
  const { t } = useTranslation();

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <PageHero 
        title={t('plantFinder.title', 'PLANT FINDER')} 
        description={t('plantFinder.desc', 'Find the best crops suited for your soil and climate.')} 
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#1a8f4c"
      />
      <div className="container mx-auto px-4 lg:px-12 py-12 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 text-xl">Plant Finder Content Coming Soon...</p>
      </div>
    </div>
  );
}
