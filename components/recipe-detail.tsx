"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RecipeDetailHeader } from "./recipe-detail-header";
import { RecipeDetailNutrition } from "./recipe-detail-nutrition";
import { RecipeDetailIngredients } from "./recipe-detail-ingredients";
import { RecipeDetailInstructions } from "./recipe-detail-instructions";
import { RecipeDetailActions } from "./recipe-detail-actions";

interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  servings: number | null;
  difficulty: string | null;
  cuisine_type: string | null;
  dietary_tags: string[] | null;
  calories_per_serving: number | null;
  protein_per_serving: number | null;
  carbs_per_serving: number | null;
  fat_per_serving: number | null;
  fiber_per_serving: number | null;
  sugar_per_serving: number | null;
  sodium_per_serving: number | null;
  ingredients: Array<{
    id: string;
    ingredient_name: string;
    amount: number | null;
    unit: string | null;
    notes: string | null;
    order_index: number;
  }>;
  instructions: Array<{
    id: string;
    step_number: number;
    instruction: string;
    time_minutes: number | null;
    temperature: number | null;
    image_url: string | null;
  }>;
  average_rating: number;
  total_ratings: number;
}

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const router = useRouter();
  const [servings, setServings] = useState(recipe.servings || 1);

  const handleServingsChange = (newServings: number) => {
    if (newServings > 0) {
      setServings(newServings);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <RecipeDetailHeader recipe={recipe} />

            <RecipeDetailNutrition recipe={recipe} servings={servings} />

            <RecipeDetailIngredients
              ingredients={recipe.ingredients}
              servings={servings}
            />

            <RecipeDetailInstructions instructions={recipe.instructions} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Servings Control */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-3">Servings</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleServingsChange(servings - 1)}
                  disabled={servings <= 1}
                >
                  -
                </Button>
                <span className="text-lg font-medium min-w-[3rem] text-center">
                  {servings}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleServingsChange(servings + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <RecipeDetailActions
              recipeId={recipe.id}
              recipeTitle={recipe.title}
              averageRating={recipe.average_rating}
              totalRatings={recipe.total_ratings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
