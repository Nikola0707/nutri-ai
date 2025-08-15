"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ProgressStatsProps {
  entries: any[]
  profile: any
}

export function ProgressStats({ entries, profile }: ProgressStatsProps) {
  if (!entries || entries.length === 0) return null

  const latestEntry = entries[0]
  const previousEntry = entries[1]

  // Calculate trends
  const weightTrend = previousEntry ? latestEntry.weight - previousEntry.weight : 0

  const calorieTrend = previousEntry ? latestEntry.calories - previousEntry.calories : 0

  // Calculate averages for the last 7 days
  const last7Days = entries.slice(0, 7)
  const avgWeight = last7Days.reduce((sum, entry) => sum + (entry.weight || 0), 0) / last7Days.length
  const avgCalories = last7Days.reduce((sum, entry) => sum + (entry.calories || 0), 0) / last7Days.length

  const stats = [
    {
      title: "Current Weight",
      value: latestEntry.weight ? `${latestEntry.weight} lbs` : "Not logged",
      trend: weightTrend,
      target: profile?.target_weight ? `Target: ${profile.target_weight} lbs` : null,
    },
    {
      title: "Latest Calories",
      value: latestEntry.calories ? `${latestEntry.calories} cal` : "Not logged",
      trend: calorieTrend,
      target: profile?.daily_calorie_goal ? `Goal: ${profile.daily_calorie_goal} cal` : null,
    },
    {
      title: "7-Day Avg Weight",
      value: avgWeight > 0 ? `${avgWeight.toFixed(1)} lbs` : "No data",
      trend: null,
      target: null,
    },
    {
      title: "7-Day Avg Calories",
      value: avgCalories > 0 ? `${Math.round(avgCalories)} cal` : "No data",
      trend: null,
      target: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.trend !== null && stat.trend !== 0 && (
              <div className="flex items-center">
                {stat.trend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.trend !== null && stat.trend !== 0 && (
              <p className={`text-xs ${stat.trend > 0 ? "text-green-600" : "text-red-600"}`}>
                {stat.trend > 0 ? "+" : ""}
                {stat.trend.toFixed(1)} from last entry
              </p>
            )}
            {stat.target && <p className="text-xs text-muted-foreground mt-1">{stat.target}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
