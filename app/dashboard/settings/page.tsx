import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Target, Bell, Shield } from "lucide-react";
import { ProfileSettings } from "@/components/profile-settings";
import { NutritionGoals } from "@/components/nutrition-goals";
import { NotificationSettings } from "@/components/notification-settings";
import { SecuritySettings } from "@/components/security-settings";

export default async function SettingsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user profile and preferences
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile, preferences, and account settings
        </p>
      </div>

      {/* Settings Categories */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-primary" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileSettings user={user} profile={profile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5 text-primary" />
              Nutrition Goals
            </CardTitle>
            <CardDescription>
              Set your daily calorie, protein, carb, and fat targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NutritionGoals userId={user.id} profile={profile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationSettings userId={user.id} preferences={preferences} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-primary" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Manage your account security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SecuritySettings user={user} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
