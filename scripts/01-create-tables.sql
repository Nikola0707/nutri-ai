-- NutriAI Database Setup
-- This script creates all necessary tables and functions for the NutriAI application

-- Create users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dietary_restrictions TEXT[], -- Array of dietary restrictions
  allergies TEXT[], -- Array of allergies
  health_goals TEXT[], -- Array of health goals
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create meal plans table (updated to match script 04)
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER,
  meals_per_day INTEGER DEFAULT 3,
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  cuisine_preferences TEXT[],
  dietary_restrictions TEXT[],
  status VARCHAR(50) DEFAULT 'active',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meals table (updated to match script 04)
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_number INTEGER,
  meal_type VARCHAR(50) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients TEXT[],
  instructions TEXT[],
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  servings INTEGER DEFAULT 1,
  calories INTEGER,
  protein DECIMAL(8,2),
  carbs DECIMAL(8,2),
  fat DECIMAL(8,2),
  fiber DECIMAL(8,2),
  scheduled_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create grocery lists table
CREATE TABLE IF NOT EXISTS grocery_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create grocery items table
CREATE TABLE IF NOT EXISTS grocery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grocery_list_id UUID REFERENCES grocery_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT,
  category TEXT,
  is_purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nutrition logs table for tracking
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  serving_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, log_date, meal_type, food_name)
);

-- Create progress tracking table
CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  total_time INTEGER,
  servings INTEGER DEFAULT 1,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine_type VARCHAR(100),
  dietary_tags TEXT[],
  calories_per_serving INTEGER,
  protein_per_serving DECIMAL(5,2),
  carbs_per_serving DECIMAL(5,2),
  fat_per_serving DECIMAL(5,2),
  fiber_per_serving DECIMAL(5,2),
  sugar_per_serving DECIMAL(5,2),
  sodium_per_serving DECIMAL(5,2),
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true
);

-- Create recipe ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_name VARCHAR(255) NOT NULL,
  amount DECIMAL(8,2),
  unit VARCHAR(50),
  notes TEXT,
  order_index INTEGER DEFAULT 0
);

-- Create recipe instructions table
CREATE TABLE IF NOT EXISTS recipe_instructions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  time_minutes INTEGER,
  temperature INTEGER,
  image_url TEXT
);

-- Create recipe ratings table
CREATE TABLE IF NOT EXISTS recipe_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, user_id)
);

-- Create recipe favorites table
CREATE TABLE IF NOT EXISTS recipe_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, user_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- Meal plans policies
CREATE POLICY "Users can manage own meal plans" ON meal_plans FOR ALL USING (auth.uid() = user_id);

-- Meals policies
CREATE POLICY "Users can manage own meals" ON meals FOR ALL USING (
  auth.uid() = (SELECT user_id FROM meal_plans WHERE id = meal_plan_id)
);

-- Grocery lists policies
CREATE POLICY "Users can manage own grocery lists" ON grocery_lists FOR ALL USING (auth.uid() = user_id);

-- Grocery items policies
CREATE POLICY "Users can manage own grocery items" ON grocery_items FOR ALL USING (
  auth.uid() = (SELECT user_id FROM grocery_lists WHERE id = grocery_list_id)
);

-- Nutrition logs policies
CREATE POLICY "Users can manage own nutrition logs" ON nutrition_logs FOR ALL USING (auth.uid() = user_id);

-- Progress tracking policies
CREATE POLICY "Users can manage own progress" ON progress_tracking FOR ALL USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view their own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own chat messages" ON chat_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own chat messages" ON chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Recipes policies
CREATE POLICY "Public recipes are viewable by everyone" ON recipes FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own recipes" ON recipes FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create their own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own recipes" ON recipes FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own recipes" ON recipes FOR DELETE USING (auth.uid() = created_by);

-- Recipe ingredients policies
CREATE POLICY "Recipe ingredients are viewable if recipe is viewable" ON recipe_ingredients FOR SELECT USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND (recipes.is_public = true OR recipes.created_by = auth.uid()))
);
CREATE POLICY "Users can manage ingredients for their recipes" ON recipe_ingredients FOR ALL USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.created_by = auth.uid())
);

-- Recipe instructions policies
CREATE POLICY "Recipe instructions are viewable if recipe is viewable" ON recipe_instructions FOR SELECT USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_instructions.recipe_id AND (recipes.is_public = true OR recipes.created_by = auth.uid()))
);
CREATE POLICY "Users can manage instructions for their recipes" ON recipe_instructions FOR ALL USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_instructions.recipe_id AND recipes.created_by = auth.uid())
);

-- Recipe ratings policies
CREATE POLICY "Recipe ratings are viewable by everyone" ON recipe_ratings FOR SELECT USING (true);
CREATE POLICY "Users can create their own ratings" ON recipe_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ratings" ON recipe_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ratings" ON recipe_ratings FOR DELETE USING (auth.uid() = user_id);

-- Recipe favorites policies
CREATE POLICY "Users can view their own favorites" ON recipe_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own favorites" ON recipe_favorites FOR ALL USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_meal_plan_id ON meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meals_scheduled_date ON meals(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_user_id ON grocery_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_items_list_id ON grocery_items(grocery_list_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_date ON progress_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine_type ON recipes(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_dietary_tags ON recipes USING GIN(dietary_tags);
CREATE INDEX IF NOT EXISTS idx_recipes_created_by ON recipes(created_by);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_instructions_recipe_id ON recipe_instructions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_recipe_id ON recipe_ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_favorites_user_id ON recipe_favorites(user_id);
