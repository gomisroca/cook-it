import { get } from "@/services/api-server";
import { redirect } from "next/navigation";
import RecipeWizard from "@/components/recipe-wizard/recipe-wizard";
import { getCurrentUser } from "@/lib/auth";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const recipe = await get<
    Recipe & {
      ingredients: { name: string; quantity?: number; unit?: string }[];
      steps: {
        order: number;
        instruction: string;
        duration?: number;
        imageUrl?: string;
      }[];
      tags: { id: string; name: string }[];
    }
  >(`/recipes/${slug}`);

  if (recipe.author.id !== user.id) redirect(`/recipes/${slug}`);

  return (
    <div className="container mx-auto py-12 max-w-2xl w-full">
      <h1 className="text-3xl font-bold mb-8">Edit Recipe</h1>
      <RecipeWizard
        mode="edit"
        recipeSlug={slug}
        initialData={{
          title: recipe.title,
          description: recipe.description ?? "",
          coverImageUrl: recipe.coverImageUrl ?? "",
          difficulty: recipe.difficulty,
          isPublic: recipe.isPublic,
          servings: recipe.servings ?? undefined,
          prepTime: recipe.prepTime ?? undefined,
          cookingTime: recipe.cookingTime ?? undefined,
          ingredients: recipe.ingredients,
          steps: recipe.steps.map((s) => ({
            order: s.order,
            instruction: s.instruction,
            duration: s.duration ?? undefined,
            imageUrl: s.imageUrl ?? undefined,
          })),
          tags: recipe.tags.map((t) => t.name),
        }}
      />
    </div>
  );
}
