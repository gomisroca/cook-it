import { get } from "@/services/api";
import Link from "next/link";

export default async function RecipeListPage() {
  const res = await get<PaginatedResponse<Recipe>>("/recipes");

  return (
    <div>
      <h1>Recipes</h1>
      <ul>
        {res.data.map((recipe) => (
          <li key={recipe.id}>
            <Link href={`/recipes/${recipe.slug}`}>{recipe.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
