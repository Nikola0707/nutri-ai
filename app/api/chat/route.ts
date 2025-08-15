import { createServerClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, userProfile, userPreferences } = await request.json();

    const supabase = await createServerClient();

    // Get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create context from user data
    const context = createUserContext(userProfile, userPreferences);

    // Generate AI response (simplified for demo - in production use actual AI service)
    const response = await generateNutritionResponse(message, context);

    // Save both messages to database
    await supabase.from("chat_messages").insert([
      {
        user_id: user.id,
        role: "user",
        content: message,
      },
      {
        user_id: user.id,
        role: "assistant",
        content: response,
      },
    ]);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function createUserContext(profile: any, preferences: any) {
  const context = [];

  if (profile) {
    if (profile.age) context.push(`Age: ${profile.age}`);
    if (profile.gender) context.push(`Gender: ${profile.gender}`);
    if (profile.weight) context.push(`Current weight: ${profile.weight} lbs`);
    if (profile.target_weight)
      context.push(`Target weight: ${profile.target_weight} lbs`);
    if (profile.daily_calorie_goal)
      context.push(`Daily calorie goal: ${profile.daily_calorie_goal}`);
    if (profile.goal_type) context.push(`Goal: ${profile.goal_type} weight`);
    if (profile.activity_level)
      context.push(`Activity level: ${profile.activity_level}`);
    if (profile.dietary_restrictions?.length > 0) {
      context.push(
        `Dietary restrictions: ${profile.dietary_restrictions.join(", ")}`
      );
    }
  }

  return context.join(". ");
}

async function generateNutritionResponse(
  message: string,
  userContext: string
): Promise<string> {
  // This is a simplified response generator for demo purposes
  // In production, you would integrate with an actual AI service like OpenAI, Anthropic, etc.

  const lowerMessage = message.toLowerCase();

  // Breakfast suggestions
  if (lowerMessage.includes("breakfast")) {
    return `Based on your profile, here are some great breakfast options:

🥣 **High-Protein Options:**
- Greek yogurt with berries and granola
- Scrambled eggs with spinach and whole grain toast
- Protein smoothie with banana and oats

🥑 **Balanced Meals:**
- Avocado toast with poached egg
- Overnight oats with nuts and fruit
- Whole grain cereal with milk and banana

These options align with your nutritional goals and provide sustained energy for your day!`;
  }

  // Protein intake
  if (lowerMessage.includes("protein")) {
    return `Great question about protein! Here are some excellent ways to increase your protein intake:

🍗 **Lean Proteins:**
- Chicken breast, turkey, lean beef
- Fish like salmon, tuna, cod
- Eggs and egg whites

🌱 **Plant-Based Options:**
- Legumes (beans, lentils, chickpeas)
- Quinoa, tofu, tempeh
- Nuts, seeds, and nut butters

💡 **Pro Tips:**
- Aim for protein at every meal
- Greek yogurt makes a great snack
- Add protein powder to smoothies

Based on your goals, try to include 20-30g of protein per meal!`;
  }

  // Snack suggestions
  if (lowerMessage.includes("snack")) {
    return `Here are some healthy snack ideas that fit your nutritional goals:

🥜 **Protein-Rich Snacks:**
- Greek yogurt with berries
- Hard-boiled eggs
- Nuts and seeds mix

🍎 **Balanced Options:**
- Apple with almond butter
- Hummus with vegetables
- Whole grain crackers with cheese

🥤 **Quick & Easy:**
- Protein smoothie
- Trail mix (portion controlled)
- Cottage cheese with fruit

Remember to keep portions moderate and choose snacks that include protein or fiber to keep you satisfied!`;
  }

  // Weight loss
  if (
    lowerMessage.includes("weight loss") ||
    lowerMessage.includes("lose weight")
  ) {
    return `I can help you with healthy weight loss strategies! Here's what I recommend:

📊 **Calorie Management:**
- Create a moderate calorie deficit (300-500 calories below maintenance)
- Focus on nutrient-dense, whole foods
- Track your intake to stay accountable

🍽️ **Meal Planning:**
- Fill half your plate with vegetables
- Include lean protein at every meal
- Choose complex carbohydrates over simple ones

💪 **Lifestyle Tips:**
- Stay hydrated (aim for 8+ glasses of water daily)
- Get adequate sleep (7-9 hours)
- Combine with regular physical activity

Remember, sustainable weight loss is 1-2 pounds per week. Focus on building healthy habits rather than quick fixes!`;
  }

  // Dietary restrictions
  if (
    lowerMessage.includes("dietary") ||
    lowerMessage.includes("restriction")
  ) {
    return `I understand managing dietary restrictions can be challenging. Here's how I can help:

🔍 **Meal Planning:**
- I'll suggest recipes that fit your specific restrictions
- Help you find suitable substitutions for favorite foods
- Ensure you're getting all necessary nutrients

🛒 **Shopping Tips:**
- Read labels carefully for hidden ingredients
- Focus on naturally compliant whole foods
- Explore specialty products when needed

💡 **Nutrition Balance:**
- Make sure you're not missing key nutrients
- Consider supplements if recommended by your healthcare provider
- Plan meals in advance to avoid last-minute decisions

What specific dietary restrictions are you working with? I can provide more targeted advice!`;
  }

  // Default response
  return `Thanks for your question! As your AI nutrition assistant, I'm here to help with:

🍽️ **Meal Planning & Recipes**
🥗 **Nutrition Advice & Tips**  
🎯 **Goal-Specific Guidance**
🛒 **Shopping & Prep Help**

${userContext ? `Based on your profile: ${userContext}` : ""}

Could you tell me more specifically what you'd like help with? I can provide personalized recommendations for your nutrition journey!`;
}
