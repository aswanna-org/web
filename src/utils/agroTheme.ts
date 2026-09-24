export interface AgroTheme {
  primary: string;
  secondary: string;
  badgeRing?: string;
  accent?: string;
}

const KNOWN_THEMES: Record<string, AgroTheme> = {
  // ── Vegetables & Roots ──
  'vegetables': { primary: '#15803d', secondary: '#22c55e', badgeRing: '#16a34a' },
  'vegetable-farming': { primary: '#15803d', secondary: '#22c55e', badgeRing: '#16a34a' },
  'carrot': { primary: '#c2410c', secondary: '#ea580c', badgeRing: '#f97316' },
  'tomato': { primary: '#b91c1c', secondary: '#ef4444', badgeRing: '#f87171' },
  'potato': { primary: '#854d0e', secondary: '#ca8a04', badgeRing: '#eab308' },
  'cabbage': { primary: '#166534', secondary: '#22c55e', badgeRing: '#4ade80' },
  'eggplant': { primary: '#581c87', secondary: '#9333ea', badgeRing: '#a855f7' },
  'brinjal': { primary: '#581c87', secondary: '#9333ea', badgeRing: '#a855f7' },
  'onion': { primary: '#6b21a8', secondary: '#a855f7', badgeRing: '#c084fc' },
  'shallots': { primary: '#7c2d12', secondary: '#c2410c', badgeRing: '#fb923c' },
  'beetroot': { primary: '#831843', secondary: '#db2777', badgeRing: '#f472b6' },
  'pumpkin': { primary: '#c2410c', secondary: '#f97316', badgeRing: '#fb923c' },
  'cucumber': { primary: '#166534', secondary: '#22c55e', badgeRing: '#86efac' },
  'chilli': { primary: '#dc2626', secondary: '#f87171', badgeRing: '#ef4444' },
  'pepper': { primary: '#dc2626', secondary: '#f87171', badgeRing: '#ef4444' },
  'capsicum': { primary: '#047857', secondary: '#10b981', badgeRing: '#34d399' },
  'beans': { primary: '#15803d', secondary: '#22c55e', badgeRing: '#86efac' },
  'radish': { primary: '#9f1239', secondary: '#f43f5e', badgeRing: '#fb7185' },
  'gotukola': { primary: '#14532d', secondary: '#15803d', badgeRing: '#22c55e' },
  'mukunuwenna': { primary: '#14532d', secondary: '#15803d', badgeRing: '#22c55e' },

  // ── Fruits ──
  'fruits': { primary: '#ea580c', secondary: '#f59e0b', badgeRing: '#fbbf24' },
  'fruit-crops': { primary: '#ea580c', secondary: '#f59e0b', badgeRing: '#fbbf24' },
  'mango': { primary: '#b45309', secondary: '#f59e0b', badgeRing: '#fde047' },
  'banana': { primary: '#a16207', secondary: '#facc15', badgeRing: '#fef08a' },
  'papaya': { primary: '#c2410c', secondary: '#fb923c', badgeRing: '#fed7aa' },
  'pineapple': { primary: '#a16207', secondary: '#f59e0b', badgeRing: '#fde047' },
  'avocado': { primary: '#3f6212', secondary: '#84cc16', badgeRing: '#bef264' },
  'passion-fruit': { primary: '#7e22ce', secondary: '#a855f7', badgeRing: '#e9d5ff' },
  'guava': { primary: '#4d7c0f', secondary: '#84cc16', badgeRing: '#d9f99d' },
  'watermelon': { primary: '#9f1239', secondary: '#f43f5e', badgeRing: '#fda4af' },
  'strawberry': { primary: '#be123c', secondary: '#f43f5e', badgeRing: '#fecdd3' },
  'orange': { primary: '#c2410c', secondary: '#f97316', badgeRing: '#fed7aa' },
  'lime': { primary: '#4d7c0f', secondary: '#a3e635', badgeRing: '#bef264' },

  // ── Paddy, Grains & Field Crops ──
  'paddy': { primary: '#854d0e', secondary: '#d97706', badgeRing: '#fde047' },
  'rice': { primary: '#854d0e', secondary: '#d97706', badgeRing: '#fde047' },
  'grains': { primary: '#ca8a04', secondary: '#eab308', badgeRing: '#fef08a' },
  'field-crops': { primary: '#854d0e', secondary: '#ca8a04', badgeRing: '#fde047' },
  'corn': { primary: '#a16207', secondary: '#facc15', badgeRing: '#fef08a' },
  'maize': { primary: '#a16207', secondary: '#facc15', badgeRing: '#fef08a' },
  'kurakkan': { primary: '#78350f', secondary: '#b45309', badgeRing: '#fcd34d' },

  // ── Spices & Allied ──
  'spices': { primary: '#7c2d12', secondary: '#ea580c', badgeRing: '#fdba74' },
  'cinnamon': { primary: '#78350f', secondary: '#b45309', badgeRing: '#fed7aa' },
  'cardamom': { primary: '#166534', secondary: '#22c55e', badgeRing: '#86efac' },
  'clove': { primary: '#581c87', secondary: '#9333ea', badgeRing: '#d8b4fe' },
  'ginger': { primary: '#854d0e', secondary: '#d97706', badgeRing: '#fde68a' },
  'turmeric': { primary: '#b45309', secondary: '#eab308', badgeRing: '#fef08a' },

  // ── Commercial & Plantation ──
  'tea': { primary: '#14532d', secondary: '#16a34a', badgeRing: '#4ade80' },
  'coconut': { primary: '#78350f', secondary: '#a16207', badgeRing: '#fde68a' },
  'rubber': { primary: '#1e293b', secondary: '#64748b', badgeRing: '#94a3b8' },
  'sugarcane': { primary: '#365314', secondary: '#65a30d', badgeRing: '#bef264' },

  // ── Floriculture ──
  'floriculture': { primary: '#9d174d', secondary: '#db2777', badgeRing: '#f472b6' },
  'flowers': { primary: '#9d174d', secondary: '#db2777', badgeRing: '#f472b6' },
  'orchids': { primary: '#86198f', secondary: '#c026d3', badgeRing: '#f0abfc' },
  'anthurium': { primary: '#be123c', secondary: '#e11d48', badgeRing: '#fda4af' },

  // ── Livestock & Fisheries & Major Sectors ──
  'livestock': { primary: '#92400e', secondary: '#d97706', badgeRing: '#fcd34d' },
  'dairy': { primary: '#854d0e', secondary: '#ca8a04', badgeRing: '#fef08a' },
  'fisheries': { primary: '#0369a1', secondary: '#0284c7', badgeRing: '#38bdf8' },
  'aquaculture': { primary: '#0e7490', secondary: '#06b6d4', badgeRing: '#67e8f9' },
  'export-agriculture': { primary: '#065f46', secondary: '#10b981', badgeRing: '#6ee7b7' },
  'crop-production': { primary: '#166534', secondary: '#22c55e', badgeRing: '#86efac' },
};

