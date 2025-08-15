"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, Calculator } from "lucide-react"
import { updateNutritionGoals } from "@/lib/actions"

interface NutritionGoalsProps {
  userId: string
  profile: any
}

export function NutritionGoals({ userId, profile }: NutritionGoalsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    dailyCalorieGoal: profile?.daily_calorie_goal || "",
    proteinGoal: profile?.protein_goal || "",
    carbGoal: profile?.carb_goal || "",
    fatGoal: profile?.fat_goal || "",
    fiberGoal: profile?.fiber_goal || "",
    waterGoal: profile?.water_goal || "",
    weightGoal: profile?.target_weight || "",
    goalType: profile?.goal_type || "maintain",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateNutritionGoals({
        userId,
        ...formData,
      })

      if (result.success) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Error updating nutrition goals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateCalories = () => {
    if (!profile?.age || !profile?.gender || !profile?.height || !profile?.weight) {
      alert("Please complete your profile information first to calculate recommended calories.")
      return
    }

    // Basic BMR calculation using Mifflin-St Jeor Equation
    let bmr: number
    const weight = Number.parseFloat(profile.weight) * 0.453592 // lbs to kg
    const height = Number.parseFloat(profile.height) * 2.54 // inches to cm
    const age = Number.parseInt(profile.age)

    if (profile.gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    }

    const tdee = bmr * (activityMultipliers[profile.activity_level as keyof typeof activityMultipliers] || 1.55)

    // Adjust based on goal
    let targetCalories = tdee
    if (formData.goalType === "lose") {
      targetCalories = tdee - 500 // 1 lb per week
    } else if (formData.goalType === "gain") {
      targetCalories = tdee + 500 // 1 lb per week
    }

    setFormData((prev) => ({
      ...prev,
      dailyCalorieGoal: Math.round(targetCalories).toString(),
      proteinGoal: Math.round((targetCalories * 0.3) / 4).toString(), // 30% of calories from protein
      carbGoal: Math.round((targetCalories * 0.4) / 4).toString(), // 40% from carbs
      fatGoal: Math.round((targetCalories * 0.3) / 9).toString(), // 30% from fat
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Goal Type</CardTitle>
          <CardDescription>What is your primary health goal?</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.goalType}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, goalType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lose">Lose Weight</SelectItem>
              <SelectItem value="maintain">Maintain Weight</SelectItem>
              <SelectItem value="gain">Gain Weight</SelectItem>
              <SelectItem value="muscle">Build Muscle</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Daily Nutrition Targets</h3>
            <p className="text-sm text-muted-foreground">Set your daily nutrition goals</p>
          </div>
          <Button type="button" variant="outline" onClick={calculateCalories}>
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Recommended
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calories">Daily Calories</Label>
            <Input
              id="calories"
              type="number"
              value={formData.dailyCalorieGoal}
              onChange={(e) => setFormData((prev) => ({ ...prev, dailyCalorieGoal: e.target.value }))}
              placeholder="2000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weightGoal">Target Weight (lbs)</Label>
            <Input
              id="weightGoal"
              type="number"
              step="0.1"
              value={formData.weightGoal}
              onChange={(e) => setFormData((prev) => ({ ...prev, weightGoal: e.target.value }))}
              placeholder="150"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="protein">Protein (g)</Label>
            <Input
              id="protein"
              type="number"
              value={formData.proteinGoal}
              onChange={(e) => setFormData((prev) => ({ ...prev, proteinGoal: e.target.value }))}
              placeholder="150"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input
              id="carbs"
              type="number"
              value={formData.carbGoal}
              onChange={(e) => setFormData((prev) => ({ ...prev, carbGoal: e.target.value }))}
              placeholder="200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat">Fat (g)</Label>
            <Input
              id="fat"
              type="number"
              value={formData.fatGoal}
              onChange={(e) => setFormData((prev) => ({ ...prev, fatGoal: e.target.value }))}
              placeholder="70"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fiber">Fiber (g)</Label>
            <Input
              id="fiber"
              type="number"
              value={formData.fiberGoal}
              onChange={(e) => setFormData((prev) => ({ ...prev, fiberGoal: e.target.value }))}
              placeholder="25"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="water">Water (oz)</Label>
            <Input
              id="water"
              type="number"
              value={formData.waterGoal}
              onChange={(e) => setFormData((prev) => ({ ...prev, waterGoal: e.target.value }))}
              placeholder="64"
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Goals
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
