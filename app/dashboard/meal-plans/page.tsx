import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChefHat, Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { DeleteMealPlanButton } from "@/components/delete-meal-plan-button";

export default async function MealPlansPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user's meal plans
  const { data: mealPlans } = await supabase
    .from("meal_plans")
    .select(
      `
      *,
      meals(*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const hasMealPlans = mealPlans && mealPlans.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meal Plans</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your AI-powered meal plans
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/meal-plans/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Meal Plan
          </Link>
        </Button>
      </div>

      {hasMealPlans ? (
        <div className="grid gap-6">
          {mealPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="h-5 w-5" />
                      {plan.name}
                    </CardTitle>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={plan.status === "active" ? "default" : "secondary"}
                  >
                    {plan.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(plan.start_date), "MMM dd")} -{" "}
                      {format(new Date(plan.end_date), "MMM dd")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {plan.total_days} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {plan.meals_per_day} meals/day
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {plan.target_calories && (
                      <Badge variant="outline">
                        {plan.target_calories} cal/day
                      </Badge>
                    )}
                    {plan.dietary_restrictions &&
                      plan.dietary_restrictions.length > 0 && (
                        <Badge variant="outline">
                          {plan.dietary_restrictions.length} restrictions
                        </Badge>
                      )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/meal-plans/${plan.id}`}>
                        View Plan
                      </Link>
                    </Button>
                    <DeleteMealPlanButton
                      mealPlanId={plan.id}
                      mealPlanName={plan.name}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Empty State */}
          <Card>
            <CardContent className="text-center py-16">
              <ChefHat className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-2">No Meal Plans Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first AI-powered meal plan tailored to your dietary
                preferences and health goals.
              </p>
              <Button asChild>
                <Link href="/dashboard/meal-plans/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Meal Plan
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Feature Preview Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <ChefHat className="mr-2 h-5 w-5 text-primary" />
                  AI-Powered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI creates personalized meal plans based on your
                  preferences, dietary restrictions, and health goals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Weekly Planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get complete weekly meal plans with breakfast, lunch, dinner,
                  and snack recommendations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="mr-2 h-5 w-5 text-primary" />
                  Time Efficient
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Meal plans include prep times, cooking instructions, and
                  shopping lists for easy execution.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
