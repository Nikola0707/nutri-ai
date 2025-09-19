"use client";
import { Suspense, useState, useCallback } from "react";
import { RecipeBrowser } from "@/components/recipe-browser";
import { RecipeFilters } from "@/components/recipe-filters";

export default function RecipesPage() {
  const [filters, setFilters] = useState({
    search: "",
    cuisine: "any",
    difficulty: "any",
    dietaryTags: [] as string[],
  });

  const handleFiltersChange = useCallback(
    (newFilters: {
      search: string;
      cuisine: string;
      difficulty: string;
      dietaryTags: string[];
    }) => {
      setFilters(newFilters);
    },
    []
  );

  // Pass filters directly - RecipeBrowser now handles deduplication internally

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-black text-neutral-900 mb-2">
          Recipe Collection
        </h1>
        <p className="text-neutral-600">
          Discover delicious and healthy recipes tailored to your preferences
        </p>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 mb-6">
        <RecipeFilters onFiltersChange={handleFiltersChange} />
      </div>

      {/* Recipe Browser */}
      <div className="flex-1 min-h-0">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="bg-neutral-200 rounded-xl h-48 mb-4"></div>
                  <div className="bg-neutral-200 rounded h-6 mb-2"></div>
                  <div className="bg-neutral-200 rounded h-4 w-3/4"></div>
                </div>
              ))}
            </div>
          }
        >
          <RecipeBrowser filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}
