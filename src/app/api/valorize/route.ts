import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { routeExpiredFood } from "@/lib/valorization";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listing_id } = body;

    // 1. Fetch listing (must be expired or available and past expiry time)
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*, donor:donors(*)")
      .eq("id", listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // 2. Fetch partners
    const { data: partners, error: partnersError } = await supabase
      .from("valorization_partners")
      .select("*")
      .eq("verified", true);

    if (partnersError || !partners || partners.length === 0) {
      return NextResponse.json({ error: "No valorization partners found" }, { status: 404 });
    }

    // 3. Run algorithm
    const donorLat = listing.donor?.lat || 0;
    const donorLng = listing.donor?.lng || 0;

    const result = routeExpiredFood(listing, partners, donorLat, donorLng);

    if (!result) {
      return NextResponse.json({ error: "No suitable partner found for valorization" }, { status: 404 });
    }

    // 4. Update listing
    const { error: updateError } = await supabase
      .from("listings")
      .update({
        status: "valorized",
        matched_receiver_id: null,
      })
      .eq("id", listing_id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
    }

    // 5. Update partner current_intake (Optimistic/Simple for demo)
    await supabase
      .from("valorization_partners")
      .update({ current_intake: result.partner.current_intake + listing.quantity_kg })
      .eq("id", result.partner.id);

    // 6. Insert log
    await supabase.from("valorization_logs").insert({
      listing_id: listing.id,
      partner_id: result.partner.id,
      partner_type: result.partner.type,
      quantity_kg: listing.quantity_kg,
      output_generated: result.output_generated,
      co2_avoided: result.co2_avoided,
    });

    return NextResponse.json({
      success: true,
      valorization: result,
    });
  } catch (error) {
    console.error("Valorize API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
