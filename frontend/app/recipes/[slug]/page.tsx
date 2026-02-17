import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { env } from "@/env";
import { get } from "@/services/api";
import CookingMode from "./cooking-mode";
import { IngredientChecklist } from "./ingredient-checklist";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const slug = (await params).slug;
  const recipe = await get<Recipe>(`/recipes/${slug}`);
  if (!recipe) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Hero Section */}
        <div className="space-y-6">
          {recipe.coverImageUrl &&
          recipe.coverImageUrl.includes(env.UPLOADTHING_CDN) ? (
            <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={recipe.coverImageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <Skeleton className="w-full h-[400px] rounded-2xl" />
          )}

          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">
              {recipe.title}
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              {recipe.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span>❤️ {recipe.likesCount}</span>
              <span>⭐ {recipe.favoritesCount}</span>
              <span>💬 {recipe.commentsCount}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
          <CookingMode steps={recipe.steps} />
        </div>

        <Separator />

        {/* Ingredients + Steps */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <IngredientChecklist
            ingredients={recipe.ingredients}
            recipeId={recipe.id}
          />

          {/* Steps */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-semibold">Preparation</h2>
                <ol className="space-y-10">
                  {recipe.steps.map((step, index) => (
                    <li key={step.id} className="space-y-4">
                      {/* Step Header */}
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          {index + 1}
                        </div>

                        <div className="space-y-2">
                          <p className="font-medium leading-relaxed">
                            {step.instruction}
                          </p>

                          {step.duration && (
                            <p className="text-sm text-muted-foreground">
                              ⏱ {step.duration} min
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Optional Step Image */}
                      {step.imageUrl &&
                        step.imageUrl.includes(env.UPLOADTHING_CDN) && (
                          <div className="relative w-full h-[250px] rounded-2xl overflow-hidden shadow-lg border  transition-transform duration-300 hover:scale-[1.01]">
                            <Image
                              src={step.imageUrl}
                              alt={`Step ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Future sections */}
        {/* <CommentsSection comments={recipe.comments} recipeId={recipe.id} />
        <FollowAuthorButton author={recipe.author} /> */}
      </div>
    </div>
  );
}
