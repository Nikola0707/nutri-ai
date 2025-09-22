"use client";

import { useState, useEffect, useRef } from "react";
import { RecipeCard } from "./recipe-card";
import { getRecipes } from "@/lib/actions/recipes";
import { ChefHat, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lastFiltersRef = useRef<string>("");

  const RECIPES_PER_PAGE = 12;

  useEffect(() => {
    // Create a string representation of filters to compare
    const filtersString = JSON.stringify({
      search: filters.search || "",
      cuisine: filters.cuisine,
      difficulty: filters.difficulty,
      dietaryTags: filters.dietaryTags.sort(), // Sort to ensure consistent comparison
    });

    // Only fetch if filters actually changed
    if (filtersString === lastFiltersRef.current) {
      return;
    }

    lastFiltersRef.current = filtersString;
    setCurrentPage(1); // Reset to first page when filters change

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
          setTotalPages(Math.ceil(result.recipes.length / RECIPES_PER_PAGE));
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

  // Calculate paginated recipes
  const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
  const endIndex = startIndex + RECIPES_PER_PAGE;
  const paginatedRecipes = recipes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of recipes section
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    <div className="space-y-6">
      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedRecipes.map((recipe, index) => (
          <RecipeCard key={`${recipe.id}-${index}`} recipe={recipe} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const shouldShow =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1);

              if (!shouldShow) {
                // Show ellipsis for gaps
                if (page === 2 && currentPage > 4) {
                  return (
                    <span
                      key={`ellipsis-${page}`}
                      className="px-2 text-gray-500"
                    >
                      ...
                    </span>
                  );
                }
                if (page === totalPages - 1 && currentPage < totalPages - 3) {
                  return (
                    <span
                      key={`ellipsis-${page}`}
                      className="px-2 text-gray-500"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-10 h-10 p-0"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Results info */}
      <div className="text-center text-sm text-gray-500 mt-4">
        Showing {startIndex + 1}-{Math.min(endIndex, recipes.length)} of{" "}
        {recipes.length} recipes
      </div>
    </div>
  );
}
