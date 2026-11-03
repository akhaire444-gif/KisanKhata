// Comprehensive Indian agricultural crop catalogue categorized by type
// Includes common Indian varieties, English & vernacular names (Hindi/Marathi),
// default duration in days, and 3D model identifier.

export interface CropPreset {
  id: string;
  name: string;
  vernacularName: string; // Hindi / Marathi name
  category: string;       // Matches Crop.category
  defaultDurationDays: number;
  modelType: string;      // Key corresponding to 3D model renderer in Crop3DModels
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
    modelType: 'mango',
    description: 'Golden king of fruits, flowering in winter and harvest in summer'
  },
  {
    id: 'fruit-banana',
    name: 'Banana (Grand Naine)',
    vernacularName: 'केला (जी-९)',
    category: 'Fruit',
    defaultDurationDays: 330,
    modelType: 'banana',
    description: 'High water requirement, 11-12 month vegetative and bunch cycle'
  },
  {
    id: 'fruit-grapes',
    name: 'Grapes (Thompson Seedless)',
    vernacularName: 'अंगूर (द्राक्षे)',
    category: 'Fruit',
    defaultDurationDays: 160,
    modelType: 'grapes',
    description: 'October pruning to April harvest cycle with precision canopy care'
  },
  {
    id: 'fruit-pomegranate',
    name: 'Pomegranate (Bhagwa)',
    vernacularName: 'अनार (भगवा डाळिंब)',
    category: 'Fruit',
    defaultDurationDays: 180,
    modelType: 'pomegranate',
    description: 'Bahar treatment crop with ruby arils and 5-6 month fruit development'
  },
  {
    id: 'fruit-orange',
    name: 'Orange / Mosambi',
    vernacularName: 'संतरा / मौसंबी',
    category: 'Fruit',
    defaultDurationDays: 240,
    modelType: 'orange',
    description: 'Rich vitamin C citrus crop with fragrant blooms and glossy rind'
  },
  {
    id: 'fruit-guava',
    name: 'Guava (Taiwan Pink / L-49)',
    vernacularName: 'अमरूद (पेरू)',
    category: 'Fruit',
    defaultDurationDays: 140,
    modelType: 'guava',
    description: 'Hardy crop producing high yields in both Mrig and Hasta bahar'
  },
  {
    id: 'fruit-papaya',
    name: 'Papaya (Red Lady 786)',
    vernacularName: 'पपीता (पपई)',
    category: 'Fruit',
    defaultDurationDays: 270,
    modelType: 'papaya',
    description: 'Fast-growing fruit crop, continuous harvesting after 8-9 months'
  },
  {
    id: 'fruit-watermelon',
    name: 'Watermelon (Kiran)',
    vernacularName: 'तरबूज (कलिंगड)',
    category: 'Fruit',
    defaultDurationDays: 85,
    modelType: 'watermelon',
    description: 'Short duration summer cucurbit with intensive fertigation needs'
  },

  // --- 2. VEGETABLES ---
  {
    id: 'veg-tomato',
    name: 'Tomato (Abhinav / Hybrid)',
    vernacularName: 'टमाटर (टोमॅटो)',
    category: 'Vegetables',
    defaultDurationDays: 120,
    modelType: 'tomato',
    description: 'Staked or open field, multiple pickings over 60-75 days'
  },
  {
    id: 'veg-onion',
    name: 'Onion (Kharif / Rabi Red)',
    vernacularName: 'प्याज (कांदा)',
    category: 'Vegetables',
    defaultDurationDays: 130,
    modelType: 'onion',
    description: 'Nursery to bulb harvesting, storage crop essential for farm cashflow'
  },
  {
    id: 'veg-potato',
    name: 'Potato (Kufri Jyoti / Pukhraj)',
    vernacularName: 'आलू (बटाटा)',
    category: 'Vegetables',
    defaultDurationDays: 95,
    modelType: 'potato',
    description: 'Rabi tuber crop requiring ridging and timely blight protection'
  },
  {
    id: 'veg-brinjal',
    name: 'Brinjal / Eggplant',
    vernacularName: 'बैंगन (वांगी)',
    category: 'Vegetables',
    defaultDurationDays: 140,
    modelType: 'brinjal',
    description: 'Prolific year-round vegetable with glossy purple skin'
  },
  {
    id: 'veg-chilli',
    name: 'Green Chilli (Teja / Sitara)',
    vernacularName: 'हरी मिर्च (मिरची)',
    category: 'Vegetables',
    defaultDurationDays: 150,
    modelType: 'chilli',
    description: 'High value commercial vegetable with multiple harvests'
  },
  {
    id: 'veg-cabbage',
    name: 'Cabbage (Golden Acre)',
    vernacularName: 'पत्तागोभी (कोबी)',
    category: 'Vegetables',
    defaultDurationDays: 80,
    modelType: 'cabbage',
    description: 'Cool season brassica with compact ruffled head formation'
  },
  {
    id: 'veg-cauliflower',
    name: 'Cauliflower (Snowball)',
    vernacularName: 'फूलगोभी (फ्लॉवर)',
    category: 'Vegetables',
    defaultDurationDays: 85,
    modelType: 'cauliflower',
    description: 'White curd vegetable wrapped in protective green outer leaves'
  },
  {
    id: 'veg-okra',
    name: 'Okra / Ladyfinger (Radhika)',
    vernacularName: 'भिंडी (भेंडी)',
    category: 'Vegetables',
    defaultDurationDays: 90,
    modelType: 'okra',
    description: 'Quick early yield, alternate-day picking requiring daily labor'
  },

  // --- 3. CEREALS & GRAINS ---
  {
    id: 'grain-wheat',
    name: 'Wheat (Sharbati / Lokwan)',
    vernacularName: 'गेहूं (गहू)',
    category: 'Grain',
    defaultDurationDays: 125,
    modelType: 'wheat',
    description: 'Primary Rabi staple crop requiring 4-5 synchronized irrigations'
  },
  {
    id: 'grain-rice',
    name: 'Paddy / Rice (Basmati / Sona Masoori)',
    vernacularName: 'धान / चावल (भात)',
    category: 'Grain',
    defaultDurationDays: 135,
    modelType: 'rice',
    description: 'Puddled lowland Kharif crop with heavy standing panicles'
  },
  {
    id: 'grain-maize',
    name: 'Maize / Sweet Corn',
    vernacularName: 'मक्का (मका)',
    category: 'Grain',
    defaultDurationDays: 105,
    modelType: 'maize',
    description: 'Golden cob with green protective husk and silk threads'
  },
  {
    id: 'grain-bajra',
    name: 'Bajra / Pearl Millet',
    vernacularName: 'बाजरा (बाजरी)',
    category: 'Grain',
    defaultDurationDays: 85,
    modelType: 'wheat',
    description: 'Hardy climate-resilient millet with low water footprint'
  },

  // --- 4. PULSES & DAL ---
  {
    id: 'pulse-tur',
    name: 'Tur / Arhar (Pigeon Pea)',
    vernacularName: 'तूर / अरहर',
    category: 'Pulses',
    defaultDurationDays: 165,
    modelType: 'pulse_pod',
    description: 'Deep-rooted nitrogen-fixing legume with high protein pods'
  },
  {
    id: 'pulse-gram',
    name: 'Gram / Chickpea (Chana)',
    vernacularName: 'चना (हरभरा)',
    category: 'Pulses',
    defaultDurationDays: 100,
    modelType: 'pulse_pod',
    description: 'Crucial Rabi pulse developing green pods on residual soil moisture'
  },
  {
    id: 'pulse-soybean',
    name: 'Soybean (JS-335)',
    vernacularName: 'सोयाबीन',
    category: 'Pulses',
    defaultDurationDays: 95,
    modelType: 'pulse_pod',
    description: 'Major Kharif oilseed-pulse producing beans for crushing and seed'
  },

  // --- 5. CASH CROPS ---
  {
    id: 'cash-sugarcane',
    name: 'Sugarcane (Co 86032)',
    vernacularName: 'गन्ना (ऊस)',
    category: 'Cash Crop',
    defaultDurationDays: 365,
    modelType: 'sugarcane',
    description: 'Tall segmented sweet cane stalks with crown leaves'
  },
  {
    id: 'cash-cotton',
    name: 'Cotton (Bt Hybrid)',
    vernacularName: 'कपास (कापूस)',
    category: 'Cash Crop',
    defaultDurationDays: 160,
    modelType: 'cotton',
    description: 'White fluffy cotton fiber bolls on branching woody bushes'
  },
  {
    id: 'cash-groundnut',
    name: 'Groundnut / Peanut',
    vernacularName: 'मूंगफली (भुईमूग)',
    category: 'Cash Crop',
    defaultDurationDays: 110,
    modelType: 'pulse_pod',
    description: 'Subterranean pod oilseed requiring gypsum at pegging stage'
  },

  // --- 6. SPICES & HERBS ---
  {
    id: 'spice-ginger',
    name: 'Ginger (Adrak)',
    vernacularName: 'अदरक (आले)',
    category: 'Spices',
    defaultDurationDays: 240,
    modelType: 'potato',
    description: 'Aromatic knobby rhizomes grown in loamy soil'
  },
  {
    id: 'spice-garlic',
    name: 'Garlic (Lahsun)',
    vernacularName: 'लहसुन (लसूण)',
    category: 'Spices',
    defaultDurationDays: 135,
    modelType: 'onion',
    description: 'Pungent segmented bulb with papery protective wrapper'
  }
];

export function normalizeCategory(cat: string): string {
  const clean = cat?.trim() || 'Fruit';
  for (const config of CROP_CATEGORIES) {
    if (config.matchValues.some(m => m.toLowerCase() === clean.toLowerCase())) {
      return config.id;
    }
  }
  return 'Fruit';
}

export function getCropsByCategory(category: string): CropPreset[] {
  const norm = normalizeCategory(category);
  return CROP_CATALOGUE.filter(c => c.category === norm);
}

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


export const CROP_PRESETS = CROP_CATALOGUE;
