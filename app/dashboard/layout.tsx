import type React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BottomNavigation } from "@/components/bottom-navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Main Content */}
      <main className="pb-20 px-4 pt-6">{children}</main>

      {/* Bottom Navigation - Mobile First */}
      <BottomNavigation />
    </div>
  );
}
