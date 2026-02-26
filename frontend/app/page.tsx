import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { get } from "@/services/api-server";
import { Headline } from "./headline";
import RecipeCard from "@/components/recipe-card";

export default async function Home() {
  const user = await getCurrentUser();

  const featured = await get<PaginatedResponse<Recipe>>("/recipes?limit=6");

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden">
      <section className="max-w-4xl text-center">
        <Headline />

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Discover beautifully crafted recipes from around the world.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/recipes"
            className="rounded-xl bg-primary text-primary-foreground px-6 py-3 font-medium shadow-sm hover:shadow-md transition"
          >
            Browse Recipes
          </Link>

          {!user && (
            <Link
              href="/register"
              className="rounded-xl border px-6 py-3 font-medium hover:bg-muted transition"
            >
              Join Now
            </Link>
          )}
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">Featured Recipes</h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featured.data.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-2xl border bg-muted/40 p-10 text-center space-y-4">
        <h2 className="text-2xl font-semibold">
          Ready to share your own recipe?
        </h2>

        <p className="text-muted-foreground">
          Add your favorite dishes and inspire others.
        </p>

        <Link
          href="/recipes/create"
          className="inline-block rounded-xl bg-primary text-primary-foreground px-6 py-3 font-medium shadow-sm hover:shadow-md transition"
        >
          Create Recipe
        </Link>
      </section>
    </main>
  );
}
