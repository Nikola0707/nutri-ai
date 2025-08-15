import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: mealPlans, error } = await supabase
      .from("meal_plans")
      .select("id, name, total_days, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching meal plans:", error);
      return NextResponse.json(
        { error: "Failed to fetch meal plans" },
        { status: 500 }
      );
    }

    return NextResponse.json({ mealPlans: mealPlans || [] });
  } catch (error) {
    console.error("Error in meal plans API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
