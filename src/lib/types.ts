export interface Donor {
  id: string;
  name: string;
  type: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  badge_tier?: "verified" | "premium" | "flagship" | null;
  badge_active?: boolean;
  badge_since?: string;
}

export interface Receiver {
  id: string;
  name: string;
  type: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  current_demand: number;
  beneficiary_count: number;
}

export interface Listing {
  id: string;
  donor_id: string;
  food_name: string;
  food_type: string;
  quantity_kg: number;
  meals: number;
  expires_at: string;
  status: "available" | "matched" | "picked_up" | "delivered" | "expired" | "valorized";
  matched_receiver_id: string | null;
  match_score: number | null;
  created_at?: string;
  // Joined fields
  donor?: Donor;
  receiver?: Receiver;
}

export interface ImpactLog {
  id: string;
  listing_id: string;
  meals_saved: number;
  kg_rescued: number;
  co2_avoided: number;
  created_at?: string;
}

export interface MatchResult {
  receiver: Receiver;
  score: number;
  breakdown: {
    urgency: number;
    proximity: number;
    demand_fit: number;
    capacity: number;
  };
}

export interface ValorizationPartner {
  id: string;
  name: string;
  type: "biogas" | "cattle_feed" | "farmer" | "compost";
  address: string;
  lat: number;
  lng: number;
  capacity_kg_per_day: number;
  current_intake: number;
  accepts_food_types: string[];
  contact_phone: string;
  verified: boolean;
  created_at?: string;
}

export interface ValorizationLog {
  id: string;
  listing_id: string;
  partner_id: string;
  partner_type: string;
  quantity_kg: number;
  output_generated: string;
  co2_avoided: number;
  routed_at?: string;
}
