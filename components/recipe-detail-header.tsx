"use client";

import { Clock, Users, ChefHat } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
}

interface RecipeDetailHeaderProps {
  recipe: Recipe;
}

export function RecipeDetailHeader({ recipe }: RecipeDetailHeaderProps) {
  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Recipe Image */}
      <div className="relative">
        <div className="aspect-[16/9] bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl overflow-hidden">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat size={64} className="text-emerald-600 opacity-50" />
            </div>
          )}
        </div>
      </div>

      {/* Recipe Title and Basic Info */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {recipe.title}
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            {recipe.description}
          </p>
        </div>

        {/* Recipe Meta */}
        <div className="flex flex-wrap items-center gap-4">
          {recipe.total_time && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={20} />
              <span className="font-medium">{recipe.total_time} minutes</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={20} />
              <span className="font-medium">{recipe.servings} servings</span>
            </div>
          )}
          {recipe.difficulty && (
            <Badge
              className={`${getDifficultyColor(recipe.difficulty)} font-medium`}
            >
              {recipe.difficulty}
            </Badge>
          )}
          {recipe.cuisine_type && (
            <Badge variant="outline" className="text-gray-700 border-gray-300">
              {recipe.cuisine_type}
            </Badge>
          )}
        </div>

        {/* Dietary Tags */}
        {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.dietary_tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-emerald-100 text-emerald-800 border-emerald-200"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
