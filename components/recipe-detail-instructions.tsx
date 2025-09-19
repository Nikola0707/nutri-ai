"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface Instruction {
  id: string
  step_number: number
  instruction: string
  time_minutes: number | null
  temperature: number | null
  image_url: string | null
}

interface RecipeDetailInstructionsProps {
  instructions: Instruction[]
}

export function RecipeDetailInstructions({ instructions }: RecipeDetailInstructionsProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const toggleStepCompletion = (stepNumber: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber)
      } else {
        newSet.add(stepNumber)
      }
      return newSet
    })
  }

  const completedCount = completedSteps.size
  const totalSteps = instructions.length
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cooking Instructions</CardTitle>
          {totalSteps > 0 && (
            <div className="text-sm text-gray-600">
              {completedCount}/{totalSteps} completed ({Math.round(progress)}%)
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {instructions
            .sort((a, b) => a.step_number - b.step_number)
            .map((instruction) => {
              const isCompleted = completedSteps.has(instruction.step_number)
              
              return (
                <div
                  key={instruction.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border ${
                    isCompleted 
                      ? "bg-green-50 border-green-200" 
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStepCompletion(instruction.step_number)}
                    className={`p-1 h-8 w-8 rounded-full ${
                      isCompleted 
                        ? "bg-green-100 text-green-600 hover:bg-green-200" 
                        : "bg-white text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <Check size={16} />
                  </Button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Step {instruction.step_number}
                      </span>
                      {instruction.time_minutes && (
                        <span className="text-xs text-gray-500">
                          {instruction.time_minutes} min
                        </span>
                      )}
                      {instruction.temperature && (
                        <span className="text-xs text-gray-500">
                          {instruction.temperature}°F
                        </span>
                      )}
                    </div>
                    <p className={`text-gray-700 ${
                      isCompleted ? "line-through opacity-60" : ""
                    }`}>
                      {instruction.instruction}
                    </p>
                    {instruction.image_url && (
                      <img
                        src={instruction.image_url}
                        alt={`Step ${instruction.step_number}`}
                        className="mt-2 rounded-lg max-w-xs"
                      />
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )
}
