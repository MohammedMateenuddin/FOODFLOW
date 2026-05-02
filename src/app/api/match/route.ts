import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { findBestMatch, findAllMatches } from "@/lib/matching";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listing_id } = body;

    // Get the listing
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*, donor:donors(*)")
      .eq("id", listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Get all receivers
    const { data: receivers, error: receiversError } = await supabase
      .from("receivers")
      .select("*");

    if (receiversError || !receivers) {
      return NextResponse.json(
        { error: "No receivers found" },
        { status: 404 }
      );
    }

    // Run matching algorithm
    const donorLat = listing.donor?.lat || 0;
    const donorLng = listing.donor?.lng || 0;

    const bestMatch = findBestMatch(listing, receivers, donorLat, donorLng);
    const allMatches = findAllMatches(listing, receivers, donorLat, donorLng);

    if (!bestMatch) {
      return NextResponse.json(
        { error: "No suitable match found" },
        { status: 404 }
      );
    }

    // Update listing with match
    const { error: updateError } = await supabase
      .from("listings")
      .update({
        status: "matched",
        matched_receiver_id: bestMatch.receiver.id,
        match_score: bestMatch.score,
      })
      .eq("id", listing_id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update listing" },
        { status: 500 }
      );
    }

    // Create impact log
    const co2PerKg = 2.5; // kg CO2 avoided per kg food rescued
    await supabase.from("impact_logs").insert({
      listing_id,
      meals_saved: listing.meals,
      kg_rescued: listing.quantity_kg,
      co2_avoided: listing.quantity_kg * co2PerKg,
    });

    return NextResponse.json({
      success: true,
      bestMatch,
      allMatches: allMatches.slice(0, 5), // Top 5 matches
    });
  } catch (error) {
    console.error("Match API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
