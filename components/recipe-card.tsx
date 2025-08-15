"use client";

import Link from "next/link";
import { Clock, Users, ChefHat, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white flex flex-col h-full">
      {/* Header - Image */}
      <div className="relative">
        <div className="aspect-[4/3] bg-gradient-to-br from-emerald-100 to-emerald-200 relative overflow-hidden">
          {recipe.image_url ? (
            <img
              src={recipe.image_url || "/placeholder.svg"}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat size={48} className="text-emerald-600 opacity-50" />
            </div>
          )}

          {/* Favorite button */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-sm"
          >
            <Heart size={16} className="text-neutral-600" />
          </Button>

          {/* Difficulty badge */}
          {recipe.difficulty && (
            <Badge
              className={`absolute top-3 left-3 ${getDifficultyColor(
                recipe.difficulty
              )} border-0 font-medium`}
            >
              {recipe.difficulty}
            </Badge>
          )}
        </div>
      </div>

      {/* Content - Takes up available space */}
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="mb-3">
            <h3 className="font-bold text-lg text-neutral-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
              {recipe.title}
            </h3>
            <p className="text-neutral-600 text-sm line-clamp-2">
              {recipe.description}
            </p>
          </div>

          {/* Recipe meta info */}
          <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
            {recipe.total_time && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{recipe.total_time}m</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{recipe.servings}</span>
              </div>
            )}
            {recipe.calories_per_serving && (
              <div className="text-emerald-600 font-medium">
                {recipe.calories_per_serving} cal
              </div>
            )}
          </div>

          {/* Dietary tags */}
          {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {recipe.dietary_tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-neutral-100 text-neutral-700 border-0"
                >
                  {tag}
                </Badge>
              ))}
              {recipe.dietary_tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-neutral-100 text-neutral-700 border-0"
                >
                  +{recipe.dietary_tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Nutrition info */}
          {(recipe.protein_per_serving ||
            recipe.carbs_per_serving ||
            recipe.fat_per_serving) && (
            <div className="grid grid-cols-3 gap-2 text-xs text-neutral-600 mb-4">
              {recipe.protein_per_serving && (
                <div className="text-center">
                  <div className="font-medium text-neutral-900">
                    {recipe.protein_per_serving}g
                  </div>
                  <div>Protein</div>
                </div>
              )}
              {recipe.carbs_per_serving && (
                <div className="text-center">
                  <div className="font-medium text-neutral-900">
                    {recipe.carbs_per_serving}g
                  </div>
                  <div>Carbs</div>
                </div>
              )}
              {recipe.fat_per_serving && (
                <div className="text-center">
                  <div className="font-medium text-neutral-900">
                    {recipe.fat_per_serving}g
                  </div>
                  <div>Fat</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Button always at bottom */}
        <div className="mt-auto pt-4">
          <Link href={`/dashboard/recipes/${recipe.id}`}>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
              View Recipe
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
