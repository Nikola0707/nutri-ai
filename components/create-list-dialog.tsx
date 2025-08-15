"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, ShoppingCart, ChefHat } from "lucide-react"
import { createGroceryList } from "@/lib/actions"

interface CreateListDialogProps {
  userId: string
  mealPlans: any[]
  children: React.ReactNode
}

export function CreateListDialog({ userId, mealPlans, children }: CreateListDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [listType, setListType] = useState<"custom" | "meal-plan">("custom")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mealPlanId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await createGroceryList({
        userId,
        name: formData.name,
        description: formData.description,
        mealPlanId: listType === "meal-plan" ? formData.mealPlanId : null,
        type: listType,
      })

      if (result.success) {
        setOpen(false)
        setFormData({ name: "", description: "", mealPlanId: "" })
        setListType("custom")
        // Refresh the page to show new list
        window.location.reload()
      }
    } catch (error) {
      console.error("Error creating grocery list:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Grocery List</DialogTitle>
          <DialogDescription>Create a new shopping list for your groceries</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>List Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={listType === "custom" ? "default" : "outline"}
                onClick={() => setListType("custom")}
                className="justify-start"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Custom List
              </Button>
              <Button
                type="button"
                variant={listType === "meal-plan" ? "default" : "outline"}
                onClick={() => setListType("meal-plan")}
                className="justify-start"
                disabled={!mealPlans || mealPlans.length === 0}
              >
                <ChefHat className="mr-2 h-4 w-4" />
                From Meal Plan
              </Button>
            </div>
          </div>

          {listType === "meal-plan" && mealPlans && mealPlans.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="mealPlan">Select Meal Plan</Label>
              <Select
                value={formData.mealPlanId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, mealPlanId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a meal plan" />
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
          )}

          <div className="space-y-2">
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={listType === "meal-plan" ? "Weekly Groceries" : "e.g., Weekly Shopping, Party Supplies"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Add any notes about this shopping list..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create List"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
