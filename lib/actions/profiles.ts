"use server";

import { createServerClient } from "@/lib/supabase/server";
import { calculateNutritionGoals } from "./utils";

// Update profile
export async function updateProfile(data: {
  userId: string;
  fullName: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  activityLevel: string;
  dietaryRestrictions: string[];
}) {
  const supabase = await createServerClient();

  try {
    const { error } = await supabase.from("user_profiles").upsert({
      user_id: data.userId,
      full_name: data.fullName,
      age: data.age ? Number.parseInt(data.age) : null,
      gender: data.gender,
      height: data.height ? Number.parseFloat(data.height) : null,
      weight: data.weight ? Number.parseFloat(data.weight) : null,
      activity_level: data.activityLevel,
      dietary_restrictions: data.dietaryRestrictions,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

// Update nutrition goals
export async function updateNutritionGoals(data: {
  userId: string;
  dailyCalorieGoal: string;
  proteinGoal: string;
  carbGoal: string;
  fatGoal: string;
  fiberGoal: string;
  waterGoal: string;
  weightGoal: string;
  goalType: string;
}) {
  const supabase = await createServerClient();

  try {
    const { error } = await supabase.from("user_profiles").upsert({
      user_id: data.userId,
      daily_calorie_goal: data.dailyCalorieGoal
        ? Number.parseInt(data.dailyCalorieGoal)
        : null,
      protein_goal: data.proteinGoal
        ? Number.parseFloat(data.proteinGoal)
        : null,
      carb_goal: data.carbGoal ? Number.parseFloat(data.carbGoal) : null,
      fat_goal: data.fatGoal ? Number.parseFloat(data.fatGoal) : null,
      fiber_goal: data.fiberGoal ? Number.parseFloat(data.fiberGoal) : null,
      water_goal: data.waterGoal ? Number.parseFloat(data.waterGoal) : null,
      target_weight: data.weightGoal
        ? Number.parseFloat(data.weightGoal)
        : null,
      goal_type: data.goalType,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error updating nutrition goals:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating nutrition goals:", error);
    return { success: false, error: "Failed to update nutrition goals" };
  }
}

// Update notification settings
export async function updateNotificationSettings(data: {
  userId: string;
  mealReminders: boolean;
  progressReminders: boolean;
  weeklyReports: boolean;
  mealPlanUpdates: boolean;
  reminderTime: string;
  emailNotifications: boolean;
}) {
  const supabase = await createServerClient();

  try {
    const { error } = await supabase.from("user_preferences").upsert({
      user_id: data.userId,
      meal_reminders: data.mealReminders,
      progress_reminders: data.progressReminders,
      weekly_reports: data.weeklyReports,
      meal_plan_updates: data.mealPlanUpdates,
      reminder_time: data.reminderTime,
      email_notifications: data.emailNotifications,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error updating notification settings:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return { success: false, error: "Failed to update notification settings" };
  }
}

// Complete onboarding
export async function completeOnboarding(data: {
  age: string;
  gender: string;
  height: string;
  weight: string;
  activityLevel: string;
  sleepSchedule: string;
  workSchedule?: string;
  primaryGoal: string;
  targetWeight: string;
  timeline: string;
  dietType: string;
  allergies: string[];
  dislikes: string[];
  healthConditions: string[];
  medications: string;
  wearableIntegration: boolean;
}) {
  const supabase = await createServerClient();

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || "",
        age: data.age ? Number.parseInt(data.age) : null,
        gender: data.gender,
        height: data.height ? Number.parseFloat(data.height) : null,
        weight: data.weight ? Number.parseFloat(data.weight) : null,
        activity_level: data.activityLevel,
        goal_type: data.primaryGoal,
        target_weight: data.targetWeight
          ? Number.parseFloat(data.targetWeight)
          : null,
        dietary_restrictions: data.allergies,
        health_conditions: data.healthConditions,
        medications: data.medications || null,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      return { success: false, error: profileError.message };
    }

    // Create user preferences
    const { error: preferencesError } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        diet_type: data.dietType,
        cuisine_preferences: [], // Will be set later
        meal_complexity: "medium",
        cooking_time_preference: "30-45 minutes",
        budget_range: "medium",
        food_dislikes: data.dislikes,
        sleep_schedule: data.sleepSchedule,
        wearable_integration: data.wearableIntegration,
        meal_reminders: true,
        progress_reminders: true,
        weekly_reports: true,
        meal_plan_updates: true,
        reminder_time: "08:00",
        email_notifications: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (preferencesError) {
      console.error("Error creating user preferences:", preferencesError);
      return { success: false, error: preferencesError.message };
    }

    // Calculate and set nutrition goals based on profile
    const nutritionGoals = calculateNutritionGoals({
      age: Number.parseInt(data.age),
      gender: data.gender,
      height: Number.parseFloat(data.height),
      weight: Number.parseFloat(data.weight),
      activityLevel: data.activityLevel,
      goal: data.primaryGoal,
      targetWeight: data.targetWeight
        ? Number.parseFloat(data.targetWeight)
        : null,
    });

    // Update profile with calculated nutrition goals
    const { error: goalsError } = await supabase
      .from("user_profiles")
      .update({
        daily_calorie_goal: nutritionGoals.calories,
        protein_goal: nutritionGoals.protein,
        carb_goal: nutritionGoals.carbs,
        fat_goal: nutritionGoals.fat,
        fiber_goal: nutritionGoals.fiber,
        water_goal: nutritionGoals.water,
      })
      .eq("user_id", user.id);

    if (goalsError) {
      console.error("Error updating nutrition goals:", goalsError);
      return { success: false, error: goalsError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return { success: false, error: "Failed to complete onboarding" };
  }
}
