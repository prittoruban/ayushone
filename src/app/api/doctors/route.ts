import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";

// GET /api/doctors - Search doctors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const specialty = searchParams.get("specialty");

    const supabase = await createServerComponentClient();

    let query = supabase
      .from("doctors")
      .select(
        `
        id,
        specialty,
        city,
        license_number,
        license_url,
        experience_years,
        languages,
        location,
        verified_badge,
        created_at,
        user:users!user_id (
          id,
          name,
          role,
          phone
        )
      `
      )
      .eq("verified_badge", true);

    if (city) {
      query = query.ilike("city", `%${city}%`);
    }

    if (specialty) {
      query = query.ilike("specialty", `%${specialty}%`);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching doctors:", error);
      return NextResponse.json(
        { error: "Failed to fetch doctors" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/doctors - Create/Update doctor profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      specialty,
      city,
      user_id,
      license_number,
      experience_years,
      languages,
      location,
    } = body;

    if (!specialty || !city || !user_id) {
      return NextResponse.json(
        { error: "Missing required fields: specialty, city, user_id" },
        { status: 400 }
      );
    }

    const supabase = await createServerComponentClient();

    // Check if doctor profile already exists
    const { data: existingDoctor } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", user_id)
      .single();

    let result;

    if (existingDoctor) {
      // Update existing profile
      const updateData: any = {
        specialty,
        city,
        license_number,
        experience_years: experience_years || 0,
        languages: languages || [],
        verified_badge: true, // Auto-verify for demo purposes
      };

      // Only update location if provided
      if (location) {
        updateData.location = location;
      }

      result = await supabase
        .from("doctors")
        .update(updateData)
        .eq("user_id", user_id)
        .select()
        .single();
    } else {
      // Create new profile
      const insertData: any = {
        user_id,
        specialty,
        city,
        license_number,
        experience_years: experience_years || 0,
        languages: languages || [],
        verified_badge: true, // Auto-verify for demo purposes
      };

      // Only add location if provided
      if (location) {
        insertData.location = location;
      }

      result = await supabase
        .from("doctors")
        .insert(insertData)
        .select()
        .single();
    }

    if (result.error) {
      console.error("Error saving doctor profile:", result.error);
      return NextResponse.json(
        { error: "Failed to save doctor profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
