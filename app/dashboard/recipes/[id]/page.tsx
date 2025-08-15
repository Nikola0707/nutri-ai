import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getRecipe } from "@/lib/actions"
import { RecipeDetail } from "@/components/recipe-detail"

interface RecipePageProps {
  params: {
    id: string
  }
}

export default async function RecipePage({ params }: RecipePageProps) {
  const result = await getRecipe(params.id)

  if (!result.success || !result.recipe) {
    notFound()
  }

  return (
    <div className="min-h-screen pb-24">
      <Suspense
        fallback={
          <div className="animate-pulse">
            <div className="bg-neutral-200 rounded-2xl h-64 mb-6"></div>
            <div className="bg-neutral-200 rounded h-8 mb-4"></div>
            <div className="bg-neutral-200 rounded h-4 w-3/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-neutral-200 rounded-2xl h-96"></div>
              <div className="bg-neutral-200 rounded-2xl h-96"></div>
            </div>
          </div>
        }
      >
        <RecipeDetail recipe={result.recipe} />
      </Suspense>
    </div>
  )
}
