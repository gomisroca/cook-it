import { get } from "@/services/api-server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import EditRecipeForm from "./edit-recipe-form";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditRecipePage({ params }: Props) {
  const { slug } = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const recipe = await get<Recipe>(`/recipes/${slug}`);

  if (recipe.author.id !== user.id) redirect(`/recipes/${slug}`);

  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Edit Recipe</h1>
      <EditRecipeForm recipe={recipe} />
    </div>
  );
}
