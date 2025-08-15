"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { completeOnboarding } from "@/lib/actions"
import { useRouter } from "next/navigation"

const steps = ["Personal Info", "Lifestyle", "Goals", "Dietary Preferences", "Health Conditions"]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    age: "",
    gender: "",
    height: "",
    weight: "",
    // Step 2: Lifestyle
    activityLevel: "",
    sleepSchedule: "",
    workSchedule: "",
    // Step 3: Goals
    primaryGoal: "",
    targetWeight: "",
    timeline: "",
    // Step 4: Dietary Preferences
    dietType: "",
    allergies: [] as string[],
    dislikes: [] as string[],
    // Step 5: Health Conditions
    healthConditions: [] as string[],
    medications: "",
    wearableIntegration: false,
  })
  const router = useRouter()

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    try {
      await completeOnboarding(formData)
      router.push("/dashboard")
    } catch (error) {
      console.error("Onboarding failed:", error)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateFormData("age", e.target.value)}
                  placeholder="25"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => updateFormData("height", e.target.value)}
                  placeholder="170"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateFormData("weight", e.target.value)}
                  placeholder="70"
                />
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Activity Level</Label>
              <RadioGroup
                value={formData.activityLevel}
                onValueChange={(value) => updateFormData("activityLevel", value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sedentary" id="sedentary" />
                  <Label htmlFor="sedentary">Sedentary (little to no exercise)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Light (1-3 days/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderate (3-5 days/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active (6-7 days/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-active" id="very-active" />
                  <Label htmlFor="very-active">Very Active (2x/day or intense)</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="sleep">Sleep Schedule</Label>
              <Select value={formData.sleepSchedule} onValueChange={(value) => updateFormData("sleepSchedule", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sleep pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="early-bird">Early Bird (6-7 hours, early to bed)</SelectItem>
                  <SelectItem value="normal">Normal (7-8 hours, regular schedule)</SelectItem>
                  <SelectItem value="night-owl">Night Owl (6-7 hours, late to bed)</SelectItem>
                  <SelectItem value="irregular">Irregular (shift work/varying)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Primary Goal</Label>
              <RadioGroup
                value={formData.primaryGoal}
                onValueChange={(value) => updateFormData("primaryGoal", value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weight-loss" id="weight-loss" />
                  <Label htmlFor="weight-loss">Weight Loss</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="muscle-gain" id="muscle-gain" />
                  <Label htmlFor="muscle-gain">Muscle Gain</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wellness" id="wellness" />
                  <Label htmlFor="wellness">General Wellness</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="performance" id="performance" />
                  <Label htmlFor="performance">Athletic Performance</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maintenance" id="maintenance" />
                  <Label htmlFor="maintenance">Weight Maintenance</Label>
                </div>
              </RadioGroup>
            </div>
            {(formData.primaryGoal === "weight-loss" || formData.primaryGoal === "muscle-gain") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target-weight">Target Weight (kg)</Label>
                  <Input
                    id="target-weight"
                    type="number"
                    value={formData.targetWeight}
                    onChange={(e) => updateFormData("targetWeight", e.target.value)}
                    placeholder="65"
                  />
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Select value={formData.timeline} onValueChange={(value) => updateFormData("timeline", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-months">3 months</SelectItem>
                      <SelectItem value="6-months">6 months</SelectItem>
                      <SelectItem value="1-year">1 year</SelectItem>
                      <SelectItem value="no-rush">No rush</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="diet-type">Diet Type</Label>
              <Select value={formData.dietType} onValueChange={(value) => updateFormData("dietType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select diet preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="omnivore">Omnivore</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="pescatarian">Pescatarian</SelectItem>
                  <SelectItem value="keto">Ketogenic</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="low-carb">Low Carb</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-base font-medium">Allergies & Intolerances</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {["Nuts", "Dairy", "Gluten", "Shellfish", "Eggs", "Soy", "Fish", "Sesame"].map((allergy) => (
                  <div key={allergy} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergy}
                      checked={formData.allergies.includes(allergy)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData("allergies", [...formData.allergies, allergy])
                        } else {
                          updateFormData(
                            "allergies",
                            formData.allergies.filter((a) => a !== allergy),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={allergy}>{allergy}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Health Conditions (Optional)</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {[
                  "Diabetes",
                  "High Blood Pressure",
                  "High Cholesterol",
                  "Heart Disease",
                  "Thyroid Issues",
                  "PCOS",
                  "IBS",
                  "None",
                ].map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={formData.healthConditions.includes(condition)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData("healthConditions", [...formData.healthConditions, condition])
                        } else {
                          updateFormData(
                            "healthConditions",
                            formData.healthConditions.filter((c) => c !== condition),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={condition}>{condition}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="medications">Current Medications (Optional)</Label>
              <Input
                id="medications"
                value={formData.medications}
                onChange={(e) => updateFormData("medications", e.target.value)}
                placeholder="List any medications you're taking"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wearable"
                checked={formData.wearableIntegration}
                onCheckedChange={(checked) => updateFormData("wearableIntegration", checked)}
              />
              <Label htmlFor="wearable">Connect wearable devices (Apple Health, Google Fit, Fitbit)</Label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-emerald-dark mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Help us personalize your nutrition journey</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-emerald-dark">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">{steps[currentStep]}</span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{steps[currentStep]}</CardTitle>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleComplete}
              className="bg-emerald-dark hover:bg-emerald-dark/90 flex items-center gap-2"
            >
              Complete Setup
            </Button>
          ) : (
            <Button onClick={handleNext} className="bg-emerald-dark hover:bg-emerald-dark/90 flex items-center gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
