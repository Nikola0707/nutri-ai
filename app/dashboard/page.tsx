import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Utensils,
  Target,
  TrendingUp,
  Calendar,
  Plus,
  ChefHat,
  ShoppingCart,
  Activity,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  // Get user preferences
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  // Get active meal plan
  const { data: activeMealPlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", user?.id)
    .eq("is_active", true)
    .single();

  // Get today's nutrition log
  const today = new Date().toISOString().split("T")[0];
  const { data: todayNutrition } = await supabase
    .from("nutrition_logs")
    .select("*")
    .eq("user_id", user?.id)
    .eq("log_date", today);

  // Calculate today's totals
  const todayTotals = todayNutrition?.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ) || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const targetCalories = preferences?.target_calories || 2000;
  const calorieProgress = Math.min(
    (todayTotals.calories / targetCalories) * 100,
    100
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || user?.email?.split("@")[0]}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your nutrition overview for today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Calories
            </CardTitle>
            <Target className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTotals.calories}</div>
            <div className="text-xs text-gray-600 mb-2">
              of {targetCalories} target
            </div>
            <Progress value={calorieProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protein</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTotals.protein}g</div>
            <div className="text-xs text-gray-600">
              of {preferences?.target_protein || 150}g target
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbs</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTotals.carbs}g</div>
            <div className="text-xs text-gray-600">
              of {preferences?.target_carbs || 250}g target
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fat</CardTitle>
            <Utensils className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTotals.fat}g</div>
            <div className="text-xs text-gray-600">
              of {preferences?.target_fat || 65}g target
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Meal Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChefHat className="mr-2 h-5 w-5 text-emerald-600" />
              Current Meal Plan
            </CardTitle>
            <CardDescription>Your active nutrition plan</CardDescription>
          </CardHeader>
          <CardContent>
            {activeMealPlan ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {activeMealPlan.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {activeMealPlan.description}
                  </p>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Duration:</span>
                  <span>
                    {new Date(activeMealPlan.start_date).toLocaleDateString()} -{" "}
                    {new Date(activeMealPlan.end_date).toLocaleDateString()}
                  </span>
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard/meal-plans">View Details</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <ChefHat className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Active Meal Plan
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first AI-powered meal plan to get started
                </p>
                <Button asChild>
                  <Link href="/dashboard/meal-plans">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Meal Plan
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-emerald-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks to manage your nutrition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                asChild
                variant="outline"
                className="h-20 flex-col bg-transparent"
              >
                <Link href="/dashboard/meal-plans">
                  <Utensils className="h-6 w-6 mb-2" />
                  <span className="text-sm">Meal Plans</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-20 flex-col bg-transparent"
              >
                <Link href="/dashboard/grocery-lists">
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  <span className="text-sm">Grocery List</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-20 flex-col bg-transparent"
              >
                <Link href="/dashboard/progress">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span className="text-sm">Track Progress</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-20 flex-col bg-transparent"
              >
                <Link href="/dashboard/chat">
                  <Activity className="h-6 w-6 mb-2" />
                  <span className="text-sm">AI Chat</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Reminder */}
      {!preferences && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-emerald-800">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-emerald-700">
              Set up your preferences to get personalized meal plans and
              nutrition recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/dashboard/settings">Complete Setup</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
