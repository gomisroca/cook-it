import { env } from "@/env";
import Image from "next/image";
import Link from "next/link";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
    >
      {/* Image Cover */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={
            recipe.coverImageUrl &&
            recipe.coverImageUrl.includes(env.NEXT_PUBLIC_UPLOADTHING_CDN)
              ? recipe.coverImageUrl
              : "/placeholder-recipe.jpg"
          }
          alt={recipe.title}
          fill
          sizes="(max-width: 768px) 100vw,
                  (max-width: 1200px) 50vw,
                  33vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu will-change-transform group-hover:scale-110"
          priority={false}
        />

        {/* Overlay Stats */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <span className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-md shadow-sm">
            ❤️ {recipe.likesCount}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-md shadow-sm">
            ⭐ {recipe.favoritesCount}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="space-y-1">
          {/* Title */}
          <h2 className="text-lg font-semibold group-hover:underline">
            {recipe.title}
          </h2>

          {/* Prep & Cooking Time */}
          {(recipe.prepTime || recipe.cookingTime) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>⏱</span>
              {recipe.prepTime && <span>{recipe.prepTime} min prep</span>}
              {recipe.prepTime && recipe.cookingTime && <span>•</span>}
              {recipe.cookingTime && <span>{recipe.cookingTime} min cook</span>}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {recipe.description}
        </p>

        {/* Tag Badges */}
        <div className="flex flex-wrap gap-2">
          {recipe.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="text-xs bg-muted px-2 py-1 rounded-full"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
