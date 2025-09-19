/**
 * Centralized exports for all server actions
 * This provides a clean API for importing actions throughout the application
 */

// Authentication actions
export {
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  signInWithApple,
  changePassword,
} from "./auth";

// Meal plan actions
export {
  generateMealPlan,
  deleteMealPlan,
  addRecipeToMealPlan,
} from "./meal-plans";

// Recipe actions
export {
  getRecipes,
  getRecipe,
  toggleRecipeFavorite,
  rateRecipe,
} from "./recipes";

// Grocery list actions
export {
  createGroceryList,
  addGroceryItem,
  updateGroceryItem,
  deleteGroceryItem,
} from "./grocery-lists";

// Profile actions
export {
  updateProfile,
  updateNutritionGoals,
  updateNotificationSettings,
  completeOnboarding,
} from "./profiles";

// Progress tracking actions
export { logProgressEntry } from "./progress";

// Chat actions
export { sendChatMessage } from "./chat";

// Utility functions (if needed externally)
export {
  calculateNutritionGoals,
  getMealType,
  categorizeIngredient,
  getFallbackMeals,
} from "./utils";
