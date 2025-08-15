import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ShoppingCart,
  List,
  Zap,
  ChefHat,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { CreateListDialog } from "@/components/create-list-dialog";
import { format } from "date-fns";

export default async function GroceryListsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user's grocery lists
  const { data: groceryLists } = await supabase
    .from("grocery_lists")
    .select(
      `
      *,
      grocery_list_items(*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Get active meal plans for generating lists
  const { data: mealPlans } = await supabase
    .from("meal_plans")
    .select("id, name, start_date, end_date")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const hasLists = groceryLists && groceryLists.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Grocery Lists</h1>
          <p className="text-muted-foreground mt-2">
            Smart shopping lists generated from your meal plans
          </p>
        </div>
        <CreateListDialog userId={user.id} mealPlans={mealPlans || []}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create List
          </Button>
        </CreateListDialog>
      </div>

      {hasLists ? (
        <div className="grid gap-6">
          {groceryLists.map((list) => {
            const totalItems = list.grocery_list_items?.length || 0;
            const completedItems =
              list.grocery_list_items?.filter((item: any) => item.is_purchased)
                .length || 0;
            const progress =
              totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

            return (
              <Card key={list.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        {list.name}
                      </CardTitle>
                      {list.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {list.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          list.status === "active" ? "default" : "secondary"
                        }
                      >
                        {list.status}
                      </Badge>
                      {progress === 100 && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(list.created_at), "MMM dd, yyyy")}
                      </span>
                      <span>{totalItems} items</span>
                      <span>{completedItems} completed</span>
                    </div>
                    <div className="text-sm font-medium">
                      {progress.toFixed(0)}% complete
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {list.meal_plan_id && (
                        <Badge variant="outline">From Meal Plan</Badge>
                      )}
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/dashboard/grocery-lists/${list.id}`}>
                        View List
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <>
          {/* Empty State */}
          <Card>
            <CardContent className="text-center py-16">
              <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-2">
                No Grocery Lists Yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create meal plans to automatically generate smart grocery lists,
                or create custom lists manually.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <CreateListDialog userId={user.id} mealPlans={mealPlans || []}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Custom List
                  </Button>
                </CreateListDialog>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/meal-plans/create">
                    <ChefHat className="mr-2 h-4 w-4" />
                    Create Meal Plan First
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feature Preview Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Zap className="mr-2 h-5 w-5 text-primary" />
                  Auto-Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Grocery lists are automatically created from your meal plans
                  with exact quantities needed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <List className="mr-2 h-5 w-5 text-primary" />
                  Organized
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Items are organized by store sections (produce, dairy, meat)
                  for efficient shopping.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
                  Interactive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Check off items as you shop and track your progress through
                  the store.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
