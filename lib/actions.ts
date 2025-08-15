"use server";

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { searchRecipes, getRecipeById, getRandomRecipes } from "./recipe-api";

// Sign in action
export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" };
  }

  const email = formData.get("email");
  const password = formData.get("password");
  const rememberMe = formData.get("rememberMe") === "on";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createServerClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// Sign up action
export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" };
  }

  const email = formData.get("email");
  const password = formData.get("password");
  const fullName = formData.get("fullName");

  if (!email || !password || !fullName) {
    return { error: "All fields are required" };
  }

  const supabase = await createServerClient();

  try {
    const { error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          }/dashboard`,
        data: {
          full_name: fullName.toString(),
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { success: "Check your email to confirm your account." };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// Sign out action
export async function signOut() {
  const supabase = await createServerClient();

  await supabase.auth.signOut();
  redirect("/auth/login");
}

// Social login functions
export async function signInWithGoogle() {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback`,
    },
  });

  if (error) {
    console.error("Google sign in error:", error);
    redirect("/auth/login?error=oauth_error");
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signInWithApple() {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback`,
    },
  });

  if (error) {
    console.error("Apple sign in error:", error);
    redirect("/auth/login?error=oauth_error");
  }

  if (data.url) {
    redirect(data.url);
  }
}

// Generate meal plan
export async function generateMealPlan(data: {
  userId: string;
  name: string;
  description: string;
  duration: string;
  startDate: Date;
  mealsPerDay: string;
  cuisineTypes: string[];
  dietaryRestrictions: string[];
  calorieTarget: string;
  proteinTarget: string;
  carbTarget: string;
  fatTarget: string;
  excludeIngredients: string;
  includeIngredients: string;
  mealComplexity: string;
  userProfile: any;
  userPreferences: any;
}) {
  const supabase = await createServerClient();

  try {
    // Create the meal plan record
    const { data: mealPlan, error: mealPlanError } = await supabase
      .from("meal_plans")
      .insert({
        user_id: data.userId,
        name: data.name,
        description: data.description,
        start_date: data.startDate.toISOString().split("T")[0],
        end_date: new Date(
          data.startDate.getTime() +
            Number.parseInt(data.duration) * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        total_days: Number.parseInt(data.duration),
        meals_per_day: Number.parseInt(data.mealsPerDay),
        target_calories: data.calorieTarget
          ? Number.parseInt(data.calorieTarget)
          : null,
        target_protein: data.proteinTarget
          ? Number.parseInt(data.proteinTarget)
          : null,
        target_carbs: data.carbTarget ? Number.parseInt(data.carbTarget) : null,
        target_fat: data.fatTarget ? Number.parseInt(data.fatTarget) : null,
        cuisine_preferences: data.cuisineTypes,
        dietary_restrictions: data.dietaryRestrictions,
        status: "active",
      })
      .select()
      .single();

    if (mealPlanError) {
      console.error("Error creating meal plan:", mealPlanError);
      let errorMessage = mealPlanError.message;
      if (
        mealPlanError.message.includes('relation "meal_plans" does not exist')
      ) {
        errorMessage =
          "Database tables are not set up. Please run the meal plan database setup script.";
      } else if (mealPlanError.message.includes("permission denied")) {
        errorMessage =
          "Permission denied. Please check your account permissions.";
      }
      return { success: false, error: errorMessage };
    }

    if (!mealPlan || !mealPlan.id) {
      console.error("Meal plan was not created properly");
      return { success: false, error: "Failed to create meal plan record" };
    }

    // Generate sample meals
    const sampleMeals = await generateSampleMeals(data);

    // Insert meals for each day
    const mealsToInsert = [];
    for (let day = 1; day <= Number.parseInt(data.duration); day++) {
      const dayMeals = sampleMeals.slice(0, Number.parseInt(data.mealsPerDay));

      for (let mealIndex = 0; mealIndex < dayMeals.length; mealIndex++) {
        const meal = dayMeals[mealIndex];
        mealsToInsert.push({
          meal_plan_id: mealPlan.id,
          day_number: day,
          meal_type: getMealType(mealIndex),
          name: meal.name,
          description: meal.description,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          prep_time: meal.prep_time,
          cook_time: meal.cook_time,
          servings: meal.servings,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          fiber: meal.fiber,
        });
      }
    }

    const { error: mealsError } = await supabase
      .from("meals")
      .insert(mealsToInsert);

    if (mealsError) {
      console.error("Error creating meals:", mealsError);
      let errorMessage = mealsError.message;
      if (mealsError.message.includes('relation "meals" does not exist')) {
        errorMessage =
          "Database tables are not set up. Please run the meal plan database setup script.";
      }
      return { success: false, error: errorMessage };
    }

    return { success: true, mealPlanId: mealPlan.id };
  } catch (error) {
    console.error("Error generating meal plan:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Full error details:", errorMessage);
    return {
      success: false,
      error: `Failed to generate meal plan: ${errorMessage}`,
    };
  }
}

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

// Create grocery list
export async function createGroceryList(data: {
  userId: string;
  name: string;
  description: string;
  mealPlanId: string | null;
  type: "custom" | "meal-plan";
}) {
  const supabase = await createServerClient();

  try {
    // Create the grocery list
    const { data: groceryList, error: listError } = await supabase
      .from("grocery_lists")
      .insert({
        user_id: data.userId,
        name: data.name,
        description: data.description,
        meal_plan_id: data.mealPlanId,
        status: "active",
      })
      .select()
      .single();

    if (listError) {
      console.error("Error creating grocery list:", listError);
      return { success: false, error: listError.message };
    }

    // If creating from meal plan, generate items from meal ingredients
    if (data.type === "meal-plan" && data.mealPlanId) {
      const { data: meals } = await supabase
        .from("meals")
        .select("ingredients")
        .eq("meal_plan_id", data.mealPlanId);

      if (meals) {
        const allIngredients = meals.flatMap((meal) => meal.ingredients || []);
        const uniqueIngredients = [...new Set(allIngredients)];

        const groceryItems = uniqueIngredients.map((ingredient) => ({
          grocery_list_id: groceryList.id,
          name: ingredient,
          category: categorizeIngredient(ingredient),
          is_purchased: false,
        }));

        await supabase.from("grocery_list_items").insert(groceryItems);
      }
    }

    return { success: true, groceryListId: groceryList.id };
  } catch (error) {
    console.error("Error creating grocery list:", error);
    return { success: false, error: "Failed to create grocery list" };
  }
}

// Add grocery item
export async function addGroceryItem(data: {
  groceryListId: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  category: string;
}) {
  const supabase = await createServerClient();

  try {
    const { data: item, error } = await supabase
      .from("grocery_list_items")
      .insert({
        grocery_list_id: data.groceryListId,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        category: data.category,
        is_purchased: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding grocery item:", error);
      return { success: false, error: error.message };
    }

    return { success: true, item };
  } catch (error) {
    console.error("Error adding grocery item:", error);
    return { success: false, error: "Failed to add item" };
  }
}

// Update grocery item
export async function updateGroceryItem(
  itemId: string,
  updates: { is_purchased?: boolean }
) {
  const supabase = await createServerClient();

  try {
    const { error } = await supabase
      .from("grocery_list_items")
      .update(updates)
      .eq("id", itemId);

    if (error) {
      console.error("Error updating grocery item:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating grocery item:", error);
    return { success: false, error: "Failed to update item" };
  }
}

// Delete grocery item
export async function deleteGroceryItem(itemId: string) {
  const supabase = await createServerClient();

  try {
    const { error } = await supabase
      .from("grocery_list_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Error deleting grocery item:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting grocery item:", error);
    return { success: false, error: "Failed to delete item" };
  }
}

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

// Change password
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const supabase = await createServerClient();

  try {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) {
      console.error("Error changing password:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Failed to change password" };
  }
}

// Send chat message
export async function sendChatMessage(data: {
  userId: string;
  message: string;
  userProfile: any;
  userPreferences: any;
}) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: data.message,
        userProfile: data.userProfile,
        userPreferences: data.userPreferences,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const result = await response.json();
    return { success: true, response: result.response };
  } catch (error) {
    console.error("Error sending chat message:", error);
    return { success: false, error: "Failed to send message" };
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

// Recipe-related server actions using TheMealDB API
// Get recipes with optional filtering
export async function getRecipes(filters?: {
  search?: string;
  cuisine?: string;
  difficulty?: string;
  dietaryTags?: string[];
}) {
  try {
    let recipes = [];

    if (filters?.search) {
      // Search by query
      recipes = await searchRecipes(filters.search);
    } else if (filters?.cuisine && filters.cuisine !== "any") {
      // Search by category/cuisine
      recipes = await searchRecipes("", filters.cuisine);
    } else {
      // Get random recipes for browsing
      recipes = await getRandomRecipes(20);
    }

    // Remove duplicates based on recipe ID
    let uniqueRecipes = recipes.filter(
      (recipe, index, self) =>
        index === self.findIndex((r) => r.id === recipe.id)
    );

    // Apply client-side filtering for difficulty and dietary preferences
    if (filters?.difficulty && filters.difficulty !== "any") {
      uniqueRecipes = uniqueRecipes.filter(
        (recipe) =>
          recipe.difficulty?.toLowerCase() === filters.difficulty?.toLowerCase()
      );
    }

    if (filters?.dietaryTags && filters.dietaryTags.length > 0) {
      uniqueRecipes = uniqueRecipes.filter((recipe) =>
        filters.dietaryTags?.some((tag) =>
          recipe.dietary_tags?.some((recipeTag: string) =>
            recipeTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    return { success: true, recipes: uniqueRecipes };
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return { success: false, error: "Failed to fetch recipes", recipes: [] };
  }
}

// Get single recipe with ingredients and instructions
export async function getRecipe(recipeId: string) {
  try {
    const recipe = await getRecipeById(recipeId);

    if (!recipe) {
      return { success: false, error: "Recipe not found" };
    }

    return {
      success: true,
      recipe: {
        ...recipe,
        average_rating: recipe.average_rating,
        total_ratings: recipe.total_ratings,
      },
    };
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return { success: false, error: "Failed to fetch recipe" };
  }
}

// Toggle recipe favorite (store in local database)
export async function toggleRecipeFavorite(recipeId: string) {
  const supabase = await createServerClient();

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if already favorited
    const { data: existing, error: checkError } = await supabase
      .from("recipe_favorites")
      .select("id")
      .eq("recipe_id", recipeId)
      .eq("user_id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking favorite:", checkError);
      return { success: false, error: checkError.message };
    }

    if (existing) {
      // Remove from favorites
      const { error: deleteError } = await supabase
        .from("recipe_favorites")
        .delete()
        .eq("recipe_id", recipeId)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Error removing favorite:", deleteError);
        return { success: false, error: deleteError.message };
      }

      return { success: true, isFavorited: false };
    } else {
      // Add to favorites
      const { error: insertError } = await supabase
        .from("recipe_favorites")
        .insert({
          recipe_id: recipeId,
          user_id: user.id,
        });

      if (insertError) {
        console.error("Error adding favorite:", insertError);
        return { success: false, error: insertError.message };
      }

      return { success: true, isFavorited: true };
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { success: false, error: "Failed to toggle favorite" };
  }
}

// Rate recipe (store in local database)
export async function rateRecipe(
  recipeId: string,
  rating: number,
  review?: string
) {
  const supabase = await createServerClient();

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Upsert rating
    const { error } = await supabase.from("recipe_ratings").upsert({
      recipe_id: recipeId,
      user_id: user.id,
      rating,
      review: review || null,
    });

    if (error) {
      console.error("Error rating recipe:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error rating recipe:", error);
    return { success: false, error: "Failed to rate recipe" };
  }
}

// Delete meal plan
export async function deleteMealPlan(mealPlanId: string) {
  const supabase = await createServerClient();

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // First, delete all meals associated with this meal plan
    const { error: mealsError } = await supabase
      .from("meals")
      .delete()
      .eq("meal_plan_id", mealPlanId);

    if (mealsError) {
      console.error("Error deleting meals:", mealsError);
      return { success: false, error: mealsError.message };
    }

    // Then delete the meal plan itself
    const { error: mealPlanError } = await supabase
      .from("meal_plans")
      .delete()
      .eq("id", mealPlanId)
      .eq("user_id", user.id); // Ensure user can only delete their own meal plans

    if (mealPlanError) {
      console.error("Error deleting meal plan:", mealPlanError);
      return { success: false, error: mealPlanError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    return { success: false, error: "Failed to delete meal plan" };
  }
}

// Add recipe to meal plan (using TheMealDB recipe data)
export async function addRecipeToMealPlan(data: {
  recipeId: string;
  mealPlanId: string;
  dayNumber: number;
  mealType: string;
  servings?: number;
}) {
  const supabase = await createServerClient();

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get recipe from TheMealDB API
    const recipe = await getRecipeById(data.recipeId);

    if (!recipe) {
      return { success: false, error: "Recipe not found" };
    }

    // Create meal from recipe
    const servingMultiplier =
      (data.servings || recipe.servings || 1) / (recipe.servings || 1);

    const { error: mealError } = await supabase.from("meals").insert({
      meal_plan_id: data.mealPlanId,
      day_number: data.dayNumber,
      meal_type: data.mealType,
      name: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients.map(
        (ing) =>
          `${
            ing.amount
              ? Math.round(ing.amount * servingMultiplier * 100) / 100
              : ""
          } ${ing.unit || ""} ${ing.ingredient_name}`
      ),
      instructions: recipe.instructions.map((inst) => inst.instruction),
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      servings: data.servings || recipe.servings,
      calories: recipe.calories_per_serving
        ? Math.round(recipe.calories_per_serving * servingMultiplier)
        : null,
      protein: recipe.protein_per_serving
        ? Math.round(recipe.protein_per_serving * servingMultiplier * 100) / 100
        : null,
      carbs: recipe.carbs_per_serving
        ? Math.round(recipe.carbs_per_serving * servingMultiplier * 100) / 100
        : null,
      fat: recipe.fat_per_serving
        ? Math.round(recipe.fat_per_serving * servingMultiplier * 100) / 100
        : null,
      fiber: recipe.fiber_per_serving
        ? Math.round(recipe.fiber_per_serving * servingMultiplier * 100) / 100
        : null,
      recipe_id: data.recipeId, // Link to TheMealDB recipe ID
    });

    if (mealError) {
      console.error("Error adding recipe to meal plan:", mealError);
      return { success: false, error: mealError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding recipe to meal plan:", error);
    return { success: false, error: "Failed to add recipe to meal plan" };
  }
}

// Helper functions
function getMealType(index: number): string {
  const types = ["breakfast", "lunch", "dinner", "snack", "snack"];
  return types[index] || "snack";
}

async function generateSampleMeals(data: any) {
  try {
    // Import the recipe API functions
    const { getRandomRecipes } = await import("./recipe-api");

    // Get random recipes from TheMealDB API
    const recipes = await getRandomRecipes(20); // Get more than needed to have variety

    if (!recipes || recipes.length === 0) {
      // Fallback to static meals if API fails
      return getFallbackMeals(data);
    }

    // Convert recipes to meal format
    const meals = recipes.map((recipe) => ({
      name: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients.map((ing) =>
        `${ing.amount ? `${ing.amount} ${ing.unit || ""}` : ""} ${
          ing.ingredient_name
        }`.trim()
      ),
      instructions: recipe.instructions.map((inst) => inst.instruction),
      prep_time: recipe.prep_time || 10,
      cook_time: recipe.cook_time || 20,
      servings: recipe.servings || 4,
      calories: recipe.calories_per_serving || 300,
      protein: recipe.protein_per_serving || 20,
      carbs: recipe.carbs_per_serving || 30,
      fat: recipe.fat_per_serving || 10,
      fiber: recipe.fiber_per_serving || 5,
      recipe_id: recipe.id, // Store the original recipe ID for linking
    }));

    // Shuffle and return the needed number of meals
    const shuffled = [...meals].sort(() => Math.random() - 0.5);
    const mealsNeeded = Math.min(
      Number.parseInt(data.mealsPerDay),
      shuffled.length
    );
    return shuffled.slice(0, mealsNeeded);
  } catch (error) {
    console.error("Error fetching recipes from API:", error);
    // Fallback to static meals if API fails
    return getFallbackMeals(data);
  }
}

function getFallbackMeals(data: any) {
  // Fallback meals if API is unavailable
  const fallbackMeals = [
    {
      name: "Avocado Toast with Eggs",
      description:
        "Whole grain toast topped with mashed avocado and poached eggs",
      ingredients: [
        "2 slices whole grain bread",
        "1 ripe avocado",
        "2 eggs",
        "Salt",
        "Pepper",
        "Lemon juice",
      ],
      instructions: [
        "Toast bread",
        "Mash avocado with lemon juice",
        "Poach eggs",
        "Assemble and season",
      ],
      prep_time: 5,
      cook_time: 10,
      servings: 1,
      calories: 420,
      protein: 18,
      carbs: 32,
      fat: 26,
      fiber: 12,
    },
    {
      name: "Grilled Chicken Salad",
      description: "Mixed greens with grilled chicken breast and vegetables",
      ingredients: [
        "6oz chicken breast",
        "Mixed greens",
        "Cherry tomatoes",
        "Cucumber",
        "Olive oil",
        "Balsamic vinegar",
      ],
      instructions: [
        "Grill chicken",
        "Prepare vegetables",
        "Mix salad",
        "Add dressing",
      ],
      prep_time: 10,
      cook_time: 15,
      servings: 1,
      calories: 380,
      protein: 42,
      carbs: 12,
      fat: 16,
      fiber: 6,
    },
    {
      name: "Salmon with Quinoa",
      description:
        "Baked salmon fillet served with quinoa and steamed vegetables",
      ingredients: [
        "6oz salmon fillet",
        "1 cup quinoa",
        "Broccoli",
        "Carrots",
        "Olive oil",
        "Herbs",
      ],
      instructions: [
        "Bake salmon",
        "Cook quinoa",
        "Steam vegetables",
        "Season and serve",
      ],
      prep_time: 10,
      cook_time: 25,
      servings: 1,
      calories: 520,
      protein: 38,
      carbs: 45,
      fat: 22,
      fiber: 8,
    },
  ];

  const shuffled = [...fallbackMeals].sort(() => Math.random() - 0.5);
  const mealsNeeded = Math.min(
    Number.parseInt(data.mealsPerDay),
    shuffled.length
  );
  return shuffled.slice(0, mealsNeeded);
}

function categorizeIngredient(ingredient: string): string {
  const lower = ingredient.toLowerCase();

  if (
    lower.includes("chicken") ||
    lower.includes("beef") ||
    lower.includes("fish") ||
    lower.includes("salmon")
  ) {
    return "Meat & Seafood";
  }
  if (
    lower.includes("milk") ||
    lower.includes("cheese") ||
    lower.includes("yogurt") ||
    lower.includes("butter")
  ) {
    return "Dairy";
  }
  if (
    lower.includes("apple") ||
    lower.includes("banana") ||
    lower.includes("tomato") ||
    lower.includes("lettuce") ||
    lower.includes("spinach")
  ) {
    return "Produce";
  }
  if (
    lower.includes("bread") ||
    lower.includes("bagel") ||
    lower.includes("muffin")
  ) {
    return "Bakery";
  }
  if (lower.includes("frozen")) {
    return "Frozen";
  }

  return "Pantry";
}

// Helper function to calculate nutrition goals
function calculateNutritionGoals(profile: {
  age: number;
  gender: string;
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
  targetWeight: number | null;
}) {
  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr: number;
  if (profile.gender === "male") {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    "very-active": 1.9,
  };

  const multiplier =
    activityMultipliers[
      profile.activityLevel as keyof typeof activityMultipliers
    ] || 1.2;
  const tdee = bmr * multiplier;

  // Adjust calories based on goal
  let calories = tdee;
  if (profile.goal === "weight-loss") {
    calories = tdee - 500; // 1 lb per week deficit
  } else if (profile.goal === "muscle-gain") {
    calories = tdee + 300; // Moderate surplus
  }

  // Calculate macros (40% carbs, 30% protein, 30% fat for balanced approach)
  const protein = Math.round((calories * 0.3) / 4); // 4 calories per gram
  const carbs = Math.round((calories * 0.4) / 4); // 4 calories per gram
  const fat = Math.round((calories * 0.3) / 9); // 9 calories per gram

  // Fiber and water goals
  const fiber = Math.round(profile.weight * 0.5); // 0.5g per kg body weight
  const water = Math.round(profile.weight * 0.035); // 35ml per kg body weight

  return {
    calories: Math.round(calories),
    protein,
    carbs,
    fat,
    fiber,
    water,
  };
}
