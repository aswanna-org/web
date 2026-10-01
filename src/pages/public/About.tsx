import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Leaf, 
  Target, 
  Eye, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Tv2, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles, 
  Sprout, 
  ShieldCheck, 
  Award
} from 'lucide-react';
import PageHero from '../../components/public/PageHero';
import SEO from '../../components/common/SEO';

export default function About() {
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const stats = [
    {
      num: '10+',
      labelSi: 'දස වසරක ඩිජිටල් මෙහෙවර',
      labelEn: 'Years of Digital Mission',
      subSi: '2014 සිට අඛණ්ඩව',
      subEn: 'Continuous since 2014'
    },
    {
      num: '100K+',
      labelSi: 'සම්බන්ධ වූ ගොවි ප්‍රජාව',
      labelEn: 'Farmers & Agri-Learners',
      subSi: 'දිවයින පුරා ජාලගත',
      subEn: 'Islandwide Network'
    },
    {
      num: '25',
      labelSi: 'දිස්ත්‍රික් ආවරණය',
      labelEn: 'Districts Reached',
      subSi: 'සමස්ත ශ්‍රී ලංකාව',
      subEn: 'Across Sri Lanka'
    },
    {
      num: '100%',
      labelSi: 'නොමිලේ ප්‍රායෝගික දැනුම',
      labelEn: 'Free Practical Knowledge',
      subSi: 'ගොවිබිමට සෘජුවම',
      subEn: 'Direct to the Fields'
    }
  ];

  const services = [
    {
      idx: '01',
      icon: Tv2,
      titleKey: 'aboutPage.service1Title',
      textKey: 'aboutPage.service1Text',
      badgeSi: 'මාධ්‍ය හා තොරතුරු',
      badgeEn: 'Media & Knowledge',
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-700',
    },
    {
      idx: '02',
      icon: Leaf,
      titleKey: 'aboutPage.service2Title',
      textKey: 'aboutPage.service2Text',
      badgeSi: 'ක්ෂේත්‍ර උපදේශනය',
      badgeEn: 'Field Advisory',
      color: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50',
      iconColor: 'text-green-700',
    },
    {
      idx: '03',
      icon: TrendingUp,
      titleKey: 'aboutPage.service3Title',
      textKey: 'aboutPage.service3Text',
      badgeSi: 'ව්‍යවසායකත්වය',
      badgeEn: 'Entrepreneurship',
      color: 'from-teal-500 to-cyan-600',
      bg: 'bg-teal-50',
      iconColor: 'text-teal-700',
    },
    {
      idx: '04',
      icon: BookOpen,
      titleKey: 'aboutPage.service4Title',
      textKey: 'aboutPage.service4Text',
      badgeSi: 'අධ්‍යාපනය හා පුහුණු',
      badgeEn: 'Education & Training',
      color: 'from-emerald-600 to-lime-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-800',
    },
  ];

  const corePillars = [
    {
      icon: Sprout,
      titleSi: 'නව්‍ය තාක්ෂණය',
      titleEn: 'Modern Innovation',
      descSi: 'ස්මාර්ට් බෝග නිරීක්ෂණය සහ නවීන ඩිජිටල් මෙවලම් භාවිතය',
      descEn: 'Smart crop monitoring and modern digital tools'
    },
    {
      icon: Users,
      titleSi: 'ගොවි කේන්ද්‍රීය ප්‍රවේශය',
      titleEn: 'Farmer-Centric Approach',
      descSi: 'බිම් මට්ටමේ ගොවියාගේ ගැටලුවලට සැබෑ ක්ෂේත්‍ර විසඳුම්',
      descEn: 'Real field solutions for grassroots farmers'
    },
    {
      icon: ShieldCheck,
      titleSi: 'තිරසර කෘෂිකර්මය',
      titleEn: 'Sustainable Farming',
      descSi: 'පස හා ජලය සුරකින පරිසර හිතකාමී වගා ක්‍රමවේද',
      descEn: 'Eco-friendly practices preserving soil & water'
    },
    {
      icon: Award,
      titleSi: 'විශ්වාසනීය ගුණාත්මකභාවය',
      titleEn: 'Trusted Excellence',
      descSi: 'දශකයක ක්ෂේත්‍ර ප්‍රවීණත්වය සහ නිල ආයතනික පිළිගැනීම',
      descEn: 'A decade of field expertise and recognized trust'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#faf9f6] font-roboto">
      <SEO 
        title={isSinhala ? 'අප ගැන | About Us' : 'About Us | Aswanna Ceylon Agro'}
        description={isSinhala 
          ? 'දශකයක ඩිජිටල් මෙහෙවරක සිට තිරසර කෘෂි පරිවර්තනයක් දක්වා. ශ්‍රී ලාංකේය කෘෂිකර්මාන්තයට නවීන තාක්ෂණයේ සවිය එක් කරන Aswanna Ceylon Agro (PVT) LTD.'
          : 'From a decade-long digital mission to sustainable agricultural transformation. Empowering Sri Lankan agriculture with modern technology - Aswanna Ceylon Agro.'}
        canonical="/about"
        keywords="About Aswanna, අප ගැන, Aswanna Ceylon Agro, Sri Lanka Agri Tech, කෘෂි මෙහෙවර"
      />
      {/* ── 1. Page Hero ── */}
      <PageHero
        title={t('aboutPage.title', 'Aswanna Ceylon Agro (PVT) LTD')}
        subtitle={t('aboutPage.subtitle', 'අප ගැන | ABOUT US')}
        description={t('aboutPage.desc', 'දශකයක ඩිජිටල් මෙහෙවරක සිට තිරසර කෘෂි පරිවර්තනයක් දක්වා')}
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#054a29"
        icon={Building2}
        badgeBg="bg-[#054a29]"
        waveColor="text-[#faf9f6]"
      />

      {/* ── 2. Open Executive Overview & Stats (Clean Flow, No Outer Box Card) ── */}
      <section className="w-full pt-12 sm:pt-16 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isSinhala ? 'ඩිජිටල් කෘෂි පුරෝගාමියා' : 'Pioneering Digital Agriculture'}</span>
            </div>

            <h2 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 leading-snug tracking-tight mb-6 ${isSinhala ? 'font-noto' : ''}`}>
              {t('aboutPage.desc', 'දශකයක ඩිජිටල් මෙහෙවරක සිට තිරසර කෘෂි පරිවර්තනයක් දක්වා')}
            </h2>

            <p className={`text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed font-normal mb-8 max-w-4xl ${isSinhala ? 'font-noto' : ''}`}>
              {t('aboutPage.intro')}
            </p>

            {/* Action Buttons with Signature Rotating Animation */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/pages/contact"
                className="glass-btn-green group px-8 py-3.5 text-sm sm:text-base font-bold gap-3 shadow-md hover:shadow-xl transition-all cursor-pointer"
              >
                <span>{t('aboutPage.getInTouch', 'අප හා සම්බන්ධ වන්න')}</span>
                <div className="btn-circle-icon group-hover:rotate-45 transition-transform duration-300">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </Link>

              <Link
                to="/agro"
                className="glass-btn-light group px-7 py-3.5 text-sm sm:text-base font-bold text-gray-800 hover:text-emerald-900 border border-gray-300/80 transition-all cursor-pointer gap-2.5"
              >
                <span>{isSinhala ? 'කෘෂි තාක්ෂණය ගවේෂණය කරන්න' : 'Explore Agro Technology'}</span>
                <div className="btn-circle-icon group-hover:rotate-45 transition-transform duration-300">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </Link>
            </div>
          </div>

          {/* Clean Open Stats Divider Bar (No Card Box, Just Natural Flow) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 pt-12 mt-12 sm:mt-16 border-t border-gray-200">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="text-center group"
              >
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#054a29] tracking-tight mb-1.5 transition-transform group-hover:scale-105 duration-200">
                  {stat.num}
                </p>
                <p className={`text-sm sm:text-base font-bold text-gray-800 leading-snug mb-1 ${isSinhala ? 'font-noto' : ''}`}>
                  {isSinhala ? stat.labelSi : stat.labelEn}
                </p>
                <p className={`text-xs text-gray-500 font-medium ${isSinhala ? 'font-noto' : ''}`}>
                  {isSinhala ? stat.subSi : stat.subEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Origin Story & Digital Journey (Open 2-Column Editorial Flow) ── */}
      <section className="w-full py-16 sm:py-24 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            {/* Left Column: Narrative (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isSinhala ? 'අපගේ ආරම්භය හා ගමන් මඟ' : 'Our Story & Journey'}</span>
              </div>

              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-6 leading-snug ${isSinhala ? 'font-noto' : ''}`}>
                {t('aboutPage.originTitle')}
              </h2>

              {/* Quote-style Lead Box */}
              <div className="relative mb-6 pl-5 border-l-4 border-[#054a29] bg-emerald-50/40 rounded-r-2xl p-4 sm:p-5">
                <p className={`text-gray-800 text-base sm:text-lg font-medium leading-relaxed ${isSinhala ? 'font-noto' : ''}`}>
                  {t('aboutPage.originText')}
                </p>
              </div>

              {/* Narrative Text */}
              <p className={`text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 font-normal ${isSinhala ? 'font-noto' : ''}`}>
                {t('aboutPage.originText2')}
              </p>

              {/* Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isSinhala ? 'නොමිලේ බෙදාහළ කෘෂි දැනුම' : 'Free Agricultural Knowledge'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isSinhala ? 'බිම් මට්ටමේ ගොවි සබඳතාව' : 'Grassroots Farmer Connect'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isSinhala ? 'නව්‍ය බෝග ආරක්ෂණ ක්‍රම' : 'Modern Crop Protection'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isSinhala ? 'පසු අස්වනු තාක්ෂණය' : 'Post-Harvest Technologies'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Artwork */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[28px] overflow-hidden shadow-2xl aspect-[4/5] max-h-[500px] w-full">
                <img
                  src="/images/wheat.png"
                  alt="Aswanna Sri Lanka Agriculture"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                {/* Floating Glassmorphic Badge */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xl border border-white/80">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 shadow-xs">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className={`text-xs text-gray-500 font-medium ${isSinhala ? 'font-noto' : ''}`}>
                          {isSinhala ? 'ලක්ෂ සංඛ්‍යාත ගොවි විශ්වාසය' : 'Trusted by Farmers'}
                        </p>
                        <p className={`text-sm sm:text-base font-extrabold text-gray-900 leading-tight ${isSinhala ? 'font-noto' : ''}`}>
                          {isSinhala ? 'ශ්‍රී ලංකාවේ විශ්වාසනීය කෘෂි නාමය' : 'Sri Lanka\'s Trusted Agro Hub'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. Corporate Incorporation Milestone Banner ── */}
      <section className="w-full py-16 sm:py-24 bg-gradient-to-br from-[#042f1a] via-[#085a33] to-[#042415] text-white relative overflow-hidden">
        {/* Ambient Lighting Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content (8 cols) */}
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
                <Building2 className="w-4 h-4" />
                <span>{isSinhala ? 'ආයතනික වර්ධනය' : 'Corporate Identity'}</span>
              </div>

              <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-5 ${isSinhala ? 'font-noto' : ''}`}>
                {t('aboutPage.foundingTitle')}
              </h2>

              <p className={`text-sm sm:text-base lg:text-lg text-emerald-100/90 leading-relaxed font-normal mb-8 max-w-3xl ${isSinhala ? 'font-noto' : ''}`}>
                {t('aboutPage.foundingText')}
              </p>

              {/* Action Buttons with Rotating Hover Animation */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/pages/contact"
                  className="glass-btn-green group px-8 py-3.5 text-sm sm:text-base font-bold gap-3 cursor-pointer shadow-lg hover:shadow-xl transition-all"
                >
                  <span>{isSinhala ? 'අප හා අත්වැල් බැඳගන්න' : 'Partner With Us'}</span>
                  <div className="btn-circle-icon group-hover:rotate-45 transition-transform duration-300">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </Link>

                <Link
                  to="/agro"
                  className="glass-btn-light group !bg-white/15 hover:!bg-white/25 !text-white !border-white/30 px-7 py-3.5 text-sm sm:text-base font-bold backdrop-blur-md transition-all cursor-pointer gap-2.5"
                >
                  <span>{isSinhala ? 'කෘෂි තාක්ෂණය බලන්න' : 'View Technologies'}</span>
                  <div className="btn-circle-icon group-hover:rotate-45 transition-transform duration-300">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Right Brand Emblem (4 cols) */}
            <div className="lg:col-span-4 flex justify-center items-center">
              <div className="relative p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 text-center shadow-2xl w-full max-w-sm">
                <img
                  src="/images/aswanna_logo.png"
                  alt="Aswanna Logo"
                  className="w-44 sm:w-52 h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)] mx-auto mb-4 hover:scale-105 transition-transform duration-300"
                />
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold">
                    Aswanna Ceylon Agro (PVT) LTD
                  </p>
                  <p className="text-xs text-emerald-100/70">
                    {isSinhala ? 'ලියාපදිංචි නෛතික සමාගමකි' : 'Registered Agricultural Enterprise'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. Main Services Section ── */}
      <section id="services" className="w-full py-16 sm:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isSinhala ? 'අපේ කාර්යයන්' : 'What We Do'}</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-3 ${isSinhala ? 'font-noto' : ''}`}>
              {t('aboutPage.servicesTitle')}
            </h2>
            <p className={`text-sm sm:text-base text-gray-500 leading-relaxed ${isSinhala ? 'font-noto' : ''}`}>
              {isSinhala
                ? 'ශ්‍රී ලාංකේය කෘෂිකර්මාන්තයේ ඵලදායිතාව සහ ගුණාත්මකභාවය ඉහළ නැංවීමට අප සපයන ප්‍රධාන සේවාවන්.'
                : 'Comprehensive services designed to elevate agricultural productivity, sustainability, and commercial success.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.idx}
                  className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-9 border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Icon + Badge + Index */}
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-13 h-13 rounded-2xl ${svc.bg} border border-emerald-100 flex items-center justify-center ${svc.iconColor} group-hover:scale-110 group-hover:bg-[#054a29] group-hover:text-white transition-all duration-300 shadow-xs`}>
                        <Icon className="w-6 h-6 stroke-[2]" />
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                          {isSinhala ? svc.badgeSi : svc.badgeEn}
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-gray-200 group-hover:text-emerald-200 transition-colors">
                          {svc.idx}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-[#054a29] transition-colors ${isSinhala ? 'font-noto' : ''}`}>
                      {t(svc.titleKey)}
                    </h3>

                    {/* Text */}
                    <p className={`text-sm sm:text-base text-gray-600 leading-relaxed font-normal ${isSinhala ? 'font-noto' : ''}`}>
                      {t(svc.textKey)}
                    </p>
                  </div>

                  {/* Accent Line */}
                  <div className={`mt-6 h-1 w-full rounded-full bg-gradient-to-r ${svc.color} opacity-20 group-hover:opacity-100 transition-opacity duration-300`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. Vision & Mission Section ── */}
      <section className="w-full py-16 sm:py-24 bg-gradient-to-b from-[#f3f7f4] to-[#faf9f6] border-y border-emerald-900/10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Vision Card */}
            <div className="relative bg-white rounded-3xl p-8 sm:p-10 lg:p-12 border border-emerald-100 shadow-sm flex flex-col justify-between group hover:border-emerald-300 transition-all duration-300">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-6 shadow-xs group-hover:scale-110 transition-transform">
                  <Eye className="w-7 h-7 stroke-[2]" />
                </div>

                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-2">
                  VISION
                </span>

                <h3 className={`text-2xl sm:text-3xl font-black text-gray-900 mb-4 ${isSinhala ? 'font-noto' : ''}`}>
                  {t('aboutPage.visionTitle')}
                </h3>

                <p className={`text-gray-600 leading-relaxed text-base lg:text-lg font-normal mb-6 ${isSinhala ? 'font-noto' : ''}`}>
                  {t('aboutPage.visionText')}
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                  {isSinhala ? 'තිරසර කෘෂිකර්මය' : 'Sustainable Agriculture'}
                </span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                  {isSinhala ? 'නවීන තාක්ෂණය' : 'Modern Technology'}
                </span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                  {isSinhala ? 'කෘෂි ව්‍යවසායකත්වය' : 'Agri-Entrepreneurship'}
                </span>
              </div>
            </div>

            {/* Mission Card */}
            <div className="relative bg-gradient-to-br from-[#054a29] to-[#0c6b3e] text-white rounded-3xl p-8 sm:p-10 lg:p-12 shadow-md border border-emerald-500/30 flex flex-col justify-between group">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6 shadow-xs group-hover:scale-110 transition-transform border border-white/20">
                  <Target className="w-7 h-7 stroke-[2]" />
                </div>

                <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest block mb-2">
                  MISSION
                </span>

                <h3 className={`text-2xl sm:text-3xl font-black text-white mb-4 ${isSinhala ? 'font-noto' : ''}`}>
                  {t('aboutPage.missionTitle')}
                </h3>

                <p className={`text-emerald-50 leading-relaxed text-base lg:text-lg font-normal mb-6 ${isSinhala ? 'font-noto' : ''}`}>
                  {t('aboutPage.missionText')}
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-2 pt-4 border-t border-white/15">
                <span className="text-xs font-semibold text-white bg-white/15 px-3 py-1 rounded-full border border-white/20">
                  {isSinhala ? 'ප්‍රායෝගික දැනුම' : 'Practical Knowledge'}
                </span>
                <span className="text-xs font-semibold text-white bg-white/15 px-3 py-1 rounded-full border border-white/20">
                  {isSinhala ? 'විශ්වාසනීය මඟපෙන්වීම' : 'Trusted Guidance'}
                </span>
                <span className="text-xs font-semibold text-white bg-white/15 px-3 py-1 rounded-full border border-white/20">
                  {isSinhala ? 'ඉහළම ඵලදායිතාව' : 'Highest Productivity'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 7. Guiding Pillars (Open Layout, No Card Wrapper) ── */}
      <section className="w-full py-16 sm:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h3 className={`text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2.5 ${isSinhala ? 'font-noto' : ''}`}>
              {isSinhala ? 'අපගේ මූලික කුලුනු' : 'Our Guiding Pillars'}
            </h3>
            <p className={`text-sm sm:text-base text-gray-500 ${isSinhala ? 'font-noto' : ''}`}>
              {isSinhala
                ? 'අපගේ සෑම සේවාවක් සහ තීරණයක්ම මෙහෙයවනු ලබන මූලික හර පද්ධතිය'
                : 'The foundational principles that guide every solution and partnership'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {corePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={idx} 
                  className="flex flex-col items-center sm:items-start text-center sm:text-left group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 mb-4 group-hover:bg-[#054a29] group-hover:text-white transition-all duration-300 shadow-xs">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h4 className={`text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-[#054a29] transition-colors ${isSinhala ? 'font-noto' : ''}`}>
                    {isSinhala ? pillar.titleSi : pillar.titleEn}
                  </h4>
                  <p className={`text-xs sm:text-sm text-gray-500 leading-relaxed ${isSinhala ? 'font-noto' : ''}`}>
                    {isSinhala ? pillar.descSi : pillar.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 8. Call To Action (Signature Banner with Animated Buttons) ── */}
      <section className="w-full pb-16 sm:pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative rounded-[32px] sm:rounded-[40px] overflow-hidden bg-gradient-to-br from-[#042f1a] via-[#094828] to-[#042415] text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-emerald-600/30 text-center">
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold uppercase tracking-wider border border-white/15">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSinhala ? 'අප හා එක්වන්න' : 'Get In Touch'}</span>
              </div>

              <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight ${isSinhala ? 'font-noto' : ''}`}>
                {isSinhala ? 'ශ්‍රී ලාංකේය කෘෂිකර්මාන්තයේ නව පරිච්ඡේදයකට අත්වැල් බඳින්න' : 'Join the Next Era of Sri Lankan Agriculture'}
              </h2>

              <p className={`text-sm sm:text-base lg:text-lg text-emerald-100/90 leading-relaxed font-normal max-w-2xl mx-auto ${isSinhala ? 'font-noto' : ''}`}>
                {isSinhala
                  ? 'ඔබේ කෘෂිකාර්මික ගමනේ ඊළඟ පියවර ගැනීමට, නිවැරදි උපදෙස් හා සේවාවන් ලබාගැනීමට අපගේ කණ්ඩායම සූදානම්.'
                  : 'Our experienced advisory team is ready to guide your agricultural journey toward higher yields, sustainability, and business growth.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
                <Link
                  to="/pages/contact"
                  className="glass-btn-green group px-8 py-3.5 text-sm sm:text-base font-bold gap-3 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                >
                  <span>{t('aboutPage.getInTouch', 'අප හා සම්බන්ධ වන්න')}</span>
                  <div className="btn-circle-icon group-hover:rotate-45 transition-transform duration-300">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </Link>

                <Link
                  to="/agro"
                  className="glass-btn-light group !bg-white/15 hover:!bg-white/25 !text-white !border-white/30 px-7 py-3.5 text-sm sm:text-base font-bold backdrop-blur-md transition-all cursor-pointer gap-2.5"
                >
                  <span>{isSinhala ? 'කෘෂි තාක්ෂණය ගවේෂණය කරන්න' : 'Explore Agro Tech'}</span>
                  <div className="btn-circle-icon group-hover:rotate-45 transition-transform duration-300">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