const DYNAMIC_FALLBACK_PALETTE: AgroTheme[] = [
  { primary: '#166534', secondary: '#22c55e', badgeRing: '#86efac' }, // Lush Leaf
  { primary: '#c2410c', secondary: '#ea580c', badgeRing: '#fdba74' }, // Rich Orange
  { primary: '#0369a1', secondary: '#0284c7', badgeRing: '#7dd3fc' }, // Sky Ocean
  { primary: '#854d0e', secondary: '#d97706', badgeRing: '#fde68a' }, // Amber Harvest
  { primary: '#7c2d12', secondary: '#c2410c', badgeRing: '#fed7aa' }, // Earth Terra
  { primary: '#6b21a8', secondary: '#9333ea', badgeRing: '#d8b4fe' }, // Violet Blossom
  { primary: '#9f1239', secondary: '#e11d48', badgeRing: '#fda4af' }, // Crimson Rose
  { primary: '#0e7490', secondary: '#06b6d4', badgeRing: '#67e8f9' }, // Cyan Lagoon
  { primary: '#4f46e5', secondary: '#6366f1', badgeRing: '#a5b4fc' }, // Deep Indigo
  { primary: '#365314', secondary: '#65a30d', badgeRing: '#bef264' }, // Forest Olive
  { primary: '#831843', secondary: '#db2777', badgeRing: '#f472b6' }, // Mulberry
  { primary: '#115e59', secondary: '#0d9488', badgeRing: '#5eead4' }, // Teal Pine
  { primary: '#92400e', secondary: '#f59e0b', badgeRing: '#fde047' }, // Golden Honey
  { primary: '#1e3a8a', secondary: '#2563eb', badgeRing: '#93c5fd' }, // Cobalt
  { primary: '#14532d', secondary: '#16a34a', badgeRing: '#86efac' }, // Deep Emerald
  { primary: '#991b1b', secondary: '#dc2626', badgeRing: '#fca5a5' }, // Fiery Coral
];

export function getAgroTheme(slugOrKey?: string, name?: string): AgroTheme {
  const normalized = `${slugOrKey || ''} ${name || ''}`.toLowerCase().trim();

  if (!normalized) {
    return DYNAMIC_FALLBACK_PALETTE[0];
  }

  // Exact or substring match in known themes
  for (const [key, theme] of Object.entries(KNOWN_THEMES)) {
    if (normalized.includes(key)) {
      return theme;
    }
  }

  // Deterministic hash based on slug string
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DYNAMIC_FALLBACK_PALETTE.length;
  return DYNAMIC_FALLBACK_PALETTE[index];
}
