"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save } from "lucide-react"
import { updateProfile } from "@/lib/actions"

interface ProfileSettingsProps {
  user: any
  profile: any
}

const DIETARY_RESTRICTIONS = [
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

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (little/no exercise)" },
  { value: "lightly_active", label: "Lightly Active (light exercise 1-3 days/week)" },
  { value: "moderately_active", label: "Moderately Active (moderate exercise 3-5 days/week)" },
  { value: "very_active", label: "Very Active (hard exercise 6-7 days/week)" },
  { value: "extremely_active", label: "Extremely Active (very hard exercise, physical job)" },
]

export function ProfileSettings({ user, profile }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || user?.user_metadata?.full_name || "",
    age: profile?.age || "",
    gender: profile?.gender || "",
    height: profile?.height || "",
    weight: profile?.weight || "",
    activityLevel: profile?.activity_level || "moderately_active",
    dietaryRestrictions: profile?.dietary_restrictions || [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateProfile({
        userId: user.id,
        ...formData,
      })

      if (result.success) {
        // Show success message or refresh
        window.location.reload()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDietaryRestriction = (restriction: string) => {
    setFormData((prev) => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter((r) => r !== restriction)
        : [...prev.dietaryRestrictions, restriction],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder="Enter your full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
            placeholder="Enter your age"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (inches)</Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => setFormData((prev) => ({ ...prev, height: e.target.value }))}
            placeholder="e.g., 70"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
            placeholder="e.g., 150"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activityLevel">Activity Level</Label>
        <Select
          value={formData.activityLevel}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, activityLevel: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Dietary Restrictions</Label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_RESTRICTIONS.map((restriction) => (
            <Badge
              key={restriction}
              variant={formData.dietaryRestrictions.includes(restriction) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleDietaryRestriction(restriction)}
            >
              {restriction}
            </Badge>
          ))}
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
            Save Profile
          </>
        )}
      </Button>
    </form>
  )
}
