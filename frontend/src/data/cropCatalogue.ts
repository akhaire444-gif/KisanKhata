// Comprehensive Indian agricultural crop catalogue categorized by type
// Includes common Indian varieties, English & vernacular names (Hindi/Marathi),
// default duration in days, and visual icon identifiers.

export interface CropPreset {
  id: string;
  name: string;
  vernacularName: string; // Hindi / Marathi name
  category: string;       // Matches Crop.category
  defaultDurationDays: number;
  icon: string;           // Material icon or SVG identifier
  description?: string;
}

export interface CropCategoryConfig {
  id: string;
  label: string;
  vernacularLabel: string;
  icon: string;
  accentColor: string;
  matchValues: string[]; // Variations for matching existing database values
}

export const CROP_CATEGORIES: CropCategoryConfig[] = [
  {
    id: 'Fruit',
    label: 'Fruits',
    vernacularLabel: 'फल / फळे',
    icon: 'nutrition',
    accentColor: '#f48c24',
    matchValues: ['Fruit', 'Fruits', 'फल', 'फळे']
  },
  {
    id: 'Vegetables',
    label: 'Vegetables',
    vernacularLabel: 'सब्जियां / भाजीपाला',
    icon: 'eco',
    accentColor: '#116c4a',
    matchValues: ['Vegetables', 'Vegetable', 'सब्जी', 'भाजीपाला']
  },
  {
    id: 'Grain',
    label: 'Cereals & Grains',
    vernacularLabel: 'अनाज / धान्य',
    icon: 'grass',
    accentColor: '#e0a100',
    matchValues: ['Grain', 'Grains', 'Cereals', 'Cereal', 'अनाज', 'धान्य']
  },
  {
    id: 'Pulses',
    label: 'Pulses & Dal',
    vernacularLabel: 'दालें / कडधान्ये',
    icon: 'grain',
    accentColor: '#b45309',
    matchValues: ['Pulses', 'Pulse', 'Dal', 'दालें', 'कडधान्य']
  },
  {
    id: 'Cash Crop',
    label: 'Cash Crops',
    vernacularLabel: 'नकदी फसल / बागायती',
    icon: 'monetization_on',
    accentColor: '#059669',
    matchValues: ['Cash Crop', 'Cash Crops', 'Commercial', 'नकदी']
  },
  {
    id: 'Spices',
    label: 'Spices & Herbs',
    vernacularLabel: 'मसाले / औषधी',
    icon: 'spa',
    accentColor: '#dc2626',
    matchValues: ['Spices', 'Spice', 'Herbs', 'मसाले']
  }
];

