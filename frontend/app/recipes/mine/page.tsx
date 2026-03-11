import { getCurrentUser } from "@/lib/auth";
import { get } from "@/services/api-server";
import { redirect } from "next/navigation";
import MyRecipesBrowse from "./my-recipes-browse";

export default async function MyRecipesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const res = await get<PaginatedResponse<Recipe>>("/recipes/mine");

  return (
    <div className="container mx-auto py-12 w-full max-w-7xl px-6">
      <h1 className="text-3xl font-bold mb-8">My Recipes</h1>
      <MyRecipesBrowse initialData={res.data} initialCursor={res.cursor} />
    </div>
  );
}
