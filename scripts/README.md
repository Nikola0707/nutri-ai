# Database Setup

This directory contains the database setup scripts for the NutriAI application.

## Quick Setup

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to**: SQL Editor
4. **Run the script**: `01-create-tables.sql`

## What the Script Creates

### Core Tables

- `profiles` - User profiles (extends Supabase auth.users)
- `user_preferences` - User dietary preferences and goals
- `meal_plans` - User meal plans
- `meals` - Individual meals within plans
- `grocery_lists` - Shopping lists
- `grocery_items` - Items in shopping lists
- `nutrition_logs` - Daily nutrition tracking
- `progress_tracking` - Weight and body metrics

### Chat & AI

- `chat_messages` - AI chat history

### Recipes

- `recipes` - Recipe database
- `recipe_ingredients` - Recipe ingredients
- `recipe_instructions` - Step-by-step instructions
- `recipe_ratings` - User ratings and reviews
- `recipe_favorites` - User favorite recipes

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Proper RLS policies** for data isolation
- **Secure function** with proper search_path
- **Automatic user profile creation** via trigger

## Troubleshooting

If you encounter issues:

1. **Check Supabase Logs**: Go to Logs → Database
2. **Verify RLS policies**: Make sure they're enabled
3. **Test user creation**: Try signing up a new user
4. **Check function**: Verify `handle_new_user` function exists

## Environment Variables Required

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