export const CROP_CATALOGUE: CropPreset[] = [
  // --- 1. FRUITS ---
  {
    id: 'fruit-mango',
    name: 'Mango (Alphonso / Kesar)',
    vernacularName: 'आम (हापूस / केसर)',
    category: 'Fruit',
    defaultDurationDays: 365,
    icon: 'nutrition',
    description: 'Perennial orchard crop, flowering in winter and harvest in summer'
  },
  {
    id: 'fruit-banana',
    name: 'Banana (Grand Naine)',
    vernacularName: 'केला (जी-९)',
    category: 'Fruit',
    defaultDurationDays: 330,
    icon: 'nutrition',
    description: 'High water requirement, 11-12 month vegetative and fruiting cycle'
  },
  {
    id: 'fruit-grapes',
    name: 'Grapes (Thompson Seedless)',
    vernacularName: 'अंगूर (द्राक्षे)',
    category: 'Fruit',
    defaultDurationDays: 160,
    icon: 'nutrition',
    description: 'October pruning to April harvest cycle with precision spraying'
  },
  {
    id: 'fruit-pomegranate',
    name: 'Pomegranate (Bhagwa)',
    vernacularName: 'अनार (भगवा डाळिंब)',
    category: 'Fruit',
    defaultDurationDays: 180,
    icon: 'nutrition',
    description: 'Bahar treatment crop with 5-6 month fruit development period'
  },
  {
    id: 'fruit-orange',
    name: 'Orange / Mosambi',
    vernacularName: 'संतरा / मौसंबी',
    category: 'Fruit',
    defaultDurationDays: 240,
    icon: 'nutrition',
    description: 'Citrus orchard, requires timely micronutrient and pest management'
  },
  {
    id: 'fruit-guava',
    name: 'Guava (Taiwan Pink / L-49)',
    vernacularName: 'अमरूद (पेरू)',
    category: 'Fruit',
    defaultDurationDays: 140,
    icon: 'nutrition',
    description: 'Hardy crop producing high yields in both Mrig and Hasta bahar'
  },
  {
    id: 'fruit-papaya',
    name: 'Papaya (Red Lady 786)',
    vernacularName: 'पपीता (पपई)',
    category: 'Fruit',
    defaultDurationDays: 270,
    icon: 'nutrition',
    description: 'Fast-growing fruit crop, continuous harvesting after 8-9 months'
  },
  {
    id: 'fruit-watermelon',
    name: 'Watermelon / Muskmelon',
    vernacularName: 'तरबूज / खरबूजा',
    category: 'Fruit',
    defaultDurationDays: 85,
    icon: 'nutrition',
    description: 'Short duration summer cucurbit with intensive fertigation needs'
  },
  {
    id: 'fruit-chikoo',
    name: 'Chikoo (Sapota)',
    vernacularName: 'चीकू (चीकू)',
    category: 'Fruit',
    defaultDurationDays: 300,
    icon: 'nutrition',
    description: 'Evergreen coastal and black-soil orchard crop'
  },

  // --- 2. VEGETABLES ---
  {
    id: 'veg-tomato',
    name: 'Tomato (Abhinav / Hybrid)',
    vernacularName: 'टमाटर (टोमॅटो)',
    category: 'Vegetables',
    defaultDurationDays: 120,
    icon: 'eco',
    description: 'Staked or open field, multiple pickings over 60-75 days'
  },
  {
    id: 'veg-onion',
    name: 'Onion (Kharif / Rabi Red)',
    vernacularName: 'प्याज (कांदा)',
    category: 'Vegetables',
    defaultDurationDays: 130,
    icon: 'eco',
    description: 'Nursery to bulb harvesting, storage crop essential for farm cashflow'
  },
  {
    id: 'veg-potato',
    name: 'Potato (Kufri Jyoti / Pukhraj)',
    vernacularName: 'आलू (बटाटा)',
    category: 'Vegetables',
    defaultDurationDays: 95,
    icon: 'eco',
    description: 'Rabi tuber crop requiring ridging and timely blight protection'
  },
  {
    id: 'veg-brinjal',
    name: 'Brinjal / Eggplant',
    vernacularName: 'बैंगन (वांगी)',
    category: 'Vegetables',
    defaultDurationDays: 140,
    icon: 'eco',
    description: 'Prolific year-round vegetable with regular pest monitoring'
  },
  {
    id: 'veg-chilli',
    name: 'Green Chilli (Teja / Sitara)',
    vernacularName: 'हरी मिर्च (मिरची)',
    category: 'Vegetables',
    defaultDurationDays: 150,
    icon: 'eco',
    description: 'High value commercial vegetable with multiple harvests'
  },
  {
    id: 'veg-cabbage',
    name: 'Cabbage & Cauliflower',
    vernacularName: 'पत्तागोभी / फूलगोभी',
    category: 'Vegetables',
    defaultDurationDays: 80,
    icon: 'eco',
    description: 'Cool season brassica crops with compact 75-85 day head formation'
  },
  {
    id: 'veg-okra',
    name: 'Okra / Ladyfinger (Radhika)',
    vernacularName: 'भिंडी (भेंडी)',
    category: 'Vegetables',
    defaultDurationDays: 90,
    icon: 'eco',
    description: 'Quick early yield, alternate-day picking requiring daily labor'
  },
  {
    id: 'veg-cucumber',
    name: 'Cucumber / Gherkins',
    vernacularName: 'खीरा / ककड़ी',
    category: 'Vegetables',
    defaultDurationDays: 60,
    icon: 'eco',
    description: 'Rapid 50-60 day crop ideal for trellis or open bed cultivation'
  },
  {
    id: 'veg-capsicum',
    name: 'Capsicum / Shimla Mirch',
    vernacularName: 'शिमला मिर्च (ढोबळी मिरची)',
    category: 'Vegetables',
    defaultDurationDays: 120,
    icon: 'eco',
    description: 'Greenhouse or shade-net bell pepper with high export value'
  },
  {
    id: 'veg-spinach',
    name: 'Spinach & Leafy Greens',
    vernacularName: 'पालक / मेथी / कोथमीर',
    category: 'Vegetables',
    defaultDurationDays: 45,
    icon: 'eco',
    description: 'Short duration fast-rotation greens with instant daily market liquidity'
  },
  {
    id: 'veg-bittergourd',
    name: 'Bitter Gourd (Karela)',
    vernacularName: 'करेला (कारले)',
    category: 'Vegetables',
    defaultDurationDays: 110,
    icon: 'eco',
    description: 'Mandap / trellis vine crop with strong medicinal and market demand'
  },

  // --- 3. CEREALS & GRAINS ---
  {
    id: 'grain-wheat',
    name: 'Wheat (Sharbati / Lokwan)',
    vernacularName: 'गेहूं (गहू)',
    category: 'Grain',
    defaultDurationDays: 125,
    icon: 'grass',
    description: 'Primary Rabi staple crop requiring 4-5 synchronized irrigations'
  },
  {
    id: 'grain-rice',
    name: 'Paddy / Rice (Basmati / Sona Masoori)',
    vernacularName: 'धान / चावल (भात)',
    category: 'Grain',
    defaultDurationDays: 135,
    icon: 'grass',
    description: 'Puddled lowland Kharif crop requiring standing water management'
  },
  {
    id: 'grain-maize',
    name: 'Maize / Sweet Corn',
    vernacularName: 'मक्का (मका)',
    category: 'Grain',
    defaultDurationDays: 105,
    icon: 'grass',
    description: 'Kharif/Rabi cereal used for grain, silage, and industrial starch'
  },
  {
    id: 'grain-jowar',
    name: 'Jowar / Sorghum',
    vernacularName: 'ज्वार (ज्वारी)',
    category: 'Grain',
    defaultDurationDays: 115,
    icon: 'grass',
    description: 'Drought-tolerant dual purpose grain and fodder dryland cereal'
  },
  {
    id: 'grain-bajra',
    name: 'Bajra / Pearl Millet',
    vernacularName: 'बाजरा (बाजरी)',
    category: 'Grain',
    defaultDurationDays: 85,
    icon: 'grass',
    description: 'Hardy climate-resilient millet with low water footprint'
  },
  {
    id: 'grain-barley',
    name: 'Barley (Jau)',
    vernacularName: 'जौ (सातू)',
    category: 'Grain',
    defaultDurationDays: 110,
    icon: 'grass',
    description: 'Salt-tolerant cereal crop for grain and malting'
  },

  // --- 4. PULSES & DAL ---
  {
    id: 'pulse-tur',
    name: 'Tur / Arhar (Pigeon Pea)',
    vernacularName: 'तूर / अरहर',
    category: 'Pulses',
    defaultDurationDays: 165,
    icon: 'grain',
    description: 'Deep-rooted nitrogen-fixing legume with high protein value'
  },
  {
    id: 'pulse-gram',
    name: 'Gram / Chickpea (Chana)',
    vernacularName: 'चना (हरभरा)',
    category: 'Pulses',
    defaultDurationDays: 100,
    icon: 'grain',
    description: 'Crucial Rabi pulse requiring residual soil moisture'
  },
  {
    id: 'pulse-moong',
    name: 'Moong (Green Gram)',
    vernacularName: 'मूंग (मूग)',
    category: 'Pulses',
    defaultDurationDays: 65,
    icon: 'grain',
    description: 'Short duration summer / Kharif catch-crop enriching soil nitrogen'
  },
  {
    id: 'pulse-urad',
    name: 'Urad (Black Gram)',
    vernacularName: 'उड़द (उडीद)',
    category: 'Pulses',
    defaultDurationDays: 75,
    icon: 'grain',
    description: 'Valuable pulse for intercropping with cotton or sugarcane'
  },
  {
    id: 'pulse-soybean',
    name: 'Soybean (JS-335 / 9560)',
    vernacularName: 'सोयाबीन',
    category: 'Pulses',
    defaultDurationDays: 95,
    icon: 'grain',
    description: 'Major Kharif oilseed-pulse producing beans for crushing and seed'
  },
  {
    id: 'pulse-masoor',
    name: 'Masoor (Lentil)',
    vernacularName: 'मसूर (मसूर डाळ)',
    category: 'Pulses',
    defaultDurationDays: 110,
    icon: 'grain',
    description: 'Winter season pulse suitable for dryland and rainfed belts'
  },

  // --- 5. CASH CROPS ---
  {
    id: 'cash-sugarcane',
    name: 'Sugarcane (Co 86032)',
    vernacularName: 'गन्ना (ऊस)',
    category: 'Cash Crop',
    defaultDurationDays: 365,
    icon: 'monetization_on',
    description: '12-14 month heavy feeder commercial crop with mill procurement'
  },
  {
    id: 'cash-cotton',
    name: 'Cotton (Bt Hybrid)',
    vernacularName: 'कपास (कापूस)',
    category: 'Cash Crop',
    defaultDurationDays: 160,
    icon: 'monetization_on',
    description: 'White gold commercial fiber crop with multiple picking rounds'
  },
  {
    id: 'cash-groundnut',
    name: 'Groundnut / Peanut',
    vernacularName: 'मूंगफली (भुईमूग)',
    category: 'Cash Crop',
    defaultDurationDays: 110,
    icon: 'monetization_on',
    description: 'Valuable oilseed requiring gypsum application at pegging stage'
  },
  {
    id: 'cash-tobacco',
    name: 'Tobacco',
    vernacularName: 'तम्बाकू (तंबाखू)',
    category: 'Cash Crop',
    defaultDurationDays: 120,
    icon: 'monetization_on',
    description: 'Commercial leaf crop requiring precise curing'
  },

  // --- 6. SPICES & HERBS ---
  {
    id: 'spice-ginger',
    name: 'Ginger (Adrak)',
    vernacularName: 'अदरक (आले)',
    category: 'Spices',
    defaultDurationDays: 240,
    icon: 'spa',
    description: 'High-investment rhizome crop with substantial profit potential'
  },
  {
    id: 'spice-turmeric',
    name: 'Turmeric (Haldi)',
    vernacularName: 'हल्दी (हळद)',
    category: 'Spices',
    defaultDurationDays: 260,
    icon: 'spa',
    description: 'Salem / Rajapuri varieties with high curcumin content'
  },
  {
    id: 'spice-garlic',
    name: 'Garlic (Lahsun)',
    vernacularName: 'लहसुन (लसूण)',
    category: 'Spices',
    defaultDurationDays: 135,
    icon: 'spa',
    description: 'Rabi bulb spice crop with excellent storage lifespan'
  },
  {
    id: 'spice-coriander',
    name: 'Coriander Seed (Dhania)',
    vernacularName: 'धनिया (धने)',
    category: 'Spices',
    defaultDurationDays: 90,
    icon: 'spa',
    description: 'Grown for grain or green leaf according to prevailing market rates'
  }
];

// Helper: Normalize category string
export function normalizeCategory(cat: string): string {
  const clean = cat?.trim() || 'Fruit';
  for (const config of CROP_CATEGORIES) {
    if (config.matchValues.some(m => m.toLowerCase() === clean.toLowerCase())) {
      return config.id;
    }
  }
  return 'Fruit';
}

// Helper: Retrieve crops for a given category
export function getCropsByCategory(category: string): CropPreset[] {
  const norm = normalizeCategory(category);
  return CROP_CATALOGUE.filter(c => c.category === norm);
}

// Helper: Search within a category
export function searchCropsInCategory(category: string, query: string): CropPreset[] {
  const crops = getCropsByCategory(category);
  if (!query || !query.trim()) return crops;
  const q = query.toLowerCase().trim();
  return crops.filter(
    c =>
      c.name.toLowerCase().includes(q) ||
      c.vernacularName.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
  );
}

// Helper: Find a preset by name
export function findCropPresetByName(name: string): CropPreset | undefined {
  if (!name) return undefined;
  const q = name.toLowerCase().trim();
  return CROP_CATALOGUE.find(
    c =>
      c.name.toLowerCase() === q ||
      c.name.toLowerCase().startsWith(q) ||
      q.startsWith(c.name.toLowerCase().split(' ')[0])
  );
}

