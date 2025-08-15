"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Sparkles } from 'lucide-react'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { generateMealPlan } from "@/lib/actions"

interface MealPlanCreatorProps {
  userId: string
  userProfile: any
  userPreferences: any
}

export function MealPlanCreator({ userId, userProfile, userPreferences }: MealPlanCreatorProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "7",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    mealsPerDay: "3",
    cuisineTypes: [] as string[],
    dietaryRestrictions: [] as string[],
    calorieTarget: userProfile?.daily_calorie_goal || "",
    proteinTarget: "",
    carbTarget: "",
    fatTarget: "",
    excludeIngredients: "",
    includeIngredients: "",
    mealComplexity: "medium",
  })

  const cuisineOptions = [
    "Italian",
    "Mexican",
    "Asian",
    "Mediterranean",
    "American",
    "Indian",
    "Thai",
    "Japanese",
    "French",
    "Greek",
    "Middle Eastern",
    "Chinese",
  ]

  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Keto",
    "Paleo",
    "Low-Carb",
    "Low-Fat",
    "Nut-Free",
    "Soy-Free",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateMealPlan({
        userId,
        ...formData,
        userProfile,
        userPreferences,
      })

      if (result.success && result.mealPlanId) {
        router.push(`/dashboard/meal-plans/${result.mealPlanId}`)
      } else {
        let errorMessage = "Failed to generate meal plan. Please try again."
        
        if (result.error) {
          if (result.error.includes('relation "meal_plans" does not exist')) {
            errorMessage = "Database tables are not set up. Please contact support to initialize the meal planning feature."
          } else if (result.error.includes('permission denied')) {
            errorMessage = "You don't have permission to create meal plans. Please check your account status."
          } else {
            errorMessage = `Error: ${result.error}`
          }
        }
        
        setError(errorMessage)
        console.error("Failed to generate meal plan:", result.error)
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Error generating meal plan:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter((i) => i !== item))
    } else {
      setter([...array, item])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <span className="text-sm font-medium">Error:</span>
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Set up the basic details for your meal plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Meal Plan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Weekly Healthy Meals"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">1 week</SelectItem>
                  <SelectItem value="14">2 weeks</SelectItem>
                  <SelectItem value="30">1 month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your meal plan goals..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && setFormData((prev) => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mealsPerDay">Meals per Day</Label>
              <Select
                value={formData.mealsPerDay}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, mealsPerDay: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 meals</SelectItem>
                  <SelectItem value="3">3 meals</SelectItem>
                  <SelectItem value="4">4 meals</SelectItem>
                  <SelectItem value="5">5 meals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cuisine Preferences</CardTitle>
          <CardDescription>Select the types of cuisine you'd like to include</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map((cuisine) => (
              <Badge
                key={cuisine}
                variant={formData.cuisineTypes.includes(cuisine) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  toggleArrayItem(formData.cuisineTypes, cuisine, (items) =>
                    setFormData((prev) => ({ ...prev, cuisineTypes: items })),
                  )
                }
              >
                {cuisine}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dietary Restrictions</CardTitle>
          <CardDescription>Select any dietary restrictions or preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((diet) => (
              <Badge
                key={diet}
                variant={formData.dietaryRestrictions.includes(diet) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  toggleArrayItem(formData.dietaryRestrictions, diet, (items) =>
                    setFormData((prev) => ({ ...prev, dietaryRestrictions: items })),
                  )
                }
              >
                {diet}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nutrition Targets</CardTitle>
          <CardDescription>Set your daily nutrition goals (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                value={formData.calorieTarget}
                onChange={(e) => setFormData((prev) => ({ ...prev, calorieTarget: e.target.value }))}
                placeholder="2000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={formData.proteinTarget}
                onChange={(e) => setFormData((prev) => ({ ...prev, proteinTarget: e.target.value }))}
                placeholder="150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={formData.carbTarget}
                onChange={(e) => setFormData((prev) => ({ ...prev, carbTarget: e.target.value }))}
                placeholder="200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                value={formData.fatTarget}
                onChange={(e) => setFormData((prev) => ({ ...prev, fatTarget: e.target.value }))}
                placeholder="70"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Preferences</CardTitle>
          <CardDescription>Fine-tune your meal plan generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="complexity">Meal Complexity</Label>
            <Select
              value={formData.mealComplexity}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, mealComplexity: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple (15-20 min)</SelectItem>
                <SelectItem value="medium">Medium (20-45 min)</SelectItem>
                <SelectItem value="complex">Complex (45+ min)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exclude">Exclude Ingredients</Label>
              <Input
                id="exclude"
                value={formData.excludeIngredients}
                onChange={(e) => setFormData((prev) => ({ ...prev, excludeIngredients: e.target.value }))}
                placeholder="e.g., mushrooms, cilantro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="include">Must Include Ingredients</Label>
              <Input
                id="include"
                value={formData.includeIngredients}
                onChange={(e) => setFormData((prev) => ({ ...prev, includeIngredients: e.target.value }))}
                placeholder="e.g., chicken, spinach"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isGenerating || !formData.name} className="flex-1">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Meal Plan
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
