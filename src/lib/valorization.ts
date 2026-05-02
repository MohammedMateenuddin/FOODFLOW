import { Listing, ValorizationPartner } from "./types";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface ValorizationResult {
  partner: ValorizationPartner;
  output_generated: string;
  co2_avoided: number;
  score: number;
  distance: number;
}

export function routeExpiredFood(
  listing: Listing,
  partners: ValorizationPartner[],
  donorLat: number,
  donorLng: number
): ValorizationResult | null {
  // 1. Filter by food type
  const compatiblePartners = partners.filter((p) =>
    p.accepts_food_types.includes(listing.food_type)
  );

  if (compatiblePartners.length === 0) return null;

  const results: ValorizationResult[] = compatiblePartners.map((partner) => {
    // 2. Base Scores
    const availableCapacity = partner.capacity_kg_per_day - partner.current_intake;
    let capacityScore = 0;
    if (availableCapacity >= listing.quantity_kg) {
      capacityScore = (availableCapacity / partner.capacity_kg_per_day) * 50;
    } else {
      // If they can't take it all, penalty
      capacityScore = -100;
    }

    const distance = haversineDistance(donorLat, donorLng, partner.lat, partner.lng);
    const proximityScore = Math.max(0, 50 - distance * 2);

    // 3. Priority Bonus based on food_type and partner type
    let priorityBonus = 0;
    if (listing.food_type === "cooked") {
      if (partner.type === "biogas") priorityBonus = 50;
      else if (partner.type === "compost") priorityBonus = 30;
      else if (partner.type === "farmer") priorityBonus = 10;
    } else if (listing.food_type === "raw") {
      if (partner.type === "cattle_feed") priorityBonus = 50;
      else if (partner.type === "biogas") priorityBonus = 30;
      else if (partner.type === "compost") priorityBonus = 10;
    } else if (listing.food_type === "bakery") {
      if (partner.type === "cattle_feed") priorityBonus = 50;
      else if (partner.type === "biogas") priorityBonus = 30;
    } else if (listing.food_type === "packaged") {
      if (partner.type === "compost") priorityBonus = 50;
      else if (partner.type === "biogas") priorityBonus = 30;
    }

    const totalScore = capacityScore + proximityScore + priorityBonus;

    // 4. Output Calculations
    let output = "";
    if (partner.type === "biogas") {
      output = `${(listing.quantity_kg * 0.5).toFixed(1)} kWh clean energy`;
    } else if (partner.type === "cattle_feed") {
      output = `${(listing.quantity_kg * 0.9).toFixed(1)} kg cattle feed`;
    } else if (partner.type === "compost") {
      output = `${(listing.quantity_kg * 0.4).toFixed(1)} kg fertilizer`;
    } else if (partner.type === "farmer") {
      output = `${(listing.quantity_kg * 0.4).toFixed(1)} kg organic manure`;
    }

    // 5. CO2 avoided
    const co2_avoided = listing.quantity_kg * 2.5;

    return {
      partner,
      score: totalScore,
      output_generated: output,
      co2_avoided,
      distance: Math.round(distance * 10) / 10,
    };
  });

  // Filter out those with negative capacity scores (can't accept)
  const validResults = results.filter((r) => r.score > 0);
  if (validResults.length === 0) return null;

  validResults.sort((a, b) => b.score - a.score);

  return validResults[0];
}
