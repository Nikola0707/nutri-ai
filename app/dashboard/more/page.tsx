import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, BookOpen, Settings, LogOut, User } from "lucide-react";
import Link from "next/link";

export default async function MorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const menuItems = [
    {
      title: "AI Nutrition Coach",
      description: "Chat with your personal AI nutritionist",
      icon: MessageCircle,
      href: "/dashboard/chat",
      color: "text-emerald-primary",
    },
    {
      title: "Education Hub",
      description: "Learn about nutrition and healthy habits",
      icon: BookOpen,
      href: "/dashboard/education",
      color: "text-lime-secondary",
    },
    {
      title: "Profile & Settings",
      description: "Manage your account and preferences",
      icon: Settings,
      href: "/dashboard/settings",
      color: "text-deep-gray",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-heading font-semibold text-2xl text-emerald-primary">
          More Options
        </h1>
        <p className="text-deep-gray">
          Explore additional features and settings
        </p>
      </div>

      {/* User Info Card */}
      <Card className="bg-white border-light-gray">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-deep-gray">
                {user?.email}
              </h3>
              <p className="text-sm text-gray-600">Premium Member</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <div className="space-y-4">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="bg-white border-light-gray hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center`}
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-deep-gray">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Sign Out */}
      <Card className="bg-white border-light-gray">
        <CardContent className="p-6">
          <form action="/auth/signout" method="post">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
