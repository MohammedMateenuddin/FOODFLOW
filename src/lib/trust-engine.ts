import { SupabaseClient } from "@supabase/supabase-js";

export function calculateTrustImpact(severity: string): number {
  const map: Record<string, number> = { minor: -2, serious: -10, critical: -25 };
  return map[severity] || 0;
}

export interface TrustLevel {
  label: string;
  color: string;
  emoji: string;
  canPost: boolean;
  needsApproval: boolean;
}

export function getTrustLevel(score: number): TrustLevel {
  if (score >= 95) return { label: "Verified Donor",  color: "#10b981", emoji: "\uD83D\uDFE2", canPost: true,  needsApproval: false };
  if (score >= 70) return { label: "Good Standing",   color: "#84cc16", emoji: "\uD83D\uDFE1", canPost: true,  needsApproval: false };
  if (score >= 50) return { label: "Needs Attention",  color: "#f97316", emoji: "\uD83D\uDFE0", canPost: true,  needsApproval: true  };
  if (score >= 40) return { label: "Under Review",     color: "#ef4444", emoji: "\uD83D\uDD34", canPost: true,  needsApproval: true  };
  return              { label: "Suspended",          color: "#6b7280", emoji: "\u26AB",       canPost: false, needsApproval: true  };
}

export async function processComplaint(
  complaint: { listing_id: string; severity: string },
  supabase: SupabaseClient
): Promise<TrustLevel | null> {
  const impact = calculateTrustImpact(complaint.severity);

  const { data: listing } = await supabase
    .from("listings").select("donor_id").eq("id", complaint.listing_id).single();
  if (!listing) return null;

  const { data: donor } = await supabase
    .from("donors").select("*").eq("id", listing.donor_id).single();
  if (!donor) return null;

  const newScore = Math.max(0, (donor.trust_score || 100) + impact);
  const newCount = (donor.total_complaints || 0) + 1;

  await supabase.from("donors").update({
    trust_score: newScore,
    total_complaints: newCount,
    requires_approval: newScore < 70,
    is_suspended: newScore < 40,
  }).eq("id", donor.id);

  return getTrustLevel(newScore);
}

export const ISSUE_TYPES = [
  { value: "food_spoiled", label: "Food Spoiled", emoji: "\uD83E\uDD22" },
  { value: "wrong_quantity", label: "Wrong Quantity", emoji: "\uD83D\uDCE6" },
  { value: "wrong_food_type", label: "Wrong Food Type", emoji: "\uD83C\uDFF7\uFE0F" },
  { value: "late_delivery", label: "Very Late", emoji: "\uD83D\uDD50" },
  { value: "driver_no_show", label: "Driver No Show", emoji: "\uD83D\uDE97" },
  { value: "wrong_valorization_category", label: "Wrong Category", emoji: "\uD83D\uDDC2\uFE0F" },
  { value: "other", label: "Other", emoji: "\u2753" },
];
