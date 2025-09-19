"use server";

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Sign in action
export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" };
  }

  const email = formData.get("email");
  const password = formData.get("password");
  const rememberMe = formData.get("rememberMe") === "on";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createServerClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// Sign up action
export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" };
  }

  const email = formData.get("email");
  const password = formData.get("password");
  const fullName = formData.get("fullName");

  if (!email || !password || !fullName) {
    return { error: "All fields are required" };
  }

  const supabase = await createServerClient();

  try {
    const { error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          }/dashboard`,
        data: {
          full_name: fullName.toString(),
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { success: "Check your email to confirm your account." };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// Sign out action
export async function signOut() {
  const supabase = await createServerClient();

  await supabase.auth.signOut();
  redirect("/auth/login");
}

// Social login functions
export async function signInWithGoogle() {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback`,
    },
  });

  if (error) {
    console.error("Google sign in error:", error);
    redirect("/auth/login?error=oauth_error");
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signInWithApple() {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback`,
    },
  });

  if (error) {
    console.error("Apple sign in error:", error);
    redirect("/auth/login?error=oauth_error");
  }

  if (data.url) {
    redirect(data.url);
  }
}

// Change password
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const supabase = await createServerClient();

  try {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) {
      console.error("Error changing password:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Failed to change password" };
  }
}
