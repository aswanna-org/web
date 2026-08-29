export type MediaType = 'photo' | 'video';

export interface GalleryItem {
  id: string;
  type: MediaType;
  url: string; // Image URL or Video embed URL
  thumbnail?: string; // Optional thumbnail for videos
  title?: string;
  titleSi?: string;
}

export const GALLERY_DATA: GalleryItem[] = [
  // PHOTOS
  {
    id: 'g-1',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1592982537447-6f296b0c2656?w=800&q=80',
    title: 'Morning Harvest',
    titleSi: 'උදෑසන අස්වැන්න',
  },
  {
    id: 'g-2',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&q=80',
    title: 'Fresh Vegetables',
    titleSi: 'නැවුම් එළවළු',
  },
  {
    id: 'g-3',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    title: 'Tractor in Field',
    titleSi: 'කුඹුරේ ට්‍රැක්ටරය',
  },
  {
    id: 'g-4',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&q=80',
    title: 'Greenhouse Plants',
    titleSi: 'හරිතාගාර ශාක',
  },
  {
    id: 'g-5',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    title: 'Farm Field Sunrise',
    titleSi: 'ගොවිපළේ හිරු උදාව',
  },
  {
    id: 'g-6',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80',
    title: 'Farmers Working',
    titleSi: 'වැඩකරන ගොවීන්',
  },

  // VIDEOS
  {
    id: 'v-1',
    type: 'video',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
    thumbnail: 'https://images.unsplash.com/photo-1592982537447-6f296b0c2656?w=800&q=80',
    title: 'Aswanna Farm Tour',
    titleSi: 'අස්වන්න ගොවිපළ චාරිකාව',
  },
  {
    id: 'v-2',
    type: 'video',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
    thumbnail: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&q=80',
    title: 'Organic Farming Process',
    titleSi: 'කාබනික ගොවිතැන් ක්‍රියාවලිය',
  },
  {
    id: 'v-3',
    type: 'video',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
    thumbnail: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&q=80',
    title: 'Greenhouse Technology',
    titleSi: 'හරිතාගාර තාක්ෂණය',
  }
];
