import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface UserProfile {
  age?: number
  gender?: string
  height?: number
  weight?: number
  activity_level?: string
  goals?: string[]
  dietary_preferences?: string[]
  allergies?: string[]
}

interface AppState {
  // User state
  user: User | null
  profile: UserProfile | null
  isLoading: boolean

  // UI state
  isDarkMode: boolean
  activeTab: string

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  toggleDarkMode: () => void
  setActiveTab: (tab: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      profile: null,
      isLoading: false,
      isDarkMode: false,
      activeTab: "home",

      // Actions
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: "nutriai-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isDarkMode: state.isDarkMode,
      }),
    },
  ),
)
