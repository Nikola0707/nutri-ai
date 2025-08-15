import { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Target, Calendar, BarChart3 } from "lucide-react";
import { ProgressCharts } from "@/components/progress-charts";
import { ProgressStats } from "@/components/progress-stats";
import { LogEntryDialog } from "@/components/log-entry-dialog";

export default async function ProgressPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user profile and recent progress entries
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: progressEntries } = await supabase
    .from("progress_tracking")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(30);

  const hasEntries = progressEntries && progressEntries.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Progress Tracking</h1>
          <p className="text-muted-foreground mt-2">
            Monitor your nutrition journey and health goals
          </p>
        </div>
        <LogEntryDialog userId={user.id}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Log Entry
          </Button>
        </LogEntryDialog>
      </div>

      {hasEntries ? (
        <div className="space-y-6">
          <Suspense fallback={<div>Loading stats...</div>}>
            <ProgressStats entries={progressEntries} profile={profile} />
          </Suspense>

          <Suspense fallback={<div>Loading charts...</div>}>
            <ProgressCharts entries={progressEntries} profile={profile} />
          </Suspense>
        </div>
      ) : (
        <>
          {/* Empty State */}
          <Card>
            <CardContent className="text-center py-16">
              <TrendingUp className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-2">
                Start Tracking Your Progress
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Log your daily nutrition, weight, and other health metrics to
                see your progress over time.
              </p>
              <LogEntryDialog userId={user.id}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Log Your First Entry
                </Button>
              </LogEntryDialog>
            </CardContent>
          </Card>

          {/* Feature Preview Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  Visual Charts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  See your progress with beautiful charts showing nutrition
                  trends, weight changes, and goal achievement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Target className="mr-2 h-5 w-5 text-primary" />
                  Goal Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Set and track your health goals including weight targets,
                  nutrition goals, and fitness milestones.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Daily Logging
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Log daily nutrition intake, weight, body measurements, and
                  notes about your health journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
