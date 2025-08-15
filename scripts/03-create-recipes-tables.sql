-- Create recipes database schema
-- This script sets up tables for storing recipes, ingredients, and instructions

-- Recipes table - stores basic recipe information
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  total_time INTEGER, -- in minutes
  servings INTEGER DEFAULT 1,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine_type VARCHAR(100),
  dietary_tags TEXT[], -- array of tags like 'vegetarian', 'vegan', 'gluten-free'
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

-- Recipe ingredients table - stores ingredients for each recipe
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_name VARCHAR(255) NOT NULL,
  amount DECIMAL(8,2),
  unit VARCHAR(50), -- cups, tablespoons, grams, etc.
  notes TEXT, -- optional notes like "chopped", "diced"
  order_index INTEGER DEFAULT 0 -- for ordering ingredients
);

-- Recipe instructions table - stores step-by-step instructions
CREATE TABLE IF NOT EXISTS recipe_instructions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  time_minutes INTEGER, -- optional time for this step
  temperature INTEGER, -- optional temperature for this step
  image_url TEXT -- optional image for this step
);

-- Recipe ratings table - stores user ratings and reviews
CREATE TABLE IF NOT EXISTS recipe_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, user_id) -- one rating per user per recipe
);

-- Recipe favorites table - stores user favorites
CREATE TABLE IF NOT EXISTS recipe_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, user_id) -- one favorite per user per recipe
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine_type ON recipes(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_dietary_tags ON recipes USING GIN(dietary_tags);
CREATE INDEX IF NOT EXISTS idx_recipes_created_by ON recipes(created_by);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_instructions_recipe_id ON recipe_instructions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_recipe_id ON recipe_ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_favorites_user_id ON recipe_favorites(user_id);

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes
CREATE POLICY "Public recipes are viewable by everyone" ON recipes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own recipes" ON recipes
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own recipes" ON recipes
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for recipe_ingredients
CREATE POLICY "Recipe ingredients are viewable if recipe is viewable" ON recipe_ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_ingredients.recipe_id 
      AND (recipes.is_public = true OR recipes.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage ingredients for their recipes" ON recipe_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_ingredients.recipe_id 
      AND recipes.created_by = auth.uid()
    )
  );

-- RLS Policies for recipe_instructions
CREATE POLICY "Recipe instructions are viewable if recipe is viewable" ON recipe_instructions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_instructions.recipe_id 
      AND (recipes.is_public = true OR recipes.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage instructions for their recipes" ON recipe_instructions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_instructions.recipe_id 
      AND recipes.created_by = auth.uid()
    )
  );

-- RLS Policies for recipe_ratings
CREATE POLICY "Recipe ratings are viewable by everyone" ON recipe_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own ratings" ON recipe_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON recipe_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" ON recipe_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for recipe_favorites
CREATE POLICY "Users can view their own favorites" ON recipe_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON recipe_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Insert some sample recipes for testing
INSERT INTO recipes (title, description, prep_time, cook_time, total_time, servings, difficulty, cuisine_type, dietary_tags, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving, is_public) VALUES
('Mediterranean Quinoa Bowl', 'A healthy and colorful quinoa bowl packed with Mediterranean flavors', 15, 20, 35, 4, 'easy', 'Mediterranean', ARRAY['vegetarian', 'gluten-free', 'healthy'], 420, 15.5, 58.2, 12.8, true),
('Grilled Chicken with Herbs', 'Juicy grilled chicken breast marinated with fresh herbs and lemon', 10, 25, 35, 4, 'medium', 'American', ARRAY['high-protein', 'low-carb', 'keto-friendly'], 285, 42.3, 2.1, 8.9, true),
('Vegan Buddha Bowl', 'Nutritious plant-based bowl with roasted vegetables and tahini dressing', 20, 30, 50, 2, 'medium', 'Asian-Fusion', ARRAY['vegan', 'vegetarian', 'gluten-free', 'healthy'], 380, 12.4, 45.6, 18.2, true);

-- Insert sample ingredients for Mediterranean Quinoa Bowl
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, amount, unit, notes, order_index) 
SELECT r.id, ingredient_name, amount, unit, notes, order_index
FROM recipes r, (VALUES
  ('Quinoa', 1, 'cup', 'rinsed', 1),
  ('Cherry tomatoes', 1, 'cup', 'halved', 2),
  ('Cucumber', 1, 'medium', 'diced', 3),
  ('Red onion', 0.25, 'cup', 'thinly sliced', 4),
  ('Kalamata olives', 0.33, 'cup', 'pitted', 5),
  ('Feta cheese', 0.5, 'cup', 'crumbled', 6),
  ('Fresh parsley', 0.25, 'cup', 'chopped', 7),
  ('Olive oil', 3, 'tablespoons', 'extra virgin', 8),
  ('Lemon juice', 2, 'tablespoons', 'fresh', 9),
  ('Salt', 1, 'teaspoon', 'to taste', 10),
  ('Black pepper', 0.5, 'teaspoon', 'freshly ground', 11)
) AS ingredients(ingredient_name, amount, unit, notes, order_index)
WHERE r.title = 'Mediterranean Quinoa Bowl';

-- Insert sample instructions for Mediterranean Quinoa Bowl
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, time_minutes)
SELECT r.id, step_number, instruction, time_minutes
FROM recipes r, (VALUES
  (1, 'Cook quinoa according to package directions. Let cool completely.', 20),
  (2, 'In a large bowl, combine cooled quinoa, cherry tomatoes, cucumber, red onion, and olives.', 5),
  (3, 'In a small bowl, whisk together olive oil, lemon juice, salt, and pepper.', 2),
  (4, 'Pour dressing over quinoa mixture and toss to combine.', 1),
  (5, 'Top with crumbled feta cheese and fresh parsley. Serve immediately.', 2)
) AS instructions(step_number, instruction, time_minutes)
WHERE r.title = 'Mediterranean Quinoa Bowl';
