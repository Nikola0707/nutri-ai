import { createServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DeleteMealPlanButton } from "@/components/delete-meal-plan-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  Users,
  ChefHat,
} from "lucide-react";
import Link from "next/link";

interface Meal {
  id: string;
  name: string;
  description: string | null;
  meal_type: string;
  day_number: number;
  servings: number;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  prep_time: number | null;
  cook_time: number | null;
  recipe_id: string | null;
}

interface MealPlanPageProps {
  params: {
    id: string;
  };
}

export default async function MealPlanPage({ params }: MealPlanPageProps) {
  const supabase = await createServerClient();
  const { id } = await params;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get meal plan details
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!mealPlan) {
    notFound();
  }

  // Get meals for this plan
  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .eq("meal_plan_id", id)
    .order("day_number", { ascending: true })
    .order("meal_type", { ascending: true });

  // Group meals by day
  const mealsByDay =
    meals?.reduce((acc, meal) => {
      if (!acc[meal.day_number]) {
        acc[meal.day_number] = [];
      }
      acc[meal.day_number].push(meal);
      return acc;
    }, {} as Record<number, Meal[]>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/meal-plans">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meal Plans
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{mealPlan.name}</CardTitle>
                {mealPlan.description && (
                  <CardDescription className="mt-2">
                    {mealPlan.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    mealPlan.status === "active" ? "default" : "secondary"
                  }
                >
                  {mealPlan.status}
                </Badge>
                <DeleteMealPlanButton
                  mealPlanId={mealPlan.id}
                  mealPlanName={mealPlan.name}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {mealPlan.total_days} Days
                  </p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {mealPlan.meals_per_day} Meals
                  </p>
                  <p className="text-xs text-muted-foreground">Per Day</p>
                </div>
              </div>
              {mealPlan.target_calories && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {mealPlan.target_calories} cal
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Daily Target
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {meals?.length || 0} Meals
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>

            {mealPlan.dietary_restrictions &&
              mealPlan.dietary_restrictions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">
                    Dietary Restrictions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {mealPlan.dietary_restrictions.map(
                      (restriction: string) => (
                        <Badge key={restriction} variant="outline">
                          {restriction}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {Object.entries(mealsByDay).map(([day, dayMeals]) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="text-lg">Day {day}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(dayMeals as Meal[]).map((meal: Meal, index: number) => (
                    <div key={index}>
                      {meal.recipe_id ? (
                        <Link
                          href={`/dashboard/recipes/${meal.recipe_id}`}
                          className="block"
                        >
                          <Card className="border-l-4 border-l-primary/20 cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="capitalize">
                                  {meal.meal_type}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  {meal.servings}
                                </div>
                              </div>
                              <CardTitle className="text-base">
                                {meal.name}
                              </CardTitle>
                              {meal.description && (
                                <CardDescription className="text-xs">
                                  {meal.description}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="font-medium">
                                    {meal.calories}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {" "}
                                    cal
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {meal.protein}g
                                  </span>
                                  <span className="text-muted-foreground">
                                    {" "}
                                    protein
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {meal.carbs}g
                                  </span>
                                  <span className="text-muted-foreground">
                                    {" "}
                                    carbs
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    {meal.fat}g
                                  </span>
                                  <span className="text-muted-foreground">
                                    {" "}
                                    fat
                                  </span>
                                </div>
                              </div>

                              <Separator />

                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Prep:
                                  </span>
                                  <span>{meal.prep_time} min</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Cook:
                                  </span>
                                  <span>{meal.cook_time} min</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ) : (
                        <Card className="border-l-4 border-l-primary/20">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="capitalize">
                                {meal.meal_type}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {meal.servings}
                              </div>
                            </div>
                            <CardTitle className="text-base">
                              {meal.name}
                            </CardTitle>
                            {meal.description && (
                              <CardDescription className="text-xs">
                                {meal.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0 space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-medium">
                                  {meal.calories}
                                </span>
                                <span className="text-muted-foreground">
                                  {" "}
                                  cal
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">
                                  {meal.protein}g
                                </span>
                                <span className="text-muted-foreground">
                                  {" "}
                                  protein
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">
                                  {meal.carbs}g
                                </span>
                                <span className="text-muted-foreground">
                                  {" "}
                                  carbs
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">{meal.fat}g</span>
                                <span className="text-muted-foreground">
                                  {" "}
                                  fat
                                </span>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Prep:
                                </span>
                                <span>{meal.prep_time} min</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Cook:
                                </span>
                                <span>{meal.cook_time} min</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
