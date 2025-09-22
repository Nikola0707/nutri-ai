"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Recipe {
  calories_per_serving: number | null;
  protein_per_serving: number | null;
  carbs_per_serving: number | null;
  fat_per_serving: number | null;
  fiber_per_serving: number | null;
  sugar_per_serving: number | null;
  sodium_per_serving: number | null;
}

interface RecipeDetailNutritionProps {
  recipe: Recipe;
  servings: number;
}

export function RecipeDetailNutrition({
  recipe,
  servings,
}: RecipeDetailNutritionProps) {
  const getAdjustedAmount = (originalAmount: number | null) => {
    if (!originalAmount) return null;
    return Math.round(originalAmount * servings * 100) / 100;
  };

  const nutritionData = [
    {
      label: "Calories",
      value: getAdjustedAmount(recipe.calories_per_serving),
      unit: "cal",
      color: "text-orange-600",
    },
    {
      label: "Protein",
      value: getAdjustedAmount(recipe.protein_per_serving),
      unit: "g",
      color: "text-blue-600",
    },
    {
      label: "Carbs",
      value: getAdjustedAmount(recipe.carbs_per_serving),
      unit: "g",
      color: "text-green-600",
    },
    {
      label: "Fat",
      value: getAdjustedAmount(recipe.fat_per_serving),
      unit: "g",
      color: "text-purple-600",
    },
    {
      label: "Fiber",
      value: getAdjustedAmount(recipe.fiber_per_serving),
      unit: "g",
      color: "text-emerald-600",
    },
    {
      label: "Sugar",
      value: getAdjustedAmount(recipe.sugar_per_serving),
      unit: "g",
      color: "text-pink-600",
    },
    {
      label: "Sodium",
      value: getAdjustedAmount(recipe.sodium_per_serving),
      unit: "mg",
      color: "text-gray-600",
    },
  ];

  const hasNutritionData = nutritionData.some((item) => item.value !== null);

  if (!hasNutritionData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {nutritionData.map(
            (item) =>
              item.value !== null && (
                <div key={item.label} className="text-center">
                  <div className={`text-2xl font-bold ${item.color}`}>
                    {item.value}
                  </div>
                  <div className="text-sm text-gray-600">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.unit}</div>
                </div>
              )
          )}
        </div>
        {servings !== 1 && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            Values adjusted for {servings} servings
          </p>
        )}
      </CardContent>
    </Card>
  );
}
