"use server";

import { createServerClient } from "@/lib/supabase/server";
import { categorizeIngredient } from "./utils";

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
