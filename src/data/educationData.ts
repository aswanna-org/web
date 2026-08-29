export interface Course {
  id: string;
  title: string;
  titleSi: string;
  subtitle: string;
  subtitleSi: string;
  image: string;
  price: string;
  duration: string; // e.g. "3 Months"
  durationSi: string;
  category: string;
}

export const COURSE_CATEGORIES = ['All', 'Farming', 'Technology', 'Business'];

export const EDUCATION_COURSES: Course[] = [
  {
    id: 'crs-1',
    title: 'Modern Greenhouse Management',
    titleSi: 'නවීන හරිතාගාර කළමනාකරණය',
    subtitle: 'Learn climate control and hydroponics',
    subtitleSi: 'දේශගුණ පාලනය සහ ජල වගාව ඉගෙන ගන්න',
    image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&q=80',
    price: 'Rs. 15,000',
    duration: '3 Months',
    durationSi: 'මාස 3',
    category: 'Farming'
  },
  {
    id: 'crs-2',
    title: 'Agri-Business & Marketing',
    titleSi: 'කෘෂි ව්‍යාපාර සහ අලෙවිකරණය',
    subtitle: 'Scale your farm into a profitable business',
    subtitleSi: 'ඔබේ ගොවිපළ ලාභදායී ව්‍යාපාරයක් බවට පත් කරන්න',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    price: 'Rs. 12,500',
    duration: '2 Months',
    durationSi: 'මාස 2',
    category: 'Business'
  },
  {
    id: 'crs-3',
    title: 'Drone Technology in Agriculture',
    titleSi: 'කෘෂිකර්මාන්තයේ ඩ්‍රෝන තාක්ෂණය',
    subtitle: 'Precision farming using aerial drones',
    subtitleSi: 'ගුවන් ඩ්‍රෝන භාවිතා කරමින් නිරවද්‍ය වගාව',
    image: 'https://images.unsplash.com/photo-1558904541-efa843a96f09?w=800&q=80',
    price: 'Rs. 25,000',
    duration: '4 Weeks',
    durationSi: 'සති 4',
    category: 'Technology'
  },
  {
    id: 'crs-4',
    title: 'Organic Vegetable Cultivation',
    titleSi: 'කාබනික එළවළු වගාව',
    subtitle: 'Chemical-free farming for high yield',
    subtitleSi: 'ඉහළ අස්වැන්නක් සඳහා රසායනික තොර වගාව',
    image: 'https://images.unsplash.com/photo-1595859703064-18c946f0c4bb?w=800&q=80',
    price: 'Rs. 8,000',
    duration: '6 Weeks',
    durationSi: 'සති 6',
    category: 'Farming'
  },
  {
    id: 'crs-5',
    title: 'Smart Irrigation Systems',
    titleSi: 'ස්මාර්ට් ජල සම්පාදන පද්ධති',
    subtitle: 'Automate watering and save resources',
    subtitleSi: 'ජල සම්පාදනය ස්වයංක්‍රීය කර සම්පත් ඉතිරි කරන්න',
    image: 'https://images.unsplash.com/photo-1563514253385-c549aaf9a3f9?w=800&q=80',
    price: 'Rs. 18,000',
    duration: '2 Months',
    durationSi: 'මාස 2',
    category: 'Technology'
  },
  {
    id: 'crs-6',
    title: 'Export Quality Standards',
    titleSi: 'අපනයන ගුණාත්මක ප්‍රමිතීන්',
    subtitle: 'Prepare your produce for global markets',
    subtitleSi: 'ඔබේ නිෂ්පාදන ගෝලීය වෙළෙඳපොළ සඳහා සූදානම් කරන්න',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    price: 'Rs. 20,000',
    duration: '1 Month',
    durationSi: 'මාස 1',
    category: 'Business'
  }
];
