"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getRandomRecipes } from "@/lib/recipe-api";
import { getMealType, getFallbackMeals } from "./utils";

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
    const { getRecipeById } = await import("@/lib/recipe-api");
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

// Helper function to generate sample meals
async function generateSampleMeals(data: any) {
  try {
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
