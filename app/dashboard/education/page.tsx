import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Star } from "lucide-react"

const educationContent = [
  {
    title: "Understanding Macronutrients",
    description: "Learn about proteins, carbs, and fats and how they fuel your body",
    duration: "5 min read",
    category: "Basics",
    rating: 4.8,
  },
  {
    title: "Meal Timing for Optimal Health",
    description: "Discover when to eat for better energy and metabolism",
    duration: "7 min read",
    category: "Advanced",
    rating: 4.9,
  },
  {
    title: "Reading Nutrition Labels",
    description: "Master the art of understanding food packaging information",
    duration: "4 min read",
    category: "Practical",
    rating: 4.7,
  },
  {
    title: "Hydration and Performance",
    description: "The role of water in your nutrition and fitness goals",
    duration: "6 min read",
    category: "Health",
    rating: 4.6,
  },
]

export default function EducationPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="font-heading font-semibold text-2xl text-emerald-primary">Education Hub</h1>
        <p className="text-deep-gray">Expand your nutrition knowledge</p>
      </div>

      {/* Featured Article */}
      <Card className="bg-gradient-to-r from-emerald-primary to-lime-secondary text-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 mt-1" />
            <div>
              <Badge variant="secondary" className="mb-2 bg-white/20 text-white">
                Featured
              </Badge>
              <h3 className="font-heading font-semibold text-lg mb-2">The Complete Guide to Sustainable Nutrition</h3>
              <p className="text-white/90 mb-3">
                Learn how to build lasting healthy eating habits that work for your lifestyle
              </p>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  12 min read
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  4.9
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Article Grid */}
      <div className="space-y-4">
        <h2 className="font-heading font-semibold text-lg text-deep-gray">Popular Articles</h2>
        <div className="grid gap-4">
          {educationContent.map((article, index) => (
            <Card key={index} className="bg-white border-light-gray hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-emerald-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                    <h3 className="font-heading font-semibold text-deep-gray mb-1">{article.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{article.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {article.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
