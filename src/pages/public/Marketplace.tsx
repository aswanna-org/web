import PageHero from '../../components/public/PageHero';
import { useTranslation } from 'react-i18next';

export default function Marketplace() {
  const { t } = useTranslation();

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <PageHero 
        title={t('marketplace.title', 'MARKETPLACE')} 
        description={t('marketplace.desc', 'Buy seeds, fertilizers, and agricultural equipment.')} 
        image="https://images.unsplash.com/photo-1592681890287-1b0337c8b0eb?w=1600&q=80"
        gradientColor="#e6b800"
      />
      <div className="container mx-auto px-4 lg:px-12 py-12 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 text-xl">Marketplace Content Coming Soon...</p>
      </div>
    </div>
  );
}
