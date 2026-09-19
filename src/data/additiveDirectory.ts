import { FoodAdditive } from '../types/product';

export const ADDITIVES_DATABASE: Record<string, Omit<FoodAdditive, 'id'>> = {
  'e330': {
    name: 'Citric Acid',
    function: 'Acidity Regulator & Antioxidant',
    riskLevel: 'safe',
    description: 'Naturally derived acid found in citrus fruits; safe for general consumption.',
  },
  'e322': {
    name: 'Lecithins (Soy/Sunflower)',
    function: 'Emulsifier',
    riskLevel: 'safe',
    description: 'Natural emulsifiers that keep fats and liquids blended evenly.',
  },
  'e415': {
    name: 'Xanthan Gum',
    function: 'Thickener & Stabilizer',
    riskLevel: 'safe',
    description: 'Fermented plant-based soluble fiber used to improve texture.',
  },
  'e440': {
    name: 'Pectins',
    function: 'Gelling Agent',
    riskLevel: 'safe',
    description: 'Natural fruit fiber extracted from apples and citrus peels.',
  },
  'e150d': {
    name: 'Ammonia Caramel (Caramel IV)',
    function: 'Coloring Agent',
    riskLevel: 'caution',
    description: 'Synthetic dark brown coloring widely used in colas and gravies.',
  },
  'e250': {
    name: 'Sodium Nitrite',
    function: 'Preservative & Color Fixative',
    riskLevel: 'high_risk',
    description: 'Preservative in cured meats; excessive intake is flagged in public health studies.',
  },
  'e621': {
    name: 'Monosodium Glutamate (MSG)',
    function: 'Flavor Enhancer',
    riskLevel: 'caution',
    description: 'Umami-providing salt of glutamic acid; safe for most people in moderate amounts.',
  },
  'e951': {
    name: 'Aspartame',
    function: 'Artificial Sweetener',
    riskLevel: 'caution',
    description: 'Low-calorie artificial sweetener used in diet drinks and sugar-free snacks.',
  },
  'e950': {
    name: 'Acesulfame K',
    function: 'Artificial Sweetener',
    riskLevel: 'caution',
    description: 'High-intensity artificial sweetener often blended with sucralose or aspartame.',
  },
  'e955': {
    name: 'Sucralose',
    function: 'Non-nutritive Sweetener',
    riskLevel: 'safe',
    description: 'Zero-calorie chlorinated sugar derivative widely used as sugar substitute.',
  },
  'e471': {
    name: 'Mono- and Diglycerides of Fatty Acids',
    function: 'Emulsifier',
    riskLevel: 'caution',
    description: 'Industrial fatty acid blend often derived from vegetable or animal oils.',
  },
  'e202': {
    name: 'Potassium Sorbate',
    function: 'Preservative',
    riskLevel: 'safe',
    description: 'Inhibits mold and yeast growth in dairy and baked goods.',
  },
  'e211': {
    name: 'Sodium Benzoate',
    function: 'Preservative',
    riskLevel: 'caution',
    description: 'Acidic preservative used in acidic beverages, salad dressings, and jams.',
  },
  'e102': {
    name: 'Tartrazine (Yellow 5)',
    function: 'Coloring Agent',
    riskLevel: 'caution',
    description: 'Synthetic azo dye; may require warning in EU for child attention.',
  },
  'e129': {
    name: 'Allura Red AC (Red 40)',
    function: 'Coloring Agent',
    riskLevel: 'caution',
    description: 'Synthetic red food dye used in candies, cereals, and soft drinks.',
  },
};

export function lookupAdditive(idOrTag: string): FoodAdditive {
  const normalized = idOrTag.toLowerCase().replace(/^en:/, '').replace(/[-_]/g, '');
  const found = ADDITIVES_DATABASE[normalized];

  if (found) {
    return {
      id: normalized.toUpperCase(),
      name: found.name,
      function: found.function,
      riskLevel: found.riskLevel,
      description: found.description,
    };
  }

  // Generic fallback
  return {
    id: idOrTag.replace(/^en:/, '').toUpperCase(),
    name: idOrTag.replace(/^en:/, '').replace(/-/g, ' ').toUpperCase(),
    riskLevel: 'unknown',
    function: 'Food Additive / Ingredient',
    description: 'Identified food additive or processing aid from ingredients record.',
  };
}
