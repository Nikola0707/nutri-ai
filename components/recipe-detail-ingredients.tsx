"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Ingredient {
  id: string;
  ingredient_name: string;
  amount: number | null;
  unit: string | null;
  notes: string | null;
  order_index: number;
}

interface RecipeDetailIngredientsProps {
  ingredients: Ingredient[];
  servings: number;
}

export function RecipeDetailIngredients({
  ingredients,
  servings,
}: RecipeDetailIngredientsProps) {
  const getAdjustedAmount = (originalAmount: number | null) => {
    if (!originalAmount) return null;
    return Math.round(originalAmount * servings * 100) / 100;
  };

  const formatIngredient = (ingredient: Ingredient) => {
    const amount = getAdjustedAmount(ingredient.amount);
    const unit = ingredient.unit || "";
    const name = ingredient.ingredient_name;
    const notes = ingredient.notes;

    let formatted = "";
    if (amount) {
      formatted += `${amount} ${unit}`.trim();
    }
    if (name) {
      formatted += ` ${name}`.trim();
    }
    if (notes) {
      formatted += ` (${notes})`;
    }

    return formatted.trim();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredients</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {ingredients
            .sort((a, b) => a.order_index - b.order_index)
            .map((ingredient) => (
              <li key={ingredient.id} className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span className="text-gray-700">
                  {formatIngredient(ingredient)}
                </span>
              </li>
            ))}
        </ul>
        {servings !== 1 && (
          <p className="text-sm text-gray-500 mt-4">
            Quantities adjusted for {servings} servings
          </p>
        )}
      </CardContent>
    </Card>
  );
}
