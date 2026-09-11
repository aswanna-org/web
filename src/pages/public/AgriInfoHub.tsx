import { useState } from 'react';
import { Landmark, Building2, MapPin, Globe2, ArrowRight, X, Phone, Mail, Globe, MapPin as LocationIcon, Search, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHero from '../../components/public/PageHero';

interface DirectoryItem {
  id: string;
  nameSi: string;
  nameEn: string;
  categorySi: string;
  categoryEn: string;
  phone: string;
  email: string;
  website: string;
  addressSi: string;
  addressEn: string;
  descriptionSi: string;
  descriptionEn: string;
}

const GOVERNMENT_INSTITUTIONS: DirectoryItem[] = [
  {
    id: 'gov-1',
    nameSi: 'කෘෂිකර්ම අමාත්‍යාංශය',
    nameEn: 'Ministry of Agriculture',
    categorySi: 'රාජ්‍ය අමාත්‍යාංශය',
    categoryEn: 'Ministry',
    phone: '+94 11 286 8920',
    email: 'info@agrimin.gov.lk',
    website: 'https://www.agrimin.gov.lk',
    addressSi: 'ගොවිජන මන්දිරය, බත්තරමුල්ල',
    addressEn: 'Govijana Mandiraya, Battaramulla',
    descriptionSi: 'ශ්‍රී ලංකාවේ සමස්ත කෘෂිකාර්මික ප්‍රතිපත්ති, නියාමනය සහ සංවර්ධන වැඩසටහන් මෙහෙයවීම.',
    descriptionEn: 'Formulation of policies, regulation, and implementation of national agricultural development programs.'
  },
  {
    id: 'gov-2',
    nameSi: 'කෘෂිකර්ම දෙපාර්තමේන්තුව (DOA)',
    nameEn: 'Department of Agriculture (DOA)',
    categorySi: 'රාජ්‍ය දෙපාර්තමේන්තුව',
    categoryEn: 'Department',
    phone: '+94 81 238 8011',
    email: 'dgagriculture@doa.gov.lk',
    website: 'https://www.doa.gov.lk',
    addressSi: 'පේරාදෙණිය, මහනුවර',
    addressEn: 'Peradeniya, Kandy',
    descriptionSi: 'බෝග පර්යේෂණ, බීජ සහ රෝපණ ද්‍රව්‍ය සහතික කිරීම සහ කෘෂි ව්‍යාප්ති සේවා සැපයීම.',
    descriptionEn: 'Crop research, seed & planting material certification, and agricultural extension services.'
  },
  {
    id: 'gov-3',
    nameSi: 'ගොවිජන සංවර්ධන දෙපාර්තමේන්තුව',
    nameEn: 'Department of Agrarian Development',
    categorySi: 'රාජ්‍ය දෙපාර්තමේන්තුව',
    categoryEn: 'Department',
    phone: '+94 11 269 4323',
    email: 'info@agrariandept.gov.lk',
    website: 'https://www.agrariandept.gov.lk',
    addressSi: 'අංක 42, ශ්‍රීමත් මාකස් ප්‍රනාන්දු මාවත, කොළඹ 07',
    addressEn: 'No. 42, Sir Marcus Fernando Mawatha, Colombo 07',
    descriptionSi: 'දිවයින පුරා ගොවිජන සේවා මධ්‍යස්ථාන (ASC) පාලනය, ගොවි සංවිධාන සහ වාරිමාර්ග නඩත්තුව.',
    descriptionEn: 'Management of Agrarian Service Centers (ASC), farmer organizations, and minor irrigation networks.'
  },
  {
    id: 'gov-4',
    nameSi: 'හෙක්ටර් කොබ්බෑකඩුව ගොවි කටයුතු පර්යේෂණ හා පුහුණු කිරීමේ ආයතනය (HARTI)',
    nameEn: 'Hector Kobbekaduwa Agrarian Research and Training Institute (HARTI)',
    categorySi: 'පර්යේෂණ ආයතනය',
    categoryEn: 'Research Institute',
    phone: '+94 11 269 6981',
    email: 'director@harti.gov.lk',
    website: 'https://www.harti.gov.lk',
    addressSi: 'අංක 114, විජේරාම මාවත, කොළඹ 07',
    addressEn: 'No. 114, Wijerama Mawatha, Colombo 07',
    descriptionSi: 'වෙළඳපල මිල දත්ත විශ්ලේෂණය, සමාජ-ආර්ථික පර්යේෂණ සහ ගොවිජන පුහුණු වැඩසටහන්.',
    descriptionEn: 'Agricultural socio-economic research, commodity price analysis, and farmer training.'
  },
  {
    id: 'gov-5',
    nameSi: 'ශ්‍රී ලංකා කෘෂිකාර්මික පර්යේෂණ ප්‍රතිපත්ති සභාව (SLCARP)',
    nameEn: 'Sri Lanka Council for Agricultural Research Policy (SLCARP)',
    categorySi: 'ප්‍රතිපත්ති සභාව',
    categoryEn: 'Council',
    phone: '+94 11 269 7648',
    email: 'info@slcarp.lk',
    website: 'https://www.slcarp.lk',
    addressSi: 'අංක 114/9, විජේරාම මාවත, කොළඹ 07',
    addressEn: 'No. 114/9, Wijerama Mawatha, Colombo 07',
    descriptionSi: 'ජාතික කෘෂිකාර්මික පර්යේෂණ පද්ධතිය සම්බන්ධීකරණය සහ ප්‍රතිපත්ති සම්පාදනය.',
    descriptionEn: 'Coordination and policy guidance for the National Agricultural Research System (NARS).'
  },
  {
    id: 'gov-6',
    nameSi: 'පොල් වගා කිරීමේ මණ්ඩලය',
    nameEn: 'Coconut Cultivation Board (CCB)',
    categorySi: 'ව්‍යවස්ථාපිත මණ්ඩලය',
    categoryEn: 'Statutory Board',
    phone: '+94 11 286 1927',
    email: 'info@ccb.gov.lk',
    website: 'https://www.ccb.gov.lk',
    addressSi: 'අංක 9/428, ඩෙන්සිල් කොබ්බෑකඩුව මාවත, බත්තරමුල්ල',
    addressEn: 'No. 9/428, Denzil Kobbekaduwa Mawatha, Battaramulla',
    descriptionSi: 'පොල් වගාව ප්‍රවර්ධනය, සහනාධාර සහ පැළ බෙදාහැරීමේ සේවා.',
    descriptionEn: 'Promotion of coconut cultivation, advisory services, and subsidy disbursement.'
  }
];

const PRIVATE_INSTITUTIONS: DirectoryItem[] = [
  {
    id: 'pvt-1',
    nameSi: 'හේලීස් ඇග්‍රිකල්චර් (Hayleys Agriculture)',
    nameEn: 'Hayleys Agriculture Holdings Ltd',
    categorySi: 'කෘෂි තාක්ෂණ සහ යෙදවුම්',
    categoryEn: 'Agri Inputs & Tech',
    phone: '+94 11 268 8963',
    email: 'agriculture@hayleys.com',
    website: 'https://www.hayleysagriculture.com',
    addressSi: 'අංක 25, ෆොස්ටර් පටුමග, කොළඹ 10',
    addressEn: 'No. 25, Foster Lane, Colombo 10',
    descriptionSi: 'බීජ, බිංදු ජල සම්පාදන පද්ධති, හරිතාගාර සහ කෘෂි ඩ්‍රෝන තාක්ෂණය සැපයීම.',
    descriptionEn: 'Certified hybrid seeds, drip irrigation, greenhouse setups, and modern agri drones.'
  },
  {
    id: 'pvt-2',
    nameSi: 'සී.අයි.සී. හෝල්ඩින්ග්ස් (CIC Agri Businesses)',
    nameEn: 'CIC Agri Businesses (Pvt) Ltd',
    categorySi: 'බීජ සහ පොහොර',
    categoryEn: 'Seeds & Fertilizer',
    phone: '+94 11 235 9359',
    email: 'agri@cic.lk',
    website: 'https://www.cic.lk',
    addressSi: 'සීඅයිසී මන්දිරය, අංක 199, කෑගල්ල පාර, කොළඹ 02',
    addressEn: 'CIC House, No. 199, Kew Road, Colombo 02',
    descriptionSi: 'උසස් තත්ත්වයේ එළවළු හා වී බීජ, කාබනික පොහොර සහ සත්ව ආහාර සැපයීම.',
    descriptionEn: 'High yielding seed production, specialty plant nutrition, and soil health management.'
  },
  {
    id: 'pvt-3',
    nameSi: 'ඒ. බෝවර් සමාගම (A. Baur & Co.)',
    nameEn: 'A. Baur & Co. (Pvt) Ltd',
    categorySi: 'පොහොර සහ ශාක පෝෂණය',
    categoryEn: 'Plant Nutrition',
    phone: '+94 11 472 8700',
    email: 'info@baurs.com',
    website: 'https://www.baurs.com',
    addressSi: 'අංක 5, ඉහළ චැතම් වීදිය, කොළඹ 01',
    addressEn: 'No. 5, Upper Chatham Street, Colombo 01',
    descriptionSi: 'ශ්‍රී ලංකාවේ ප්‍රමුඛතම රසායනික හා කාබනික පොහොර නිෂ්පාදන සහ තාක්ෂණික උපදෙස්.',
    descriptionEn: 'Bio-fertilizers, soil conditioning, advanced precision farming solutions.'
  },
  {
    id: 'pvt-4',
    nameSi: 'ඩීමෝ ඇග්‍රිබිස්නස් (DIMO Agribusinesses)',
    nameEn: 'DIMO Agribusinesses',
    categorySi: 'යන්ත්‍රෝපකරණ සහ ස්මාර්ට් කෘෂිකර්මය',
    categoryEn: 'Agri Machinery & Smart Farming',
    phone: '+94 11 244 9797',
    email: 'dimo@dimolanka.com',
    website: 'https://www.dimolanka.com',
    addressSi: 'අංක 65, ජෙට්ටි පාර, කොළඹ 14',
    addressEn: 'No. 65, Jethawana Road, Colombo 14',
    descriptionSi: 'ට්‍රැක්ටර්, අස්වනු නෙලන යන්ත්‍ර සහ නවීන කෘෂි කාර්මික උපකරණ අලෙවිය සහ සේවාව.',
    descriptionEn: 'Mahindra tractors, combine harvesters, power weeders, and smart mechanization tools.'
  }
];

const INTERNATIONAL_INSTITUTIONS: DirectoryItem[] = [
  {
    id: 'intl-1',
    nameSi: 'එක්සත් ජාතීන්ගේ ආහාර හා කෘෂිකර්ම සංවිධානය (FAO)',
    nameEn: 'Food and Agriculture Organization of the UN (FAO)',
    categorySi: 'එක්සත් ජාතීන්ගේ නියෝජිතායතනය',
    categoryEn: 'UN Agency',
    phone: '+94 11 258 8537',
    email: 'FAO-LK@fao.org',
    website: 'https://www.fao.org/srilanka',
    addressSi: 'අංක 202, බෞද්ධාලෝක මාවත, කොළඹ 07',
    addressEn: 'No. 202, Bauddhaloka Mawatha, Colombo 07',
    descriptionSi: 'ආහාර සුරක්ෂිතතාව, ගොවි ධාරිතා සංවර්ධනය සහ කාබනික ප්‍රතිපත්ති සඳහා සහාය.',
    descriptionEn: 'Supporting food security, sustainable agri practices, and smallholder empowerment in Sri Lanka.'
  },
  {
    id: 'intl-2',
    nameSi: 'ජාත්‍යන්තර ජල කළමනාකරණ ආයතනය (IWMI / CGIAR HQ)',
    nameEn: 'International Water Management Institute (IWMI)',
    categorySi: 'ගෝලීය පර්යේෂණ මූලස්ථානය',
    categoryEn: 'Global Research HQ',
    phone: '+94 11 288 0000',
    email: 'iwmi@cgiar.org',
    website: 'https://www.iwmi.cgiar.org',
    addressSi: 'අංක 127, සුනිල් ප්‍රනාන්දු මාවත, පැලවත්ත, බත්තරමුල්ල',
    addressEn: 'No. 127, Sunil Mawatha, Pelawatte, Battaramulla',
    descriptionSi: 'කෘෂිකාර්මික ජල කළමනාකරණය, දේශගුණික විපර්යාස සහ තිරසාර වාරි පර්යේෂණ මූලස්ථානය.',
    descriptionEn: 'Global research headquarters for water solutions, climate-smart irrigation, and ecosystem resilience.'
  },
  {
    id: 'intl-3',
    nameSi: 'කෘෂිකාර්මික සංවර්ධනය සඳහා වූ ජාත්‍යන්තර අරමුදල (IFAD)',
    nameEn: 'International Fund for Agricultural Development (IFAD)',
    categorySi: 'ජාත්‍යන්තර මූල්‍ය ආයතනය',
    categoryEn: 'International Financial Institution',
    phone: '+94 11 205 8450',
    email: 'ifad@ifad.org',
    website: 'https://www.ifad.org',
    addressSi: 'එක්සත් ජාතීන්ගේ සංයුක්ත ගොඩනැගිල්ල, බෞද්ධාලෝක මාවත, කොළඹ 07',
    addressEn: 'UN Compound, Bauddhaloka Mawatha, Colombo 07',
    descriptionSi: 'කුඩා පරිමාණ ගොවීන් සවිබල ගැන්වීම සහ ග්‍රාමීය කෘෂි ව්‍යවසායකත්ව මූල්‍යන වැඩසටහන්.',
    descriptionEn: 'Investing in rural people, financing agribusiness value chains, and poverty reduction projects.'
  },
  {
    id: 'intl-4',
    nameSi: 'ලෝක බැංකුව - කෘෂිකර්ම හා ආහාර ගෝලීය අංශය',
    nameEn: 'World Bank - Agriculture Global Practice Sri Lanka',
    categorySi: 'ජාත්‍යන්තර සංවර්ධන බැංකුව',
    categoryEn: 'Development Bank',
    phone: '+94 11 556 1300',
    email: 'infocmb@worldbank.org',
    website: 'https://www.worldbank.org/en/country/srilanka',
    addressSi: 'අංක 73/5, ගාලු පාර, කොළඹ 03',
    addressEn: 'No. 73/5, Galle Road, Colombo 03',
    descriptionSi: 'කෘෂිකාර්මික නවීකරණය, දේශගුණික ඔරොත්තු දීමේ ව්‍යාපෘති සහ අගය දාම මූල්‍යකරණය.',
    descriptionEn: 'Agricultural modernization projects, climate resilience grants, and agribusiness finance.'
  }
];

export default function AgriInfoHub() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isSinhala = i18n.language === 'si';

  const [activeModal, setActiveModal] = useState<'gov' | 'pvt' | 'intl' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getDirectoryList = () => {
    let list: DirectoryItem[] = [];
    if (activeModal === 'gov') list = GOVERNMENT_INSTITUTIONS;
    if (activeModal === 'pvt') list = PRIVATE_INSTITUTIONS;
    if (activeModal === 'intl') list = INTERNATIONAL_INSTITUTIONS;

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(item =>
      item.nameSi.toLowerCase().includes(query) ||
      item.nameEn.toLowerCase().includes(query) ||
      item.descriptionSi.toLowerCase().includes(query) ||
      item.descriptionEn.toLowerCase().includes(query) ||
      item.addressSi.toLowerCase().includes(query) ||
      item.addressEn.toLowerCase().includes(query)
    );
  };

  const getModalTitle = () => {
    if (activeModal === 'gov') {
      return isSinhala ? 'රාජ්‍ය ආයතන තොරතුරු කේන්ද්‍රය' : 'Government Institutions Directory';
    }
    if (activeModal === 'pvt') {
      return isSinhala ? 'පුද්ගලික ආයතන තොරතුරු කේන්ද්‍රය' : 'Private Agribusiness Directory';
    }
    if (activeModal === 'intl') {
      return isSinhala ? 'ජාත්‍යන්තර කෘෂිකාර්මික ආයතන' : 'International Agricultural Institutions';
    }
    return '';
  };

  const cards = [
    {
      id: 'gov',
      badgeIcon: Landmark,
      badgeBg: 'bg-[#0f4d30]',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&q=80',
      titleSi: 'රාජ්‍ය ආයතන තොරතුරු කේන්ද්‍රය',
      titleEn: 'Government Institutions Information Hub',
      descSi: 'ශ්‍රී ලංකාවේ කෘෂිකර්මාන්තයට සම්බන්ධ අමාත්‍යාංශ, දෙපාර්තමේන්තු සහ පර්යේෂණ ආයතන වල තොරතුරු.',
      descEn: 'Official directory of ministries, statutory boards, and research institutes.',
      action: () => setActiveModal('gov')
    },
    {
      id: 'pvt',
      badgeIcon: Building2,
      badgeBg: 'bg-[#134e4a]',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      titleSi: 'පුද්ගලික ආයතන තොරතුරු කේන්ද්‍රය',
      titleEn: 'Private Institutions Information Hub',
      descSi: 'බීජ, පොහොර, නවීන කෘෂි යන්ත්‍රෝපකරණ සහ කෘෂි තාක්ෂණික සේවා සපයන ලියාපදිංචි ආයතන.',
      descEn: 'Verified suppliers of seeds, fertilizers, greenhouses, and precision farming tools.',
      action: () => setActiveModal('pvt')
    },
    {
      id: 'officer',
      badgeIcon: MapPin,
      badgeBg: 'bg-[#3f6212]',
      image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&q=80',
      titleSi: 'ඔබේ ප්‍රදේශයේ කෘෂිකර්ම නිලධාරියා සොයාගන්න',
      titleEn: 'Find Your Area Agricultural Officer',
      descSi: 'ඔබේ ප්‍රාදේශීය ලේකම් කොට්ඨාශයේ ගොවිජන සේවා මධ්‍යස්ථාන සහ කෘෂිකර්ම නිලධාරීන් සම්බන්ධ කරගන්න.',
      descEn: 'Locate Agrarian Service Centers (ASC) and Agricultural Instructors in your district.',
      action: () => navigate('/govijana-sewa')
    },
    {
      id: 'intl',
      badgeIcon: Globe2,
      badgeBg: 'bg-[#0e7490]',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      titleSi: 'ජාත්‍යන්තර කෘෂිකාර්මික ආයතන',
      titleEn: 'International Agricultural Institutions',
      descSi: 'තිරසාර කෘෂිකර්මාන්තය නඟාසිටුවීමට දායක වන ගෝලීය ආධාර සහ පර්යේෂණ ආයතන (FAO, IFAD, IWMI).',
      descEn: 'Global bodies driving sustainable agriculture, funding, and international knowledge transfer.',
      action: () => setActiveModal('intl')
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#f7faf8]">
      {/* ── Hero Banner ── */}
      <PageHero
        title={t('agriInfoHub.heroTitle', 'AGRI INFORMATION HUB')}
        description={t('agriInfoHub.heroDesc', 'A unified platform connecting Sri Lankan farmers and agricultural entrepreneurs with Government institutions, Private agribusinesses, Regional Agriculture Officers, and International organizations.')}
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        gradientColor="#0f4d30"
      />

      {/* ── Main Cards Container ── */}
      <div className="container mx-auto px-4 lg:px-12 py-16">

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card) => {
            const Icon = card.badgeIcon;
            return (
              <div
                key={card.id}
                className="bg-white rounded-[28px] border border-gray-100/90 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,104,55,0.12)] transition-all duration-500 overflow-hidden relative group flex flex-col justify-between hover:-translate-y-2 cursor-pointer"
                onClick={card.action}
              >
                {/* Top Image Section with Wave Cut */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <img
                    src={card.image}
                    alt={card.titleEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>

                  {/* Organic Wave Divider matching reference image */}
                  <svg
                    className="absolute -bottom-[1px] left-0 right-0 w-full h-10 text-white fill-current"
                    viewBox="0 0 500 80"
                    preserveAspectRatio="none"
                  >
                    <path d="M0,35 C150,75 350,0 500,40 L500,80 L0,80 Z" />
                  </svg>

                  {/* Circular Badge Icon */}
                  <div className={`absolute bottom-[-16px] left-6 ${card.badgeBg} w-13 h-13 rounded-full flex items-center justify-center text-white shadow-lg border-[3px] border-white z-20 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="pt-7 px-6 pb-6 flex flex-col justify-between flex-1 relative z-10">
                  <div>
                    <h3 className="text-[1.18rem] font-bold text-[#0f4d30] leading-snug tracking-tight mb-1 group-hover:text-[#006837] transition-colors min-h-[54px] flex items-center">
                      {card.titleSi}
                    </h3>
                    <p className="text-xs font-semibold text-gray-500 mb-6 leading-relaxed min-h-[36px]">
                      {card.titleEn}
                    </p>
                  </div>

                  {/* Bottom Action and Green Leaves Decor */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        card.action();
                      }}
                      className="bg-[#006837] hover:bg-[#00522c] text-white px-5 py-2 rounded-full font-bold text-xs inline-flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg group-hover:gap-2.5"
                    >
                      {t('agriInfoHub.enter', 'පිවිසෙන්න')}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    {/* Green Leaves Illustration Decor in Bottom Right */}
                    <div className="pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                      <svg width="48" height="42" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M90 85C72 55 40 50 20 68C15 56 28 35 50 30C72 25 90 42 90 85Z" fill="#4ade80" fillOpacity="0.8" />
                        <path d="M95 90C82 68 62 62 50 76C46 66 56 50 72 45C88 40 96 58 95 90Z" fill="#22c55e" />
                        <path d="M80 92C65 82 50 85 42 92C38 86 44 75 58 70C72 66 82 75 80 92Z" fill="#15803d" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Interactive Directory Modal ── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0f4d30] to-[#186a43] p-6 md:p-8 text-white flex items-center justify-between relative">
              <div>
                <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
                  {t('agriInfoHub.heroTitle', 'Agri Information Hub')}
                </span>
                <h3 className="text-xl md:text-2xl font-black mt-1">
                  {getModalTitle()}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSearchQuery('');
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shadow-inner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-100">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('agriInfoHub.searchPlaceholder', 'Search institutions, officers, or services...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006837]/30 bg-white text-sm font-medium text-gray-800 shadow-sm"
                />
              </div>
            </div>

            {/* Directory Entries List */}
            <div className="p-4 md:p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-gray-200">
              {getDirectoryList().length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-base font-medium">No results matching your query.</p>
                </div>
              ) : (
                getDirectoryList().map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#006837]/30 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-4 justify-between"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="inline-block bg-[#006837]/10 text-[#006837] text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {isSinhala ? item.categorySi : item.categoryEn}
                      </div>
                      <h4 className="text-lg font-bold text-[#0f4d30]">
                        {isSinhala ? item.nameSi : item.nameEn}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        {isSinhala ? item.nameEn : item.nameSi}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed pt-1">
                        {isSinhala ? item.descriptionSi : item.descriptionEn}
                      </p>

                      <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-500 font-medium">
                        {item.addressEn && (
                          <div className="flex items-center gap-1.5">
                            <LocationIcon className="w-3.5 h-3.5 text-[#006837]" />
                            <span>{isSinhala ? item.addressSi : item.addressEn}</span>
                          </div>
                        )}
                        {item.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#006837]" />
                            <a href={`tel:${item.phone}`} className="hover:underline text-gray-700 font-semibold">{item.phone}</a>
                          </div>
                        )}
                        {item.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#006837]" />
                            <a href={`mailto:${item.email}`} className="hover:underline text-gray-700">{item.email}</a>
                          </div>
                        )}
                      </div>
                    </div>

                    {item.website && (
                      <div className="flex items-end md:items-center justify-end shrink-0 pt-2 md:pt-0">
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#006837]/10 hover:bg-[#006837] text-[#006837] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>{t('agriInfoHub.website', 'Visit Website')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSearchQuery('');
                }}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-bold text-sm transition-colors"
              >
                {t('agriInfoHub.modalClose', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
