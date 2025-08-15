import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat-interface";

export default async function ChatPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user profile and preferences for context
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

  // Get recent chat history
  const { data: chatHistory } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(50);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-3xl font-bold">AI Nutrition Chat</h1>
        <p className="text-muted-foreground mt-2">
          Get personalized nutrition advice from your AI assistant
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ChatInterface
          userId={user.id}
          userProfile={profile}
          userPreferences={preferences}
          initialMessages={chatHistory || []}
        />
      </div>
    </div>
  );
}
