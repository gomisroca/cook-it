import { get } from "@/services/api-server";
import RecipeBrowse from "./recipe-browse";

export default async function RecipeListPage() {
  const res = await get<PaginatedResponse<Recipe>>("/recipes");

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Browse Recipes</h1>

      <RecipeBrowse initialData={res.data} initialCursor={res.cursor} />
    </div>
  );
}
