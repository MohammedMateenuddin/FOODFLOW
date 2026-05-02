// Smart Food Categorization for Valorization Routing

export const FOOD_ROUTING_MATRIX: Record<string, { biogas: boolean; cattle: boolean; compost: boolean; farmer: boolean; reason: string }> = {
  cooked_rice:    { biogas: true,  cattle: false, compost: true,  farmer: true,  reason: "Cooked starch -- safe for biogas/compost, not cattle" },
  cooked_curry:   { biogas: true,  cattle: false, compost: true,  farmer: true,  reason: "Spices/oil can harm animals -- biogas preferred" },
  raw_vegetables: { biogas: true,  cattle: true,  compost: true,  farmer: true,  reason: "Ideal for all channels" },
  raw_fruits:     { biogas: true,  cattle: true,  compost: true,  farmer: true,  reason: "Ideal for all channels" },
  bakery_dry:     { biogas: true,  cattle: true,  compost: true,  farmer: false, reason: "Dry bread/biscuits safe for cattle" },
  bakery_cream:   { biogas: true,  cattle: false, compost: true,  farmer: false, reason: "Cream/sugar harmful to animals" },
  dairy:          { biogas: true,  cattle: false, compost: false, farmer: false, reason: "Fermented dairy -- only biogas" },
  meat_nonveg:    { biogas: true,  cattle: false, compost: false, farmer: false, reason: "Meat NEVER for cattle/compost -- biogas only" },
  sweets:         { biogas: true,  cattle: false, compost: true,  farmer: false, reason: "High sugar harmful to animals" },
  packaged:       { biogas: true,  cattle: false, compost: false, farmer: false, reason: "Unknown additives -- biogas only" },
  bread:          { biogas: true,  cattle: true,  compost: true,  farmer: false, reason: "Plain bread safe for cattle" },
};

export const PRIORITY_ORDER: Record<string, string[]> = {
  cooked_rice:    ["biogas", "compost", "farmer"],
  cooked_curry:   ["biogas", "compost"],
  raw_vegetables: ["cattle_feed", "compost", "farmer", "biogas"],
  raw_fruits:     ["cattle_feed", "compost", "farmer", "biogas"],
  bakery_dry:     ["cattle_feed", "biogas", "compost"],
  bakery_cream:   ["biogas", "compost"],
  dairy:          ["biogas"],
  meat_nonveg:    ["biogas"],
  sweets:         ["biogas", "compost"],
  packaged:       ["biogas"],
  bread:          ["cattle_feed", "biogas", "compost"],
};

// Map the partner.type to the matrix key
const typeToMatrixKey: Record<string, string> = {
  biogas: "biogas",
  cattle_feed: "cattle",
  compost: "compost",
  farmer: "farmer",
};

export interface CategorizationStep {
  partnerType: string;
  partnerName: string;
  allowed: boolean;
  reason: string;
}

export interface CategorizationResult {
  foodSubType: string;
  steps: CategorizationStep[];
  bestMatch: { type: string; name: string } | null;
}

export function categorizeForValorization(
  foodSubType: string,
  partners: { type: string; name: string }[]
): CategorizationResult {
  const matrix = FOOD_ROUTING_MATRIX[foodSubType] || FOOD_ROUTING_MATRIX["packaged"];
  const priority = PRIORITY_ORDER[foodSubType] || ["biogas"];

  const steps: CategorizationStep[] = [];
  let bestMatch: { type: string; name: string } | null = null;

  // Check all partner types in priority order
  const allTypes = ["cattle_feed", "compost", "farmer", "biogas"];
  for (const pType of allTypes) {
    const matrixKey = typeToMatrixKey[pType] || pType;
    const allowed = matrix[matrixKey as keyof typeof matrix] as boolean;
    const partner = partners.find(p => p.type === pType);
    const reason = allowed
      ? "Compatible -- safe routing"
      : matrix.reason;

    steps.push({
      partnerType: pType,
      partnerName: partner?.name || pType.replace("_", " "),
      allowed,
      reason,
    });
  }

  // Find best match based on priority
  for (const pType of priority) {
    const partner = partners.find(p => p.type === pType);
    if (partner) {
      bestMatch = { type: pType, name: partner.name };
      break;
    }
  }

  return { foodSubType, steps, bestMatch };
}

// Food categories for the donate form dropdown
export const FOOD_CATEGORIES = [
  { value: "cooked_rice", label: "Cooked Rice / Biryani / Pulao", type: "cooked", route: "Biogas Plant" },
  { value: "cooked_curry", label: "Cooked Curry / Sabzi / Dal", type: "cooked", route: "Biogas Plant" },
  { value: "raw_vegetables", label: "Raw Vegetables / Greens", type: "raw", route: "Cattle Feed Center" },
  { value: "raw_fruits", label: "Raw Fruits", type: "raw", route: "Cattle Feed Center" },
  { value: "bakery_dry", label: "Bakery (Dry) - Biscuits / Rusks", type: "bakery", route: "Cattle Feed Center" },
  { value: "bakery_cream", label: "Bakery (Cream) - Cakes / Pastry", type: "bakery", route: "Biogas Plant" },
  { value: "dairy", label: "Dairy - Milk / Paneer / Curd", type: "raw", route: "Biogas Plant" },
  { value: "meat_nonveg", label: "Non-Veg - Chicken / Fish / Eggs", type: "cooked", route: "Biogas Plant" },
  { value: "sweets", label: "Sweets - Halwa / Laddu / Kheer", type: "cooked", route: "Biogas Plant" },
  { value: "packaged", label: "Packaged / Sealed Food", type: "packaged", route: "Biogas Plant" },
  { value: "bread", label: "Bread / Roti / Naan", type: "bakery", route: "Cattle Feed Center" },
];
