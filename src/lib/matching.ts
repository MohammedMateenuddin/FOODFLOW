import { Listing, Receiver, MatchResult } from "./types";

/**
 * Haversine formula to calculate distance between two lat/lng points in km
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
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

/**
 * Smart matching algorithm: finds the best receiver for a food listing
 * Weights: urgency 40%, proximity 30%, demand_fit 20%, capacity 10%
 */
export function findBestMatch(
  listing: Listing,
  receivers: Receiver[],
  donorLat: number,
  donorLng: number
): MatchResult | null {
  if (receivers.length === 0) return null;

  const hoursLeft =
    (new Date(listing.expires_at).getTime() - Date.now()) / (1000 * 60 * 60);

  const results: MatchResult[] = receivers.map((receiver) => {
    // Urgency score (40% weight)
    const urgency =
      hoursLeft < 2
        ? 100
        : hoursLeft < 6
        ? 80
        : hoursLeft < 12
        ? 50
        : hoursLeft < 24
        ? 30
        : 10;

    // Proximity score (30% weight)
    const distance = haversineDistance(
      donorLat,
      donorLng,
      receiver.lat,
      receiver.lng
    );
    const proximity = Math.max(0, 100 - distance * 5);

    // Demand fit score (20% weight)
    const demand_fit = receiver.current_demand > 0 ? 80 : 20;

    // Capacity score (10% weight)
    const capacity = receiver.capacity >= listing.meals ? 100 : 50;

    const score =
      urgency * 0.4 + proximity * 0.3 + demand_fit * 0.2 + capacity * 0.1;

    return {
      receiver,
      score: Math.round(score * 100) / 100,
      distance: Math.round(distance * 10) / 10,
      breakdown: { urgency, proximity: Math.round(proximity), demand_fit, capacity },
    };
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results[0];
}

export function findAllMatches(
  listing: Listing,
  receivers: Receiver[],
  donorLat: number,
  donorLng: number
): MatchResult[] {
  if (receivers.length === 0) return [];

  const hoursLeft =
    (new Date(listing.expires_at).getTime() - Date.now()) / (1000 * 60 * 60);

  const results: MatchResult[] = receivers.map((receiver) => {
    const urgency =
      hoursLeft < 2
        ? 100
        : hoursLeft < 6
        ? 80
        : hoursLeft < 12
        ? 50
        : hoursLeft < 24
        ? 30
        : 10;

    const distance = haversineDistance(
      donorLat,
      donorLng,
      receiver.lat,
      receiver.lng
    );
    const proximity = Math.max(0, 100 - distance * 5);
    const demand_fit = receiver.current_demand > 0 ? 80 : 20;
    const capacity = receiver.capacity >= listing.meals ? 100 : 50;

    const score =
      urgency * 0.4 + proximity * 0.3 + demand_fit * 0.2 + capacity * 0.1;

    return {
      receiver,
      score: Math.round(score * 100) / 100,
      breakdown: { urgency, proximity: Math.round(proximity), demand_fit, capacity },
    };
  });

  results.sort((a, b) => b.score - a.score);
  return results;
}
