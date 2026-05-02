import { SupabaseClient } from "@supabase/supabase-js";

export const SEARCH_STAGES = [
  { radius_km: 3,  wait_ms: 3000, bonus_multiplier: 1.0, label: "Searching nearby...", color: "#10b981" },
  { radius_km: 5,  wait_ms: 3000, bonus_multiplier: 1.5, label: "Expanding search — +50% bonus!", color: "#f59e0b" },
  { radius_km: 10, wait_ms: 3000, bonus_multiplier: 2.0, label: "Wider search — bonus DOUBLED!", color: "#ef4444" },
  { radius_km: 20, wait_ms: 3000, bonus_multiplier: 2.5, label: "City-wide search — 2.5x bonus!", color: "#8b5cf6" },
];

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface DriverMatch {
  driver: any;
  total_pay: number;
  bonus_multiplier: number;
  distance: number;
  karma_earned: number;
  stage_index: number;
}

export interface StageUpdate {
  stage_index: number;
  radius_km: number;
  bonus_multiplier: number;
  label: string;
  color: string;
  base_pay: number;
}

export async function findDriver(
  listing_id: string,
  listing_lat: number,
  listing_lng: number,
  supabase: SupabaseClient,
  onStageChange?: (update: StageUpdate) => void
): Promise<DriverMatch | null> {
  // Create initial assignment record
  await supabase.from("delivery_assignments").insert({
    listing_id,
    status: "searching",
    current_radius_km: 3,
    bonus_multiplier: 1.0,
  });

  for (let i = 0; i < SEARCH_STAGES.length; i++) {
    const stage = SEARCH_STAGES[i];
    const base_pay = 40;

    // Update assignment with current search stage
    await supabase
      .from("delivery_assignments")
      .update({ current_radius_km: stage.radius_km, bonus_multiplier: stage.bonus_multiplier })
      .eq("listing_id", listing_id);

    // Notify UI of stage change
    if (onStageChange) {
      onStageChange({
        stage_index: i,
        radius_km: stage.radius_km,
        bonus_multiplier: stage.bonus_multiplier,
        label: stage.label,
        color: stage.color,
        base_pay: base_pay * stage.bonus_multiplier,
      });
    }

    // Find available drivers
    const { data: drivers } = await supabase
      .from("drivers")
      .select("*")
      .eq("is_available", true);

    const nearby = drivers
      ?.map((d) => ({ ...d, distance: haversine(listing_lat, listing_lng, d.lat, d.lng) }))
      .filter((d) => d.distance <= stage.radius_km)
      .sort((a, b) => a.distance - b.distance);

    if (nearby && nearby.length > 0) {
      const driver = nearby[0];
      const total_pay = Math.round((base_pay + driver.distance * 8) * stage.bonus_multiplier);
      const karma_earned = Math.round(total_pay / 10);

      await supabase
        .from("delivery_assignments")
        .update({
          driver_id: driver.id,
          status: "assigned",
          total_pay,
          karma_earned,
          bonus_multiplier: stage.bonus_multiplier,
        })
        .eq("listing_id", listing_id);

      // Update driver availability and stats
      await supabase
        .from("drivers")
        .update({
          is_available: false,
          karma_points: driver.karma_points + karma_earned,
          total_deliveries: driver.total_deliveries + 1,
          total_earnings: (driver.total_earnings || 0) + total_pay,
        })
        .eq("id", driver.id);

      return {
        driver,
        total_pay,
        bonus_multiplier: stage.bonus_multiplier,
        distance: Math.round(driver.distance * 10) / 10,
        karma_earned,
        stage_index: i,
      };
    }

    // Wait before expanding
    await new Promise((r) => setTimeout(r, stage.wait_ms));
  }

  // No driver found
  await supabase
    .from("delivery_assignments")
    .update({ status: "failed" })
    .eq("listing_id", listing_id);

  return null;
}

// Badge level helpers
export const BADGE_LEVELS = [
  { key: "newcomer", label: "Newcomer", emoji: "\uD83C\uDF31", min: 0, perk: "Digital badge" },
  { key: "helper", label: "Helper", emoji: "\uD83C\uDF3F", min: 11, perk: "\u20B9100 fuel voucher" },
  { key: "hero", label: "Hero", emoji: "\uD83C\uDF33", min: 31, perk: "\u20B9500 voucher + featured" },
  { key: "legend", label: "Legend", emoji: "\uD83C\uDFC6", min: 76, perk: "Monthly bonus + merch" },
];

export function getBadgeForDeliveries(count: number): typeof BADGE_LEVELS[0] {
  if (count >= 76) return BADGE_LEVELS[3];
  if (count >= 31) return BADGE_LEVELS[2];
  if (count >= 11) return BADGE_LEVELS[1];
  return BADGE_LEVELS[0];
}
