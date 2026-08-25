import { MapPin, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHero from '../../components/public/PageHero';

export default function Contact() {
  const { t } = useTranslation();
  return (
    <div className="w-full min-h-screen bg-white font-roboto">
      {/* Hero Section */}
      <PageHero 
        title="CONTACT US" 
        description={t('contact.desc')} 
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#e87f3b"
      />

      {/* Info Section */}
      <section className="w-full py-24 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center max-w-6xl mx-auto">

            {/* Address */}
            <div className="flex flex-col items-center">
              <div className="mb-6 bg-white border-2 border-[var(--color-primary)] rounded-full p-4 shadow-sm">
                <MapPin className="w-8 h-8 text-[var(--color-primary)] stroke-[1.5]" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase mb-4 tracking-widest">
                {t('contact.address')}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed whitespace-pre-line">
                {t('contact.addressValue')}
              </p>
            </div>

            {/* Phone */}
            <div className="flex flex-col items-center">
              <div className="mb-6 bg-white border-2 border-[var(--color-primary)] rounded-full p-4 shadow-sm">
                <Phone className="w-8 h-8 text-[var(--color-primary)] stroke-[1.5]" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase mb-4 tracking-widest">
                {t('contact.phone')}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed whitespace-pre-line">
                {t('contact.phoneValue')}
              </p>
            </div>

            {/* Email */}
            <div className="flex flex-col items-center">
              <div className="mb-6 bg-white border-2 border-[var(--color-primary)] rounded-full p-4 shadow-sm">
                <Mail className="w-8 h-8 text-[var(--color-primary)] stroke-[1.5]" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase mb-4 tracking-widest">
                {t('contact.email')}
              </h3>
              <a href="mailto:support@agrocompany.com" className="text-gray-500 font-medium hover:text-[var(--color-primary)] transition-colors underline decoration-gray-300 underline-offset-4">
                support@agrocompany.com
              </a>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
