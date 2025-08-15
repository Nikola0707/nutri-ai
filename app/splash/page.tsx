"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/login")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-dark to-lime flex items-center justify-center">
      <div className="text-center text-white">
        <div className="mb-8">
          <Logo className="w-24 h-24 mx-auto mb-4" />
        </div>
        <h1 className="text-3xl font-bold font-heading mb-2">NutriAI</h1>
        <p className="text-xl opacity-90">Your AI-Powered Nutrition Coach</p>
      </div>
    </div>
  )
}
