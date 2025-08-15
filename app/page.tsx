import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Utensils,
  Brain,
  TrendingUp,
  ShoppingCart,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function Home() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-subtle">
        <div className="text-center p-8 glass-effect rounded-2xl modern-shadow-lg">
          <h1 className="text-2xl font-heading text-neutral-dark mb-4">
            Connect Supabase to get started
          </h1>
          <p className="text-muted-foreground">
            Configure your database connection to begin your nutrition journey
          </p>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="h-screen gradient-subtle flex items-center">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-6xl mx-auto animate-fade-in">
          {/* Header Section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="gradient-emerald p-4 rounded-xl modern-shadow-lg">
                <Utensils className="h-12 w-12 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-emerald-500 animate-pulse" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-neutral-dark mb-4 leading-tight">
            Elevate Your Nutrition.
            <br />
            <span className="text-neutral-dark">
              Simplify Your Meal Planning.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            Personalized meal recommendations tailored to your unique health
            goals. Track your nutrition effortlessly with our intuitive
            AI-powered platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              asChild
              size="lg"
              className="gradient-emerald hover:shadow-lg hover:scale-105 transition-all duration-200 text-white px-8 py-3 text-lg rounded-xl font-semibold group"
            >
              <Link href="/auth/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-emerald-600 text-emerald-600 hover:shadow-lg hover:scale-105 transition-all duration-200 px-8 py-3 text-lg rounded-xl font-semibold bg-white/80 backdrop-blur-sm"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>

          {/* Feature Cards - Compact Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
            <div className="text-center p-4 bg-white rounded-xl modern-shadow-lg hover-lift border border-gray-100">
              <div className="gradient-emerald p-3 rounded-lg w-fit mx-auto mb-3">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-heading text-neutral-dark mb-2">
                AI Meal Planning
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Personalized recommendations for your health goals
              </p>
            </div>

            <div className="text-center p-4 bg-white rounded-xl modern-shadow-lg hover-lift border border-gray-100">
              <div className="gradient-emerald p-3 rounded-lg w-fit mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-heading text-neutral-dark mb-2">
                Progress Tracking
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track nutrition with intuitive logging tools
              </p>
            </div>

            <div className="text-center p-4 bg-white rounded-xl modern-shadow-lg hover-lift border border-gray-100">
              <div className="gradient-emerald p-3 rounded-lg w-fit mx-auto mb-3">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-heading text-neutral-dark mb-2">
                Smart Grocery Lists
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Discover recipes that nourish and delight
              </p>
            </div>

            <div className="text-center p-4 bg-white rounded-xl modern-shadow-lg hover-lift border border-gray-100">
              <div className="gradient-emerald p-3 rounded-lg w-fit mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-heading text-neutral-dark mb-2">
                AI Insights
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Get personalized recommendations to optimize nutrition
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
