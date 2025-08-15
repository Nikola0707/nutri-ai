import { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MealPlanCreator } from "@/components/meal-plan-creator";

export default async function CreateMealPlanPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user preferences
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Meal Plan</h1>
        <p className="text-muted-foreground">
          Let AI create a personalized meal plan based on your preferences and
          goals
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <MealPlanCreator
          userId={user.id}
          userProfile={profile}
          userPreferences={preferences}
        />
      </Suspense>
    </div>
  );
}
