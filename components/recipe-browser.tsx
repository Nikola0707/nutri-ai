"use client";

import { useState, useEffect } from "react";
import { RecipeCard } from "./recipe-card";
import { getRecipes } from "@/lib/actions";
import { ChefHat } from "lucide-react";

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
}

interface RecipeBrowserProps {
  filters: {
    search: string;
    cuisine: string;
    difficulty: string;
    dietaryTags: string[];
  };
}

export function RecipeBrowser({ filters }: RecipeBrowserProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        setError(null);

        // Prepare filters for API call
        const apiFilters = {
          search: filters.search || undefined,
          cuisine: filters.cuisine !== "any" ? filters.cuisine : undefined,
          difficulty:
            filters.difficulty !== "any" ? filters.difficulty : undefined,
          dietaryTags:
            filters.dietaryTags.length > 0 ? filters.dietaryTags : undefined,
        };

        const result = await getRecipes(apiFilters);
        if (result.success) {
          setRecipes(result.recipes);
        } else {
          setError(result.error || "Failed to load recipes");
        }
      } catch (err) {
        setError("Failed to load recipes");
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [filters]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="bg-neutral-200 rounded-xl h-48 mb-4"></div>
            <div className="bg-neutral-200 rounded h-6 mb-2"></div>
            <div className="bg-neutral-200 rounded h-4 w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral-500 mb-4">
          <ChefHat size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Unable to load recipes</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral-500 mb-4">
          <ChefHat size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No recipes found</p>
          <p className="text-sm">Try adjusting your filters or search terms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pb-24">
      {recipes.map((recipe, index) => (
        <RecipeCard key={`${recipe.id}-${index}`} recipe={recipe} />
      ))}
    </div>
  );
}
