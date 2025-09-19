"use server";

// Send chat message
export async function sendChatMessage(data: {
  userId: string;
  message: string;
  userProfile: any;
  userPreferences: any;
}) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: data.message,
        userProfile: data.userProfile,
        userPreferences: data.userPreferences,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const result = await response.json();
    return { success: true, response: result.response };
  } catch (error) {
    console.error("Error sending chat message:", error);
    return { success: false, error: "Failed to send message" };
  }
}
