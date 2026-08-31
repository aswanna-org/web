import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';

export default function AgroLands() {
  const { t } = useTranslation();

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <PageHero 
        title={t('agroLands.title', 'AGRO LANDS')} 
        description={t('agroLands.desc', 'Find agricultural lands for sale and lease.')} 
        image="https://images.unsplash.com/photo-1629731215450-4591e1d0ed53?w=1600&q=80"
        gradientColor="#2b6cb0"
      />
      <div className="container mx-auto px-4 lg:px-12 py-12 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 text-xl">Agro Lands Content Coming Soon...</p>
      </div>
    </div>
  );
}
