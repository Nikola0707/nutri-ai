"use client"

import { useState } from "react"
import { ArrowLeft, Clock, Users, ChefHat, Heart, Star, Plus, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toggleRecipeFavorite, rateRecipe } from "@/lib/actions"
import { toast } from "sonner"
import { AddToMealPlanDialog } from "./add-to-meal-plan-dialog"

interface Recipe {
  id: string
  title: string
  description: string
  image_url: string | null
  prep_time: number | null
  cook_time: number | null
  total_time: number | null
  servings: number | null
  difficulty: string | null
  cuisine_type: string | null
  dietary_tags: string[] | null
  calories_per_serving: number | null
  protein_per_serving: number | null
  carbs_per_serving: number | null
  fat_per_serving: number | null
  fiber_per_serving: number | null
  sugar_per_serving: number | null
  sodium_per_serving: number | null
  ingredients: Array<{
    id: string
    ingredient_name: string
    amount: number | null
    unit: string | null
    notes: string | null
    order_index: number
  }>
  instructions: Array<{
    id: string
    step_number: number
    instruction: string
    time_minutes: number | null
    temperature: number | null
    image_url: string | null
  }>
  average_rating: number
  total_ratings: number
}

interface RecipeDetailProps {
  recipe: Recipe
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [servings, setServings] = useState(recipe.servings || 1)
  const [showAddToMealPlan, setShowAddToMealPlan] = useState(false)

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200"
    }
  }

  const handleFavoriteToggle = async () => {
    try {
      const result = await toggleRecipeFavorite(recipe.id)
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
      const result = await rateRecipe(recipe.id, rating)
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

  const toggleStepCompletion = (stepNumber: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepNumber)) {
      newCompleted.delete(stepNumber)
    } else {
      newCompleted.add(stepNumber)
    }
    setCompletedSteps(newCompleted)
  }

  const adjustServings = (newServings: number) => {
    if (newServings > 0) {
      setServings(newServings)
    }
  }

  const getAdjustedAmount = (originalAmount: number | null) => {
    if (!originalAmount || !recipe.servings) return originalAmount
    return Math.round(((originalAmount * servings) / recipe.servings) * 100) / 100
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-neutral-100">
          <ArrowLeft size={20} />
          Back
        </Button>
      </div>

      {/* Recipe Hero */}
      <div className="relative mb-8">
        <div className="aspect-[16/9] bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl overflow-hidden relative">
          {recipe.image_url ? (
            <img
              src={recipe.image_url || "/placeholder.svg"}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat size={64} className="text-emerald-600 opacity-50" />
            </div>
          )}

          {/* Overlay with actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFavoriteToggle}
              className={`bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-sm ${
                isFavorited ? "text-red-500" : "text-neutral-600"
              }`}
            >
              <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
            </Button>
          </div>

          {/* Difficulty badge */}
          {recipe.difficulty && (
            <Badge className={`absolute top-4 left-4 ${getDifficultyColor(recipe.difficulty)} border font-medium`}>
              {recipe.difficulty}
            </Badge>
          )}
        </div>

        {/* Recipe Title and Info */}
        <div className="mt-6">
          <h1 className="text-4xl font-black text-neutral-900 mb-3">{recipe.title}</h1>
          <p className="text-lg text-neutral-600 mb-6">{recipe.description}</p>

          {/* Recipe Meta */}
          <div className="flex flex-wrap items-center gap-6 text-neutral-600 mb-6">
            {recipe.total_time && (
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span className="font-medium">{recipe.total_time} min</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span className="font-medium">{recipe.servings} servings</span>
              </div>
            )}
            {recipe.cuisine_type && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-0">
                {recipe.cuisine_type}
              </Badge>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="text-yellow-400 hover:text-yellow-500 transition-colors"
                  >
                    <Star
                      size={20}
                      fill={star <= (userRating || recipe.average_rating || 0) ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-neutral-600">
                {recipe.average_rating ? recipe.average_rating.toFixed(1) : "0.0"} ({recipe.total_ratings || 0} reviews)
              </span>
            </div>
          </div>

          {/* Dietary Tags */}
          {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {recipe.dietary_tags.map((tag) => (
                <Badge key={tag} variant="outline" className="border-emerald-200 text-emerald-700">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Ingredients & Nutrition */}
        <div className="lg:col-span-1 space-y-6">
          {/* Nutrition Facts */}
          {(recipe.calories_per_serving ||
            recipe.protein_per_serving ||
            recipe.carbs_per_serving ||
            recipe.fat_per_serving) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Nutrition Facts</CardTitle>
                <p className="text-sm text-neutral-600">Per serving</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipe.calories_per_serving && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Calories</span>
                    <span className="text-emerald-600 font-bold">
                      {Math.round((recipe.calories_per_serving * servings) / (recipe.servings || 1))}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {recipe.protein_per_serving && (
                    <div className="text-center">
                      <div className="font-medium text-neutral-900">
                        {Math.round(((recipe.protein_per_serving * servings) / (recipe.servings || 1)) * 10) / 10}g
                      </div>
                      <div className="text-neutral-600">Protein</div>
                    </div>
                  )}
                  {recipe.carbs_per_serving && (
                    <div className="text-center">
                      <div className="font-medium text-neutral-900">
                        {Math.round(((recipe.carbs_per_serving * servings) / (recipe.servings || 1)) * 10) / 10}g
                      </div>
                      <div className="text-neutral-600">Carbs</div>
                    </div>
                  )}
                  {recipe.fat_per_serving && (
                    <div className="text-center">
                      <div className="font-medium text-neutral-900">
                        {Math.round(((recipe.fat_per_serving * servings) / (recipe.servings || 1)) * 10) / 10}g
                      </div>
                      <div className="text-neutral-600">Fat</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Ingredients</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustServings(servings - 1)}
                    disabled={servings <= 1}
                  >
                    -
                  </Button>
                  <span className="text-sm font-medium w-8 text-center">{servings}</span>
                  <Button variant="outline" size="sm" onClick={() => adjustServings(servings + 1)}>
                    +
                  </Button>
                  <span className="text-sm text-neutral-600 ml-2">servings</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <span className="font-medium">
                        {ingredient.amount && (
                          <>
                            {getAdjustedAmount(ingredient.amount)}
                            {ingredient.unit && ` ${ingredient.unit}`}{" "}
                          </>
                        )}
                        {ingredient.ingredient_name}
                      </span>
                      {ingredient.notes && <span className="text-neutral-600 text-sm ml-1">({ingredient.notes})</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setShowAddToMealPlan(true)}
              >
                <Plus size={20} className="mr-2" />
                Add to Meal Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Instructions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Instructions</CardTitle>
              <p className="text-sm text-neutral-600">
                {recipe.prep_time && `Prep: ${recipe.prep_time} min`}
                {recipe.prep_time && recipe.cook_time && " • "}
                {recipe.cook_time && `Cook: ${recipe.cook_time} min`}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recipe.instructions.map((instruction) => (
                  <div key={instruction.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => toggleStepCompletion(instruction.step_number)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          completedSteps.has(instruction.step_number)
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-neutral-300 hover:border-emerald-600"
                        }`}
                      >
                        {completedSteps.has(instruction.step_number) ? (
                          <Check size={16} />
                        ) : (
                          <span className="text-sm font-medium">{instruction.step_number}</span>
                        )}
                      </button>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-neutral-900 leading-relaxed ${
                          completedSteps.has(instruction.step_number) ? "line-through opacity-60" : ""
                        }`}
                      >
                        {instruction.instruction}
                      </p>
                      {instruction.time_minutes && (
                        <p className="text-sm text-emerald-600 mt-1 font-medium">
                          ⏱ {instruction.time_minutes} minutes
                        </p>
                      )}
                      {instruction.temperature && (
                        <p className="text-sm text-orange-600 mt-1 font-medium">🌡 {instruction.temperature}°F</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddToMealPlanDialog
        recipe={recipe}
        open={showAddToMealPlan}
        onOpenChange={setShowAddToMealPlan}
        servings={servings}
      />
    </div>
  )
}
