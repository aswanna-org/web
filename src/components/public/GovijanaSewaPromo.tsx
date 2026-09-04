import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function GovijanaSewaPromo() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

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
              <h2 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-bold text-[#143d4d] leading-[1.1] tracking-tight mb-4">
                {isSinhala ? (
                  <>ගොවිජන සේවා මධ්‍යස්ථාන<br />සොයන්න.</>
                ) : (
                  <>Find Agrarian<br />Centers.</>
                )}
              </h2>

              <p className="text-base md:text-lg text-gray-500 max-w-2xl mb-8 font-medium leading-relaxed">
                {isSinhala
                  ? 'දිවයින පුරා පිහිටි ගොවිජන සේවා මධ්‍යස්ථාන වල තොරතුරු, ලිපිනයන් සහ නිලධාරීන්ගේ විස්තර පහසුවෙන් ලබාගන්න.'
                  : 'High-end access to information, locations, and official contacts for Agrarian Service Centers across the island.'}
              </p>

              <Link
                to="/govijana-sewa"
                className="inline-flex items-center gap-3 bg-[var(--color-primary)]/90 border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)] text-white px-8 py-4 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {isSinhala ? 'දැන් පිවිසෙන්න' : 'Access Directory'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
