"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, ShoppingCart, Menu, ChefHat } from "lucide-react"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/dashboard/recipes", icon: ChefHat, label: "Recipes" },
  { href: "/dashboard/meal-plans", icon: Calendar, label: "Plan" },
  { href: "/dashboard/grocery-lists", icon: ShoppingCart, label: "Grocery" },
  { href: "/dashboard/more", icon: Menu, label: "More" },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl px-4 py-3 shadow-2xl shadow-black/10">
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ease-out ${
                  isActive
                    ? "text-white bg-emerald-600 scale-110 shadow-lg shadow-emerald-600/30"
                    : "text-neutral-600 hover:text-emerald-600 hover:bg-emerald-50 hover:scale-105"
                }`}
              >
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                )}

                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <span
                  className={`text-xs font-medium transition-all duration-300 ${
                    isActive ? "font-semibold text-white" : "group-hover:font-medium"
                  }`}
                >
                  {item.label}
                </span>

                {isActive && <div className="absolute inset-0 bg-emerald-600/20 rounded-xl blur-sm -z-10" />}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
