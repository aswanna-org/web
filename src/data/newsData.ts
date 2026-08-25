export interface NewsArticle {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string[];
  image: string;
  content: string[];
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Government Introduces New Subsidy Scheme for Organic Fertilizer',
    author: 'Ministry of Agriculture',
    date: '2 hours ago',
    category: ['Policy', 'Farming'],
    image: 'https://images.unsplash.com/photo-1628102491629-778571d893a3?w=800&q=80',
    content: [
      'In a major move to support sustainable agriculture, the government has announced a new subsidy scheme aimed at promoting the use of organic fertilizers among local farmers. The initiative is expected to reduce the dependency on chemical alternatives and improve soil health across the island.',
      'Under this scheme, registered farmers will receive up to 50% subsidy on certified organic fertilizer purchases. The Ministry of Agriculture stated that this is part of a broader vision to transition Sri Lanka into a hub for organic produce.',
      'Farmers can apply for the subsidy through their local Agrarian Service Centers starting next month. Officials urge the farming community to take full advantage of this program to secure a greener future for the agricultural sector.'
    ]
  },
  {
    id: 'news-2',
    title: 'Record Harvest Expected for Maha Season Paddy Cultivation',
    author: 'Agrarian Services Board',
    date: '5 hours ago',
    category: ['Harvest', 'Paddy'],
    image: 'https://images.unsplash.com/photo-1595804368541-11915deba293?w=800&q=80',
    content: [
      'Favorable weather conditions and timely distribution of seeds have set the stage for what experts are predicting to be a record-breaking harvest for the upcoming Maha season. Major paddy-producing districts, including Ampara, Polonnaruwa, and Anuradhapura, report excellent crop growth.',
      'The Agrarian Services Board highlighted that the adoption of modern irrigation techniques and new high-yield paddy varieties have significantly contributed to this positive outlook.',
      'Authorities are currently preparing storage facilities and coordinating with the Paddy Marketing Board to ensure a smooth purchasing process, preventing post-harvest losses and ensuring farmers receive a fair price for their yield.'
    ]
  },
  {
    id: 'news-3',
    title: 'New Export Opportunities for Sri Lankan Cinnamon',
    author: 'Export Development Board',
    date: '1 day ago',
    category: ['Export', 'Spices'],
    image: 'https://images.unsplash.com/photo-1596647952402-95995254bd03?w=800&q=80',
    content: [
      'Sri Lanka\'s famed Ceylon Cinnamon is poised to enter new markets in Eastern Europe and South America, following successful trade negotiations facilitated by the Export Development Board (EDB).',
      'The unique flavor profile and health benefits of Ceylon Cinnamon, often referred to as "true cinnamon," continue to drive high demand globally. The EDB is launching targeted marketing campaigns to differentiate it from cheaper alternatives like Cassia.',
      'Local growers are advised to maintain strict quality control and adhere to international food safety standards to capitalize on these emerging lucrative markets. Training programs on value addition and packaging are being organized across major cinnamon-growing regions.'
    ]
  },
  {
    id: 'news-4',
    title: 'Workshop on Advanced Greenhouse Technologies',
    author: 'Department of Agriculture',
    date: '2 days ago',
    category: ['Technology', 'Education'],
    image: 'https://images.unsplash.com/photo-1585421557007-42217c919a3b?w=800&q=80',
    content: [
      'A comprehensive workshop focusing on the latest advancements in greenhouse farming was held in Kandy, drawing participation from over 200 progressive farmers and agricultural entrepreneurs.',
      'The event covered crucial topics such as automated climate control systems, hydroponics, and pest management in controlled environments. Experts from the Department of Agriculture provided hands-on demonstrations.',
      'Such initiatives are vital for modernizing the sector, allowing farmers to cultivate high-value crops year-round while minimizing the impact of unpredictable weather patterns and optimizing resource usage.'
    ]
  },
  {
    id: 'news-5',
    title: 'Rising Demand for Local Dairy Products',
    author: 'National Livestock Board',
    date: '3 days ago',
    category: ['Livestock', 'Market'],
    image: 'https://images.unsplash.com/photo-1574542617696-6d655f4be8c8?w=800&q=80',
    content: [
      'The local dairy industry is experiencing a significant boom as consumer preference shifts towards fresh, locally produced milk and dairy products. Supermarkets and local vendors report a consistent increase in sales.',
      'The National Livestock Board attributes this growth to improved breeding programs and better veterinary care, which have enhanced milk yields. Furthermore, public awareness campaigns regarding the nutritional benefits of fresh local milk have played a key role.',
      'To sustain this momentum, the government is looking to invest further in cold chain logistics and milk chilling centers, ensuring that high-quality products reach consumers efficiently across the country.'
    ]
  }
];

export function getNewsById(id: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find(article => article.id === id);
}
