"use server";

import { createServerClient } from "@/lib/supabase/server";

// Log progress entry
export async function logProgressEntry(data: {
  userId: string;
  date: Date;
  weight: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  water: string;
  notes: string;
}) {
  const supabase = await createServerClient();

  try {
    const { error } = await supabase.from("progress_tracking").insert({
      user_id: data.userId,
      date: data.date.toISOString().split("T")[0],
      weight: data.weight ? Number.parseFloat(data.weight) : null,
      calories: data.calories ? Number.parseInt(data.calories) : null,
      protein: data.protein ? Number.parseFloat(data.protein) : null,
      carbs: data.carbs ? Number.parseFloat(data.carbs) : null,
      fat: data.fat ? Number.parseFloat(data.fat) : null,
      fiber: data.fiber ? Number.parseFloat(data.fiber) : null,
      water_intake: data.water ? Number.parseFloat(data.water) : null,
      notes: data.notes || null,
    });

    if (error) {
      console.error("Error logging progress entry:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error logging progress entry:", error);
    return { success: false, error: "Failed to log progress entry" };
  }
}
