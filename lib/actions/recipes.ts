"use server";

import { createServerClient } from "@/lib/supabase/server";
import { searchRecipes, getRecipeById, getRandomRecipes } from "@/lib/recipe-api";

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
