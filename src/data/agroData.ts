// ============================================================
//  Agro Technology Data
//  TODO: Replace with API calls when backend is ready
//  e.g. const data = await fetch('/api/agro-categories')
// ============================================================

export interface AgroProduct {
  id: string;
  name: string;
  nameSi: string;
  image: string;
  price: string;
  unit: string;
  description: string;
  origin: string;
  season: string;
  available: boolean;
}

// Curated color palette for category hero gradients
export const CATEGORY_COLORS = [
  '#2d6a4f', // Forest Green
  '#b5451b', // Burnt Orange
  '#4d4000', // Dark Olive
  '#8e3a59', // Berry Rose
  '#1a6b3c', // Emerald
  '#1a5276', // Deep Blue
  '#0f8b8d', // Teal
  '#7b3f00', // Earthy Brown
  '#4a235a', // Deep Purple
  '#2c3e7a', // Navy
  '#6d4c41', // Warm Cocoa
];

export interface AgroCategory {
  id: string;
  name: string;
  nameSi: string;
  slug: string;
  icon: string;
  image: string;
  color: string;        // gradient color for hero
  description: string;
  products: AgroProduct[];
}

export const AGRO_CATEGORIES: AgroCategory[] = [
  {
    id: 'cat-1',
    name: 'Vegetable Farming',
    nameSi: 'එළවළු වගාව',
    slug: 'vegetable-farming',
    icon: '🥕',
    color: '#2d6a4f',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800&q=80',
    description: 'Fresh, organically grown vegetables sourced directly from local farms across Sri Lanka.',
    products: [
      { id: 'v1', name: 'Carrot', nameSi: 'කැරට්', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80', price: 'Rs. 120/kg', unit: 'kg', description: 'Fresh orange carrots from Nuwara Eliya highlands.', origin: 'Nuwara Eliya', season: 'Year Round', available: true },
      { id: 'v2', name: 'Tomato', nameSi: 'තක්කාලි', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80', price: 'Rs. 85/kg', unit: 'kg', description: 'Ripe, juicy tomatoes from open farms.', origin: 'Dambulla', season: 'Year Round', available: true },
      { id: 'v3', name: 'Leeks', nameSi: 'ලීක්ස්', image: 'https://images.unsplash.com/photo-1624284792651-dc4ef7d88ece?w=400&q=80', price: 'Rs. 60/bundle', unit: 'bundle', description: 'Fresh green leeks ideal for curries.', origin: 'Kandy', season: 'Nov–Mar', available: true },
      { id: 'v4', name: 'Capsicum', nameSi: 'මිරිස් ගෙඩිය', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80', price: 'Rs. 200/kg', unit: 'kg', description: 'Colorful capsicums, sweet and crunchy.', origin: 'Matale', season: 'Year Round', available: true },
      { id: 'v5', name: 'Bitter Gourd', nameSi: 'පාවක්කා', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400&q=80', price: 'Rs. 95/kg', unit: 'kg', description: 'Traditional bitter gourd for healthy cooking.', origin: 'Anuradhapura', season: 'Year Round', available: true },
      { id: 'v6', name: 'Pumpkin', nameSi: 'වට්ටක්කා', image: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400&q=80', price: 'Rs. 55/kg', unit: 'kg', description: 'Large orange pumpkins, perfect for curries.', origin: 'Kurunegala', season: 'Year Round', available: true },
    ],
  },
  {
    id: 'cat-2',
    name: 'Fruit Farming',
    nameSi: 'පළතුරු වගාව',
    slug: 'fruit-farming',
    icon: '🍍',
    color: '#b5451b',
    image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800&q=80',
    description: 'Tropical and seasonal fruits grown across Sri Lanka\'s diverse climate zones.',
    products: [
      { id: 'fr1', name: 'Pineapple', nameSi: 'අන්නාසි', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80', price: 'Rs. 180/piece', unit: 'piece', description: 'Sweet and juicy Sri Lankan pineapples.', origin: 'Gampaha', season: 'Year Round', available: true },
      { id: 'fr2', name: 'Papaya', nameSi: 'පෝෂු', image: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400&q=80', price: 'Rs. 150/kg', unit: 'kg', description: 'Fresh ripe papaya from coastal farms.', origin: 'Negombo', season: 'Year Round', available: true },
      { id: 'fr3', name: 'Mango', nameSi: 'අඹ', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80', price: 'Rs. 250/kg', unit: 'kg', description: 'Juicy Willard mangoes, a local favourite.', origin: 'Jaffna', season: 'Apr–Jul', available: true },
      { id: 'fr4', name: 'Banana', nameSi: 'කෙසෙල්', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80', price: 'Rs. 40/piece', unit: 'piece', description: 'Ripe Ambul bananas from local estates.', origin: 'Kurunegala', season: 'Year Round', available: true },
    ],
  },
  {
    id: 'cat-3',
    name: 'Rice Farming',
    nameSi: 'වී වගාව',
    slug: 'rice-farming',
    icon: '🌾',
    color: '#4d4000',
    image: 'https://images.unsplash.com/photo-1620283085439-39620a1e21c4?w=800&q=80',
    description: 'Premium rice varieties cultivated using traditional and modern irrigation.',
    products: [
      { id: 'r1', name: 'Samba Rice', nameSi: 'සම්බා', image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&q=80', price: 'Rs. 135/kg', unit: 'kg', description: 'Fine-grained Samba rice, a Sri Lankan staple.', origin: 'Polonnaruwa', season: 'Maha & Yala', available: true },
      { id: 'r2', name: 'Nadu Rice', nameSi: 'නාඩු', image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=400&q=80', price: 'Rs. 115/kg', unit: 'kg', description: 'Medium-grain Nadu rice for daily use.', origin: 'Ampara', season: 'Maha & Yala', available: true },
      { id: 'r3', name: 'Red Kekulu', nameSi: 'රතු කෑකුළු', image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400&q=80', price: 'Rs. 155/kg', unit: 'kg', description: 'Traditional red rice, rich in nutrients.', origin: 'Hambantota', season: 'Maha', available: true },
    ],
  },
  {
    id: 'cat-4',
    name: 'Flower Farming',
    nameSi: 'මල් වගාව',
    slug: 'flower-farming',
    icon: '🌸',
    color: '#8e3a59',
    image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc5b?w=800&q=80',
    description: 'Vibrant cut flowers and flowering plants for local and export markets.',
    products: [
      { id: 'f1', name: 'Anthurium', nameSi: 'ඇන්තූරියම්', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80', price: 'Rs. 350/stem', unit: 'stem', description: 'Exotic tropical anthuriums, long-lasting.', origin: 'Kandy', season: 'Year Round', available: true },
      { id: 'f2', name: 'Orchid', nameSi: 'ඔකිඩ්', image: 'https://images.unsplash.com/photo-1596451190630-186aff535bf2?w=400&q=80', price: 'Rs. 500/stem', unit: 'stem', description: 'Beautiful orchids for decor and export.', origin: 'Colombo', season: 'Year Round', available: true },
      { id: 'f3', name: 'Sunflower', nameSi: 'සූරියකාන්ත', image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&q=80', price: 'Rs. 150/stem', unit: 'stem', description: 'Bright yellow sunflowers, fresh cut.', origin: 'Dambulla', season: 'Jun–Sep', available: true },
    ],
  },
  {
    id: 'cat-5',
    name: 'Traditional Paddy',
    nameSi: 'වාණිජ හොඳ වගාව',
    slug: 'traditional-paddy',
    icon: '🌿',
    color: '#1a6b3c',
    image: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&q=80',
    description: 'Heritage paddy varieties preserved using time-honoured cultivation techniques.',
    products: [
      { id: 'tp1', name: 'Madathawalu', nameSi: 'මාදතවළු', image: 'https://images.unsplash.com/photo-1620283085439-39620a1e21c4?w=400&q=80', price: 'Rs. 420/kg', unit: 'kg', description: 'Ancient Sri Lankan rice variety with unique aroma.', origin: 'Kurunegala', season: 'Maha', available: true },
      { id: 'tp2', name: 'Kuruluthuda', nameSi: 'කුරුළුතුඩ', image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400&q=80', price: 'Rs. 380/kg', unit: 'kg', description: 'Fine-grained heirloom variety.', origin: 'Matara', season: 'Maha', available: true },
    ],
  },
  {
    id: 'cat-6',
    name: 'Export Paddy',
    nameSi: 'අපනයන හොඳ වගාව',
    slug: 'export-paddy',
    icon: '🚢',
    color: '#1a5276',
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&q=80',
    description: 'Export-quality paddy varieties meeting international food safety standards.',
    products: [
      { id: 'ep1', name: 'Basmati Grade A', nameSi: 'බාස්මතී ශ්‍රේණිය A', image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&q=80', price: 'Rs. 650/kg', unit: 'kg', description: 'Export-certified fragrant Basmati rice.', origin: 'Anuradhapura', season: 'Year Round', available: true },
    ],
  },
  {
    id: 'cat-7',
    name: 'Aquatic Paddy',
    nameSi: 'අල හොඳ වගාව',
    slug: 'aquatic-paddy',
    icon: '💧',
    color: '#0f8b8d',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    description: 'Paddy cultivation in flooded field systems, supporting biodiversity.',
    products: [
      { id: 'ap1', name: 'Water Paddy', nameSi: 'ජල හොඳ', image: 'https://images.unsplash.com/photo-1620283085439-39620a1e21c4?w=400&q=80', price: 'Rs. 290/kg', unit: 'kg', description: 'Traditional flooded-field paddy variety.', origin: 'Ampara', season: 'Maha', available: true },
    ],
  },
  {
    id: 'cat-8',
    name: 'Tuber Crops',
    nameSi: 'කුඹඩු හොඳ',
    slug: 'tuber-crops',
    icon: '🥔',
    color: '#7b3f00',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
    description: 'Root and tuber crops including potato, sweet potato, and yam.',
    products: [
      { id: 'tb1', name: 'Potato', nameSi: 'අල', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80', price: 'Rs. 140/kg', unit: 'kg', description: 'Fresh highland potatoes from Nuwara Eliya.', origin: 'Nuwara Eliya', season: 'Jun–Sep', available: true },
      { id: 'tb2', name: 'Sweet Potato', nameSi: 'බතල', image: 'https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?w=400&q=80', price: 'Rs. 90/kg', unit: 'kg', description: 'Orange-flesh sweet potato, nutritious and sweet.', origin: 'Kegalle', season: 'Year Round', available: true },
    ],
  },
  {
    id: 'cat-9',
    name: 'Leafy Greens',
    nameSi: 'කොළ එළවළු',
    slug: 'leafy-greens',
    icon: '🥬',
    color: '#4a235a',
    image: 'https://images.unsplash.com/photo-1503062709-edc713cdddbc?w=800&q=80',
    description: 'Leafy greens and specialty vegetables for everyday cooking.',
    products: [
      { id: 'lg1', name: 'Spinach', nameSi: 'නිවිතිය', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', price: 'Rs. 40/bundle', unit: 'bundle', description: 'Fresh green spinach, rich in iron.', origin: 'Colombo', season: 'Year Round', available: true },
      { id: 'lg2', name: 'Mukunuwenna', nameSi: 'මුකුණුවැන්න', image: 'https://images.unsplash.com/photo-1503062709-edc713cdddbc?w=400&q=80', price: 'Rs. 35/bundle', unit: 'bundle', description: 'Traditional Sri Lankan leafy green.', origin: 'Kandy', season: 'Year Round', available: true },
    ],
  },
  {
    id: 'cat-10',
    name: 'Aquatic Vegetables',
    nameSi: 'ලා නාවිත එළවළු',
    slug: 'aquatic-vegetables',
    icon: '🪷',
    color: '#2c3e7a',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    description: 'Vegetables grown in or near water bodies including lotus and water spinach.',
    products: [
      { id: 'av1', name: 'Lotus Root', nameSi: 'නෙළුම් මූල', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80', price: 'Rs. 180/kg', unit: 'kg', description: 'Crisp lotus root, popular in Asian cuisine.', origin: 'Kalutara', season: 'Year Round', available: true },
      { id: 'av2', name: 'Water Spinach', nameSi: 'ගස් නිවිතිය', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', price: 'Rs. 45/bundle', unit: 'bundle', description: 'Tender water spinach, great for stir-fries.', origin: 'Gampaha', season: 'Year Round', available: true },
    ],
  },
  {
    id: 'cat-11',
    name: 'Aquatic Fruits',
    nameSi: 'ලා නාවිත පළතුරු',
    slug: 'aquatic-fruits',
    icon: '🍈',
    color: '#6d4c41',
    image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800&q=80',
    description: 'Exotic tropical fruits cultivated using modern aquaponic systems.',
    products: [
      { id: 'af1', name: 'Water Apple', nameSi: 'ජල ඇපල්', image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&q=80', price: 'Rs. 220/kg', unit: 'kg', description: 'Crispy water apples grown near wetlands.', origin: 'Galle', season: 'Year Round', available: true },
    ],
  },
];

// Helper: get category by slug
export function getCategoryBySlug(slug: string): AgroCategory | undefined {
  return AGRO_CATEGORIES.find((c) => c.slug === slug);
}
