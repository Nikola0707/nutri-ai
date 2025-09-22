"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  LayoutDashboard,
  Utensils,
  ShoppingCart,
  TrendingUp,
  Settings,
  LogOut,
  MessageCircle,
  User,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn, getUserInitials } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Meal Plans", href: "/dashboard/meal-plans", icon: Utensils },
  {
    name: "Grocery Lists",
    href: "/dashboard/grocery-lists",
    icon: ShoppingCart,
  },
  { name: "Progress", href: "/dashboard/progress", icon: TrendingUp },
  { name: "AI Chat", href: "/dashboard/chat", icon: MessageCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface MobileNavProps {
  user: any;
}

export default function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center h-16 px-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Utensils className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      NutriAI
                    </span>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                          isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center space-x-2">
            <div className="bg-emerald-100 p-1.5 rounded-lg">
              <Utensils className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-lg font-bold text-gray-900">NutriAI</span>
          </div>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {getUserInitials(user.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-gray-900">
                {user.user_metadata?.full_name || "User"}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOut} className="w-full">
                <button type="submit" className="flex items-center w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
