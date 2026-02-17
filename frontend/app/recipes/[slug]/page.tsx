import { get } from "@/services/api";
import Image from "next/image";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const slug = (await params).slug;
  const recipe = await get<Recipe>(`/recipes/${slug}`);
  if (!recipe) return <p>Loading...</p>;

  return (
    <div>
      {recipe.coverImageUrl && (
        <Image
          src={recipe.coverImageUrl}
          alt="cover"
          width={100}
          height={100}
        />
      )}
      <h1>{recipe.title}</h1>
      <p>{recipe.description}</p>
      <div>
        <h3>Ingredients</h3>
        <ul>
          {recipe.ingredients.map((i) => (
            <li key={i.id}>
              {i.quantity} {i.unit} {i.name}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Steps</h3>
        <ol>
          {recipe.steps.map((s) => (
            <li key={s.id}>
              {s.instruction} ({s.duration} min)
            </li>
          ))}
        </ol>
      </div>

      <div>
        ❤️ {recipe.likesCount} &nbsp; ⭐ {recipe.favoritesCount} &nbsp; 💬{" "}
        {recipe.commentsCount}
      </div>

      {/* <CommentsSection comments={recipe.comments} recipeId={recipe.id} />
      <FollowAuthorButton author={recipe.author} /> */}
    </div>
  );
}
