"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { sendChatMessage } from "@/lib/actions"

interface ChatInterfaceProps {
  userId: string
  userProfile: any
  userPreferences: any
  initialMessages: any[]
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export function ChatInterface({ userId, userProfile, userPreferences, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || [])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, newUserMessage])

    try {
      const result = await sendChatMessage({
        userId,
        message: userMessage,
        userProfile,
        userPreferences,
      })

      if (result.success && result.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.response,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    "What should I eat for breakfast today?",
    "How can I increase my protein intake?",
    "What are some healthy snack options?",
    "Help me plan meals for weight loss",
    "What foods are good for my dietary restrictions?",
  ]

  const handleSuggestedQuestion = async (question: string) => {
    if (isLoading) return

    setIsLoading(true)

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, newUserMessage])

    try {
      const result = await sendChatMessage({
        userId,
        message: question,
        userProfile,
        userPreferences,
      })

      if (result.success && result.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.response,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Welcome to your AI Nutrition Assistant!</h3>
                <p className="text-muted-foreground max-w-md">
                  I'm here to help you with personalized nutrition advice, meal planning, and dietary guidance based on
                  your profile and goals.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium">Try asking me:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-xs"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="w-4 h-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-secondary">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="w-4 h-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <div className="border-t p-4 pb-24">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about nutrition, meal planning, or dietary advice..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
