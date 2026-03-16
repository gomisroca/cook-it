import { get } from "@/services/api-server";
import Modal from "@/components/ui/modal";
import RecipeCard from "@/components/recipe-card";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const recipes = await get<Recipe[]>(`/users/${username}/favorites`).catch(
    () => [],
  );

  return (
    <Modal>
      <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-4 space-y-4">
        <h2 className="text-xl font-bold">Favorited recipes</h2>
        {recipes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No favorited recipes yet.
          </p>
        ) : (
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
