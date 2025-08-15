"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { format, parseISO } from "date-fns"

interface ProgressChartsProps {
  entries: any[]
  profile: any
}

export function ProgressCharts({ entries, profile }: ProgressChartsProps) {
  if (!entries || entries.length === 0) return null

  // Prepare data for charts (reverse to show chronological order)
  const chartData = entries
    .slice()
    .reverse()
    .map((entry) => ({
      date: entry.date,
      weight: entry.weight,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      formattedDate: format(parseISO(entry.date), "MMM dd"),
    }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weight Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value: any) => [`${value} lbs`, "Weight"]}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
              {profile?.target_weight && (
                <Line
                  type="monotone"
                  dataKey={() => profile.target_weight}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Calorie Intake Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Calories</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value: any) => [`${value} cal`, "Calories"]}
              />
              <Bar dataKey="calories" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Macronutrient Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Macronutrient Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value: any, name: string) => [`${value}g`, name.charAt(0).toUpperCase() + name.slice(1)]}
              />
              <Line type="monotone" dataKey="protein" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="carbs" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="fat" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{format(parseISO(entry.date), "MMM dd, yyyy")}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.weight && `${entry.weight} lbs`}
                    {entry.weight && entry.calories && " • "}
                    {entry.calories && `${entry.calories} cal`}
                  </p>
                </div>
                <div className="text-right">
                  {entry.notes && <p className="text-xs text-muted-foreground max-w-32 truncate">{entry.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
