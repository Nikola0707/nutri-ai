-- Create meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  meals_per_day INTEGER NOT NULL DEFAULT 3,
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  cuisine_preferences TEXT[],
  dietary_restrictions TEXT[],
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  meal_type VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients TEXT[],
  instructions TEXT[],
  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  servings INTEGER DEFAULT 1,
  calories INTEGER,
  protein DECIMAL(8,2),
  carbs DECIMAL(8,2),
  fat DECIMAL(8,2),
  fiber DECIMAL(8,2),
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_status ON meal_plans(status);
CREATE INDEX IF NOT EXISTS idx_meals_meal_plan_id ON meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meals_day_number ON meals(day_number);
CREATE INDEX IF NOT EXISTS idx_meals_meal_type ON meals(meal_type);

-- Enable Row Level Security
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meal_plans
CREATE POLICY "Users can view their own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plans" ON meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans" ON meal_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans" ON meal_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for meals
CREATE POLICY "Users can view meals from their meal plans" ON meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE meal_plans.id = meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create meals for their meal plans" ON meals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE meal_plans.id = meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update meals from their meal plans" ON meals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE meal_plans.id = meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete meals from their meal plans" ON meals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE meal_plans.id = meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );
