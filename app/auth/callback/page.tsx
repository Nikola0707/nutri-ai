"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient();

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth callback error:", error);
        router.push("/auth/login?error=callback_error");
        return;
      }

      if (data.session) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("onboarding_completed")
          .eq("user_id", data.session.user.id)
          .single();

        if (profile?.onboarding_completed) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      } else {
        router.push("/auth/login");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
