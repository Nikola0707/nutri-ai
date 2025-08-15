"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { logProgressEntry } from "@/lib/actions"

interface LogEntryDialogProps {
  userId: string
  children: React.ReactNode
}

export function LogEntryDialog({ userId, children }: LogEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date(),
    weight: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    water: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await logProgressEntry({
        userId,
        ...formData,
      })

      if (result.success) {
        setOpen(false)
        setFormData({
          date: new Date(),
          weight: "",
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
          fiber: "",
          water: "",
          notes: "",
        })
        // Refresh the page to show new data
        window.location.reload()
      }
    } catch (error) {
      console.error("Error logging entry:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Progress Entry</DialogTitle>
          <DialogDescription>Record your daily nutrition and health metrics</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData((prev) => ({ ...prev, date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                placeholder="150.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData((prev) => ({ ...prev, calories: e.target.value }))}
                placeholder="2000"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={formData.protein}
                onChange={(e) => setFormData((prev) => ({ ...prev, protein: e.target.value }))}
                placeholder="150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={formData.carbs}
                onChange={(e) => setFormData((prev) => ({ ...prev, carbs: e.target.value }))}
                placeholder="200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                value={formData.fat}
                onChange={(e) => setFormData((prev) => ({ ...prev, fat: e.target.value }))}
                placeholder="70"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fiber">Fiber (g)</Label>
              <Input
                id="fiber"
                type="number"
                value={formData.fiber}
                onChange={(e) => setFormData((prev) => ({ ...prev, fiber: e.target.value }))}
                placeholder="25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="water">Water (oz)</Label>
              <Input
                id="water"
                type="number"
                value={formData.water}
                onChange={(e) => setFormData((prev) => ({ ...prev, water: e.target.value }))}
                placeholder="64"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="How are you feeling today? Any observations..."
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
                  Saving...
                </>
              ) : (
                "Save Entry"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
