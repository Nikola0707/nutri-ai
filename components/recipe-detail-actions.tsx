"use client"

import { useState } from "react"
import { Heart, Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toggleRecipeFavorite, rateRecipe } from "@/lib/actions"
import { toast } from "sonner"
import { AddToMealPlanDialog } from "./add-to-meal-plan-dialog"

interface RecipeDetailActionsProps {
  recipeId: string
  recipeTitle: string
  averageRating: number
  totalRatings: number
}

export function RecipeDetailActions({ 
  recipeId, 
  recipeTitle, 
  averageRating, 
  totalRatings 
}: RecipeDetailActionsProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [showAddToMealPlan, setShowAddToMealPlan] = useState(false)

  const handleFavoriteToggle = async () => {
    try {
      const result = await toggleRecipeFavorite(recipeId)
      if (result.success) {
        setIsFavorited(result.isFavorited)
        toast.success(result.isFavorited ? "Added to favorites" : "Removed from favorites")
      } else {
        toast.error(result.error || "Failed to update favorite")
      }
    } catch (error) {
      toast.error("Failed to update favorite")
    }
  }

  const handleRating = async (rating: number) => {
    try {
      const result = await rateRecipe(recipeId, rating)
      if (result.success) {
        setUserRating(rating)
        toast.success("Rating submitted")
      } else {
        toast.error(result.error || "Failed to submit rating")
      }
    } catch (error) {
      toast.error("Failed to submit rating")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Favorite Button */}
        <Button
          variant="outline"
          onClick={handleFavoriteToggle}
          className={`w-full ${
            isFavorited 
              ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
              : "hover:bg-gray-50"
          }`}
        >
          <Heart 
            size={20} 
            className={`mr-2 ${isFavorited ? "fill-current" : ""}`} 
          />
          {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
        </Button>

        <Separator />

        {/* Rating Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rate this recipe</span>
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({totalRatings} ratings)
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant="ghost"
                size="sm"
                onClick={() => handleRating(rating)}
                className={`p-1 h-8 w-8 ${
                  userRating >= rating 
                    ? "text-yellow-400" 
                    : "text-gray-300 hover:text-yellow-400"
                }`}
              >
                <Star 
                  size={16} 
                  className={userRating >= rating ? "fill-current" : ""} 
                />
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Add to Meal Plan Button */}
        <Button
          onClick={() => setShowAddToMealPlan(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus size={20} className="mr-2" />
          Add to Meal Plan
        </Button>

        {/* Add to Meal Plan Dialog */}
        {showAddToMealPlan && (
          <AddToMealPlanDialog
            recipeId={recipeId}
            recipeTitle={recipeTitle}
            onClose={() => setShowAddToMealPlan(false)}
          />
        )}
      </CardContent>
    </Card>
  )
}
