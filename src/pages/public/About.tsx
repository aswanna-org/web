import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="w-full min-h-screen bg-white font-roboto">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex flex-col justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f8b8d]/90 via-black/50 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-40 md:pt-32">
          <div className="max-w-3xl">
            <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-black uppercase mb-6 drop-shadow-xl tracking-tight">
              {t('aboutPage.title')}
            </h1>
            <p className="text-gray-100 text-lg sm:text-xl leading-relaxed max-w-2xl font-light drop-shadow-md whitespace-pre-line">
              {t('aboutPage.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="w-full py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 max-w-7xl mx-auto">

            {/* Left Content */}
            <div className="flex-1 w-full max-w-4xl">
              <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-gray-900 mb-8 uppercase tracking-wide leading-tight">
                {t('aboutPage.weAre')} <br className="hidden sm:block lg:hidden" />
                <span className="font-thin text-gray-400">{t('aboutPage.farm')}</span>
              </h2>

              <div className="space-y-6 text-gray-500 font-light leading-relaxed text-lg max-w-2xl">
                <p>
                  We believe in helping brands create through strategy, <span className="text-[var(--color-primary)] font-medium">story-telling, digital products</span>, and integrated experiences on web, mobile, and in the world. And you're here, friends, because you also believe.
                </p>
                <p>
                  Our team has a passion for making things with real value. This has led us to assemble a multi-talented group that can do just about anything: from building sets to photographing food, crafting websites to developing apps, beautiful design to adventure cinematography. Designers, engineers, creatives, makers, developers, artists, unite. Let's do something real-special together.
                </p>
                <p>
                  Our team has a passion for making things with real value. This has led us to assemble a multi-talented group that can do just about anything: from building sets to photographing food, crafting websites.
                </p>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-1 relative w-full flex justify-center lg:justify-end mt-12 lg:mt-0">
              <div className="relative w-[300px] sm:w-[450px] h-[400px] sm:h-[600px]">
                <img
                  src="/images/wheat.png"
                  alt="Wheat Field"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
