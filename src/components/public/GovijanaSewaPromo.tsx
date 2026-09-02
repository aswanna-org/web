import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function GovijanaSewaPromo() {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  return (
    <section className="w-full bg-gray-50/50 relative overflow-hidden py-16 flex justify-center items-center">
      
      {/* Background ambient sweeps */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large soft orange sweep */}
        <div className="absolute top-1/4 left-[10%] w-[800px] h-[400px] bg-[#fb923c] rounded-[100%] mix-blend-multiply filter blur-[120px] opacity-40 transform -rotate-45 scale-150"></div>
        {/* Large soft blue sweep */}
        <div className="absolute bottom-1/4 right-[10%] w-[600px] h-[600px] bg-[#38bdf8] rounded-[100%] mix-blend-multiply filter blur-[140px] opacity-30"></div>
        {/* Central highlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white rounded-[100%] filter blur-[80px] opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-12 relative z-10 flex justify-center">
        
        {/* The Glassmorphism Frame */}
        <div className="relative w-full max-w-[1000px] rounded-[40px] overflow-hidden group shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          
          <div className="relative bg-white/40 backdrop-blur-[24px] border-[1.5px] border-white/80 rounded-[40px] p-8 md:p-12 lg:p-16 overflow-hidden min-h-[450px] flex flex-col justify-between shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]">
            
            {/* Inner top gradient reflection */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
            
            {/* Top Bar */}
            <div className="flex justify-between items-start w-full relative z-10 mb-12">
              <div className="text-gray-500 text-sm font-bold tracking-wide leading-relaxed">
                {isSinhala ? (
                  <>අස්වැන්න /<br />ගොවිජන සේවා තොරතුරු පද්ධතිය</>
                ) : (
                  <>Aswanna System /<br />Agrarian Services Information</>
                )}
              </div>
              <div className="text-[var(--color-primary)] text-sm font-bold tracking-widest uppercase bg-[var(--color-primary)]/10 px-4 py-1.5 rounded-full">
                +Govijana-Sewa
              </div>
            </div>

            {/* Main Content (Middle/Bottom) */}
            <div className="relative z-10 max-w-2xl mt-auto">
              <h2 className="text-[2.5rem] md:text-[4rem] lg:text-[4.5rem] font-bold text-[#143d4d] leading-[1.05] tracking-tight mb-6">
                {isSinhala ? (
                  <>ගොවිජන සේවා<br />මධ්‍යස්ථාන සොයන්න.</>
                ) : (
                  <>Find Agrarian<br />Centers.</>
                )}
              </h2>
              
              <p className="text-base md:text-lg text-gray-500 max-w-lg mb-8 font-medium leading-relaxed">
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
