"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteMealPlan } from "@/lib/actions";
import { toast } from "sonner";

interface DeleteMealPlanButtonProps {
  mealPlanId: string;
  mealPlanName: string;
}

export function DeleteMealPlanButton({
  mealPlanId,
  mealPlanName,
}: DeleteMealPlanButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteMealPlan(mealPlanId);

      if (result.success) {
        toast.success("Meal plan deleted successfully");
        router.push("/dashboard/meal-plans");
      } else {
        toast.error(result.error || "Failed to delete meal plan");
      }
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Plan
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Meal Plan</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{mealPlanName}"? This action cannot
            be undone and will permanently remove the meal plan and all
            associated meals.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
