import { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { GroceryListView } from "@/components/grocery-list-view";

interface GroceryListPageProps {
  params: {
    id: string;
  };
}

export default async function GroceryListPage({
  params,
}: GroceryListPageProps) {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get grocery list details
  const { data: groceryList } = await supabase
    .from("grocery_lists")
    .select(
      `
      *,
      grocery_list_items(*),
      meal_plans(name)
    `
    )
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!groceryList) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/grocery-lists">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lists
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <ShoppingCart className="h-6 w-6" />
                  {groceryList.name}
                </CardTitle>
                {groceryList.description && (
                  <p className="text-muted-foreground mt-2">
                    {groceryList.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    groceryList.status === "active" ? "default" : "secondary"
                  }
                >
                  {groceryList.status}
                </Badge>
                {groceryList.meal_plans && (
                  <Badge variant="outline">
                    From: {groceryList.meal_plans.name}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Suspense fallback={<div>Loading grocery list...</div>}>
          <GroceryListView groceryList={groceryList} userId={user.id} />
        </Suspense>
      </div>
    </div>
  );
}
