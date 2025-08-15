"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { updateNotificationSettings } from "@/lib/actions"

interface NotificationSettingsProps {
  userId: string
  preferences: any
}

export function NotificationSettings({ userId, preferences }: NotificationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    mealReminders: preferences?.meal_reminders ?? true,
    progressReminders: preferences?.progress_reminders ?? true,
    weeklyReports: preferences?.weekly_reports ?? true,
    mealPlanUpdates: preferences?.meal_plan_updates ?? true,
    reminderTime: preferences?.reminder_time || "08:00",
    emailNotifications: preferences?.email_notifications ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateNotificationSettings({
        userId,
        ...settings,
      })

      if (result.success) {
        // Show success message
        alert("Notification settings updated successfully!")
      }
    } catch (error) {
      console.error("Error updating notification settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Meal Reminders</Label>
            <p className="text-sm text-muted-foreground">Get reminded about your planned meals</p>
          </div>
          <Switch
            checked={settings.mealReminders}
            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, mealReminders: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Progress Reminders</Label>
            <p className="text-sm text-muted-foreground">Daily reminders to log your progress</p>
          </div>
          <Switch
            checked={settings.progressReminders}
            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, progressReminders: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Weekly Reports</Label>
            <p className="text-sm text-muted-foreground">Weekly summary of your nutrition progress</p>
          </div>
          <Switch
            checked={settings.weeklyReports}
            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, weeklyReports: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Meal Plan Updates</Label>
            <p className="text-sm text-muted-foreground">Notifications about new meal plans and recipes</p>
          </div>
          <Switch
            checked={settings.mealPlanUpdates}
            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, mealPlanUpdates: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
          </div>
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailNotifications: checked }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminderTime">Daily Reminder Time</Label>
        <Select
          value={settings.reminderTime}
          onValueChange={(value) => setSettings((prev) => ({ ...prev, reminderTime: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="06:00">6:00 AM</SelectItem>
            <SelectItem value="07:00">7:00 AM</SelectItem>
            <SelectItem value="08:00">8:00 AM</SelectItem>
            <SelectItem value="09:00">9:00 AM</SelectItem>
            <SelectItem value="10:00">10:00 AM</SelectItem>
            <SelectItem value="18:00">6:00 PM</SelectItem>
            <SelectItem value="19:00">7:00 PM</SelectItem>
            <SelectItem value="20:00">8:00 PM</SelectItem>
          </SelectContent>
        </Select>
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
            Save Settings
          </>
        )}
      </Button>
    </form>
  )
}
