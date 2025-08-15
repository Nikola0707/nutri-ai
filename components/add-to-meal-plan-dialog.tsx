"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { addRecipeToMealPlan } from "@/lib/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Recipe {
  id: string
  title: string
  servings: number | null
}

interface MealPlan {
  id: string
  name: string
  total_days: number
}

interface AddToMealPlanDialogProps {
  recipe: Recipe
  open: boolean
  onOpenChange: (open: boolean) => void
  servings: number
}

export function AddToMealPlanDialog({ recipe, open, onOpenChange, servings }: AddToMealPlanDialogProps) {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [selectedMealPlan, setSelectedMealPlan] = useState("")
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedMealType, setSelectedMealType] = useState("")
  const [adjustedServings, setAdjustedServings] = useState(servings)
  const [loading, setLoading] = useState(false)
  const [loadingMealPlans, setLoadingMealPlans] = useState(true)

  useEffect(() => {
    if (open) {
      fetchMealPlans()
    }
  }, [open])

  const fetchMealPlans = async () => {
    try {
      setLoadingMealPlans(true)
      // This would need to be implemented as a client-side fetch to an API route
      // For now, we'll use a placeholder
      const response = await fetch("/api/meal-plans")
      if (response.ok) {
        const data = await response.json()
        setMealPlans(data.mealPlans || [])
      }
    } catch (error) {
      console.error("Error fetching meal plans:", error)
      toast.error("Failed to load meal plans")
    } finally {
      setLoadingMealPlans(false)
    }
  }

  const handleAddToMealPlan = async () => {
    if (!selectedMealPlan || !selectedDay || !selectedMealType) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      const result = await addRecipeToMealPlan({
        recipeId: recipe.id,
        mealPlanId: selectedMealPlan,
        dayNumber: Number.parseInt(selectedDay),
        mealType: selectedMealType,
        servings: adjustedServings,
      })

      if (result.success) {
        toast.success("Recipe added to meal plan!")
        onOpenChange(false)
        // Reset form
        setSelectedMealPlan("")
        setSelectedDay("")
        setSelectedMealType("")
        setAdjustedServings(servings)
      } else {
        toast.error(result.error || "Failed to add recipe to meal plan")
      }
    } catch (error) {
      toast.error("Failed to add recipe to meal plan")
    } finally {
      setLoading(false)
    }
  }

  const selectedMealPlanData = mealPlans.find((mp) => mp.id === selectedMealPlan)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Meal Plan</DialogTitle>
          <DialogDescription>Add "{recipe.title}" to one of your meal plans</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loadingMealPlans ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="meal-plan">Meal Plan</Label>
                <Select value={selectedMealPlan} onValueChange={setSelectedMealPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a meal plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMealPlanData && (
                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: selectedMealPlanData.total_days }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          Day {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="meal-type">Meal Type</Label>
                <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={adjustedServings}
                  onChange={(e) => setAdjustedServings(Number.parseInt(e.target.value) || 1)}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleAddToMealPlan}
            disabled={loading || !selectedMealPlan || !selectedDay || !selectedMealType}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to Plan"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
