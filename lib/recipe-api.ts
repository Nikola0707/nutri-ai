// TheMealDB API types
export interface MealDBRecipe {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate?: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string;
  strYoutube?: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strIngredient16?: string;
  strIngredient17?: string;
  strIngredient18?: string;
  strIngredient19?: string;
  strIngredient20?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strMeasure16?: string;
  strMeasure17?: string;
  strMeasure18?: string;
  strMeasure19?: string;
  strMeasure20?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  servings: number | null;
  difficulty: string | null;
  cuisine_type: string | null;
  dietary_tags: string[] | null;
  calories_per_serving: number | null;
  protein_per_serving: number | null;
  carbs_per_serving: number | null;
  fat_per_serving: number | null;
  fiber_per_serving: number | null;
  sugar_per_serving: number | null;
  sodium_per_serving: number | null;
  ingredients: Array<{
    id: string;
    ingredient_name: string;
    amount: number | null;
    unit: string | null;
    notes: string | null;
    order_index: number;
  }>;
  instructions: Array<{
    id: string;
    step_number: number;
    instruction: string;
    time_minutes: number | null;
    temperature: number | null;
    image_url: string | null;
  }>;
  average_rating: number;
  total_ratings: number;
}

const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// Convert MealDB recipe to our Recipe format
function convertMealDBRecipe(meal: MealDBRecipe): Recipe {
  // Extract ingredients and measurements
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[
      `strIngredient${i}` as keyof MealDBRecipe
    ] as string;
    const measure = meal[`strMeasure${i}` as keyof MealDBRecipe] as string;

    if (ingredient && ingredient.trim()) {
      let amount: number | null = null;
      let unit: string | null = null;

      if (measure && measure.trim()) {
        const measureTrimmed = measure.trim();

        // Parse numeric amounts from measurements
        const numericMatch = measureTrimmed.match(
          /^(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)/
        );
        if (numericMatch) {
          const numericPart = numericMatch[1];
          // Handle fractions like "1/2"
          if (numericPart.includes("/")) {
            const [numerator, denominator] = numericPart
              .split("/")
              .map((n) => Number.parseFloat(n.trim()));
            amount = numerator / denominator;
          } else {
            amount = Number.parseFloat(numericPart);
          }

          // Extract unit (everything after the number)
          unit = measureTrimmed.replace(numericMatch[0], "").trim() || null;
        } else {
          // For non-numeric measurements like "to taste", "pinch"
          amount = null;
          unit = measureTrimmed;
        }
      }

      ingredients.push({
        id: `${meal.idMeal}-ingredient-${i}`,
        ingredient_name: ingredient.trim(),
        amount: amount,
        unit: unit,
        notes: null,
        order_index: i,
      });
    }
  }

  // Convert instructions to steps
  const instructions = meal.strInstructions
    ? meal.strInstructions
        .split(/\r?\n/)
        .filter((step) => step.trim())
        .map((instruction, index) => ({
          id: `${meal.idMeal}-step-${index + 1}`,
          step_number: index + 1,
          instruction: instruction.trim(),
          time_minutes: null,
          temperature: null,
          image_url: null,
        }))
    : [];

  // Estimate difficulty based on number of ingredients and instructions
  const totalComplexity = ingredients.length + instructions.length;
  let difficulty = "easy";
  if (totalComplexity > 15) difficulty = "hard";
  else if (totalComplexity > 8) difficulty = "medium";

  // Generate estimated nutrition (since MealDB doesn't provide this)
  const estimatedCalories = Math.floor(200 + Math.random() * 400);

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    description: `Delicious ${
      meal.strArea
    } ${meal.strCategory.toLowerCase()} recipe`,
    image_url: meal.strMealThumb,
    prep_time: Math.floor(10 + Math.random() * 20),
    cook_time: Math.floor(15 + Math.random() * 45),
    total_time: null,
    servings: 4,
    difficulty,
    cuisine_type: meal.strArea,
    dietary_tags: meal.strTags
      ? meal.strTags.split(",").map((tag) => tag.trim())
      : null,
    calories_per_serving: estimatedCalories,
    protein_per_serving: Math.floor((estimatedCalories * 0.15) / 4),
    carbs_per_serving: Math.floor((estimatedCalories * 0.55) / 4),
    fat_per_serving: Math.floor((estimatedCalories * 0.3) / 9),
    fiber_per_serving: Math.floor(5 + Math.random() * 10),
    sugar_per_serving: Math.floor(10 + Math.random() * 20),
    sodium_per_serving: Math.floor(200 + Math.random() * 800),
    ingredients,
    instructions,
    average_rating: 4 + Math.random(),
    total_ratings: Math.floor(50 + Math.random() * 200),
  };
}

export async function searchRecipes(
  query?: string,
  category?: string
): Promise<Recipe[]> {
  try {
    let url = `${MEALDB_BASE_URL}/search.php?s=${query || ""}`;

    if (category && category !== "all") {
      url = `${MEALDB_BASE_URL}/filter.php?c=${category}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!data.meals) return [];

    return data.meals.map(convertMealDBRecipe);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const response = await fetch(`${MEALDB_BASE_URL}/lookup.php?i=${id}`);
    const data = await response.json();

    if (!data.meals || !data.meals[0]) return null;

    return convertMealDBRecipe(data.meals[0]);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
}

export async function getRecipeCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${MEALDB_BASE_URL}/categories.php`);
    const data = await response.json();

    if (!data.categories) return [];

    return data.categories.map((cat: any) => cat.strCategory);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getRandomRecipes(count = 12): Promise<Recipe[]> {
  try {
    const recipes = [];

    // Fetch random recipes
    for (let i = 0; i < count; i++) {
      const response = await fetch(`${MEALDB_BASE_URL}/random.php`);
      const data = await response.json();

      if (data.meals && data.meals[0]) {
        recipes.push(convertMealDBRecipe(data.meals[0]));
      }
    }

    return recipes;
  } catch (error) {
    console.error("Error fetching random recipes:", error);
    return [];
  }
}
