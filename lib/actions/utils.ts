/**
 * Shared utilities for server actions
 */

// Helper function to calculate nutrition goals
export function calculateNutritionGoals(profile: {
  age: number;
  gender: string;
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
  targetWeight: number | null;
}) {
  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr: number;
  if (profile.gender === "male") {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    "very-active": 1.9,
  };

  const multiplier =
    activityMultipliers[
      profile.activityLevel as keyof typeof activityMultipliers
    ] || 1.2;
  const tdee = bmr * multiplier;

  // Adjust calories based on goal
  let calories = tdee;
  if (profile.goal === "weight-loss") {
    calories = tdee - 500; // 1 lb per week deficit
  } else if (profile.goal === "muscle-gain") {
    calories = tdee + 300; // Moderate surplus
  }

  // Calculate macros (40% carbs, 30% protein, 30% fat for balanced approach)
  const protein = Math.round((calories * 0.3) / 4); // 4 calories per gram
  const carbs = Math.round((calories * 0.4) / 4); // 4 calories per gram
  const fat = Math.round((calories * 0.3) / 9); // 9 calories per gram

  // Fiber and water goals
  const fiber = Math.round(profile.weight * 0.5); // 0.5g per kg body weight
  const water = Math.round(profile.weight * 0.035); // 35ml per kg body weight

  return {
    calories: Math.round(calories),
    protein,
    carbs,
    fat,
    fiber,
    water,
  };
}

// Helper function to get meal type by index
export function getMealType(index: number): string {
  const types = ["breakfast", "lunch", "dinner", "snack", "snack"];
  return types[index] || "snack";
}

// Helper function to categorize ingredients
export function categorizeIngredient(ingredient: string): string {
  const lower = ingredient.toLowerCase();

  if (
    lower.includes("chicken") ||
    lower.includes("beef") ||
    lower.includes("fish") ||
    lower.includes("salmon")
  ) {
    return "Meat & Seafood";
  }
  if (
    lower.includes("milk") ||
    lower.includes("cheese") ||
    lower.includes("yogurt") ||
    lower.includes("butter")
  ) {
    return "Dairy";
  }
  if (
    lower.includes("apple") ||
    lower.includes("banana") ||
    lower.includes("tomato") ||
    lower.includes("lettuce") ||
    lower.includes("spinach")
  ) {
    return "Produce";
  }
  if (
    lower.includes("bread") ||
    lower.includes("bagel") ||
    lower.includes("muffin")
  ) {
    return "Bakery";
  }
  if (lower.includes("frozen")) {
    return "Frozen";
  }

  return "Pantry";
}

// Fallback meals if API is unavailable
export function getFallbackMeals(data: any) {
  const fallbackMeals = [
    {
      name: "Avocado Toast with Eggs",
      description:
        "Whole grain toast topped with mashed avocado and poached eggs",
      ingredients: [
        "2 slices whole grain bread",
        "1 ripe avocado",
        "2 eggs",
        "Salt",
        "Pepper",
        "Lemon juice",
      ],
      instructions: [
        "Toast bread",
        "Mash avocado with lemon juice",
        "Poach eggs",
        "Assemble and season",
      ],
      prep_time: 5,
      cook_time: 10,
      servings: 1,
      calories: 420,
      protein: 18,
      carbs: 32,
      fat: 26,
      fiber: 12,
    },
    {
      name: "Grilled Chicken Salad",
      description: "Mixed greens with grilled chicken breast and vegetables",
      ingredients: [
        "6oz chicken breast",
        "Mixed greens",
        "Cherry tomatoes",
        "Cucumber",
        "Olive oil",
        "Balsamic vinegar",
      ],
      instructions: [
        "Grill chicken",
        "Prepare vegetables",
        "Mix salad",
        "Add dressing",
      ],
      prep_time: 10,
      cook_time: 15,
      servings: 1,
      calories: 380,
      protein: 42,
      carbs: 12,
      fat: 16,
      fiber: 6,
    },
    {
      name: "Salmon with Quinoa",
      description:
        "Baked salmon fillet served with quinoa and steamed vegetables",
      ingredients: [
        "6oz salmon fillet",
        "1 cup quinoa",
        "Broccoli",
        "Carrots",
        "Olive oil",
        "Herbs",
      ],
      instructions: [
        "Bake salmon",
        "Cook quinoa",
        "Steam vegetables",
        "Season and serve",
      ],
      prep_time: 10,
      cook_time: 25,
      servings: 1,
      calories: 520,
      protein: 38,
      carbs: 45,
      fat: 22,
      fiber: 8,
    },
  ];

  const shuffled = [...fallbackMeals].sort(() => Math.random() - 0.5);
  const mealsNeeded = Math.min(
    Number.parseInt(data.mealsPerDay),
    shuffled.length
  );
  return shuffled.slice(0, mealsNeeded);
}
