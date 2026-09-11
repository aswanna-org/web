import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function GovijanaSewaPromo() {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-gray-50/50 relative overflow-hidden py-12 flex justify-center items-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-[10%] w-[800px] h-[400px] bg-[#fb923c] rounded-[100%] mix-blend-multiply filter blur-[120px] opacity-40 transform -rotate-45 scale-150"></div>
        <div className="absolute bottom-1/4 right-[10%] w-[600px] h-[600px] bg-[#38bdf8] rounded-[100%] mix-blend-multiply filter blur-[140px] opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white rounded-[100%] filter blur-[80px] opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 flex justify-center">

        <div className="relative w-full overflow-hidden group rounded-[40px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">

          <div className="relative bg-white/40 backdrop-blur-[24px] border-[1.5px] border-white/80 rounded-[40px] py-12 px-6 md:px-12 lg:px-24 overflow-hidden min-h-[300px] flex flex-col justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
            <div className="relative z-10 max-w-4xl">
              <h2 className="text-[2.2rem] md:text-[3.2rem] lg:text-[3.8rem] font-black text-[#0f4d30] leading-[1.15] tracking-tight mb-4">
                {t('agriHubPromo.subtitle', 'කෘෂි තොරතුරු කේන්ද්‍රය')}
              </h2>

              <p className="text-base md:text-lg text-gray-600 max-w-2xl mb-8 font-medium leading-relaxed">
                {t('agriHubPromo.desc', 'කෘෂිකර්මාන්තය සම්බන්ධ සියලු තොරතුරු ඔබට එක්තැනින් පහසුවෙන් ලබා ගැනීම.')}
              </p>

              <Link
                to="/agri-info-hub"
                className="inline-flex items-center gap-3 bg-[#006837] hover:bg-[#00522c] text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
              >
                {t('agriHubPromo.button', 'පිවිසෙන්න')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
