// Shelf life rules in HOURS by food sub-type and storage method
export const expiryRules: Record<string, Record<string, number>> = {
  cooked_rice:    { room_temp: 4,   fridge: 24,  freezer: 168 },
  cooked_curry:   { room_temp: 4,   fridge: 48,  freezer: 168 },
  raw_vegetables: { room_temp: 24,  fridge: 96,  freezer: 720 },
  bakery_dry:     { room_temp: 48,  fridge: 120, freezer: 720 },
  bakery_cream:   { room_temp: 12,  fridge: 48,  freezer: 336 },
  dairy:          { room_temp: 2,   fridge: 48,  freezer: 336 },
  meat_nonveg:    { room_temp: 2,   fridge: 24,  freezer: 168 },
  sweets:         { room_temp: 24,  fridge: 72,  freezer: 336 },
  packaged:       { room_temp: 720, fridge: 720, freezer: 2160 },
  bread:          { room_temp: 24,  fridge: 72,  freezer: 336 },
};

// Map generic food_type from the form to a sub-type for lookup
export function getFoodSubType(foodType: string, foodName: string): string {
  const name = foodName.toLowerCase();
  if (foodType === "cooked") {
    if (name.includes("rice") || name.includes("biryani") || name.includes("pulao")) return "cooked_rice";
    if (name.includes("sweet") || name.includes("halwa") || name.includes("kheer")) return "sweets";
    if (name.includes("meat") || name.includes("chicken") || name.includes("fish") || name.includes("egg")) return "meat_nonveg";
    if (name.includes("milk") || name.includes("paneer") || name.includes("curd") || name.includes("dairy")) return "dairy";
    return "cooked_curry"; // default for cooked
  }
  if (foodType === "raw") {
    if (name.includes("meat") || name.includes("chicken") || name.includes("fish")) return "meat_nonveg";
    if (name.includes("milk") || name.includes("dairy")) return "dairy";
    return "raw_vegetables";
  }
  if (foodType === "bakery") {
    if (name.includes("cream") || name.includes("cake") || name.includes("pastry")) return "bakery_cream";
    if (name.includes("bread") || name.includes("roti") || name.includes("naan")) return "bread";
    return "bakery_dry";
  }
  if (foodType === "packaged") return "packaged";
  return "cooked_curry"; // fallback
}

export interface FreshnessResult {
  freshness: number;     // 0-100 (100 = freshest)
  hoursElapsed: number;
  maxHours: number;
  hoursRemaining: number;
  aiExpiryFlag: boolean;
  status: "fresh" | "near_expiry" | "expired";
  label: string;
  color: string;
}

export function calculateFreshness(
  cookedAt: Date,
  storageType: string,
  foodType: string,
  foodName: string
): FreshnessResult {
  const subType = getFoodSubType(foodType, foodName);
  const maxHours = expiryRules[subType]?.[storageType] || 24;
  const hoursElapsed = (Date.now() - cookedAt.getTime()) / (1000 * 60 * 60);
  const hoursRemaining = Math.max(0, maxHours - hoursElapsed);
  const freshness = Math.max(0, Math.min(100, ((maxHours - hoursElapsed) / maxHours) * 100));
  const aiExpiryFlag = hoursElapsed > maxHours * 0.8;

  let status: "fresh" | "near_expiry" | "expired";
  let label: string;
  let color: string;

  if (hoursElapsed >= maxHours) {
    status = "expired";
    label = "Expired";
    color = "#ef4444";
  } else if (aiExpiryFlag) {
    status = "near_expiry";
    label = "Near Expiry";
    color = "#f59e0b";
  } else {
    status = "fresh";
    label = "Fresh";
    color = "#10b981";
  }

  return { freshness, hoursElapsed, maxHours, hoursRemaining, aiExpiryFlag, status, label, color };
}

// Get verification badge info for a listing
export function getVerificationBadge(listing: {
  verification_status?: string;
  ai_expiry_flag?: boolean;
  cooked_at?: string;
  storage_type?: string;
  food_type?: string;
  food_name?: string;
  verification_step?: number;
}): { label: string; color: string; bgColor: string; icon: string } {
  const vs = listing.verification_status;

  if (vs === "volunteer_verified") {
    return { label: "Volunteer Verified", color: "text-emerald-400", bgColor: "bg-emerald-500/15", icon: "check-shield" };
  }
  if (vs === "donor_approved") {
    // Check freshness %
    if (listing.cooked_at && listing.storage_type && listing.food_type) {
      const result = calculateFreshness(
        new Date(listing.cooked_at),
        listing.storage_type,
        listing.food_type,
        listing.food_name || ""
      );
      if (result.freshness > 50) {
        return { label: "AI Verified Fresh", color: "text-emerald-400", bgColor: "bg-emerald-500/15", icon: "sparkles" };
      }
    }
    return { label: "AI Verified Fresh", color: "text-emerald-400", bgColor: "bg-emerald-500/15", icon: "sparkles" };
  }
  if (vs === "ai_flagged") {
    return { label: "Near Expiry - Volunteer Check", color: "text-amber-400", bgColor: "bg-amber-500/15", icon: "alert" };
  }

  // Default: pending
  return { label: "Verification Pending", color: "text-red-400", bgColor: "bg-red-500/15", icon: "clock" };
}
