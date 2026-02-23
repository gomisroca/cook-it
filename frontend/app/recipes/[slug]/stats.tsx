"use client";

import { useAuth } from "@/contexts/AuthContext";
import { toggleFavorite, toggleLike } from "@/lib/recipe-actions";
import { useState } from "react";
import { sileo } from "sileo";

interface Props {
  recipeId: string;
  initialLikes: number;
  initialFavorites: number;
  commentsCount: number;
  initiallyLiked: boolean;
  initiallyFavorited: boolean;
}

export function RecipeStats({
  recipeId,
  initialLikes,
  initialFavorites,
  commentsCount,
  initiallyLiked,
  initiallyFavorited,
}: Props) {
  const { user } = useAuth();

  const [likesCount, setLikesCount] = useState(initialLikes);
  const [favoritesCount, setFavoritesCount] = useState(initialFavorites);
  const [liked, setLiked] = useState(initiallyLiked);
  const [favorited, setFavorited] = useState(initiallyFavorited);
  const [likeLoading, setLikeLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  async function handleLike() {
    if (!user) {
      sileo.info({ title: "Log in to like this recipe" });
      return;
    }
    if (likeLoading) return;

    const prevLiked = liked;
    const prevCount = likesCount;

    // optimistic update
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setLikeLoading(true);

    try {
      await toggleLike(recipeId, prevLiked);
    } catch {
      // rollback
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleFavorite() {
    if (!user) {
      sileo.info({ title: "Log in to favorite this recipe" });
      return;
    }
    if (favoriteLoading) return;

    const prevFavorited = favorited;
    const prevCount = favoritesCount;

    setFavorited(!prevFavorited);
    setFavoritesCount(prevFavorited ? prevCount - 1 : prevCount + 1);
    setFavoriteLoading(true);

    try {
      await toggleFavorite(recipeId, prevFavorited);
    } catch {
      setFavorited(prevFavorited);
      setFavoritesCount(prevCount);
    } finally {
      setFavoriteLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-6 text-sm">
      <button
        onClick={handleLike}
        disabled={likeLoading}
        className={`transition ${
          liked ? "text-red-500" : "text-muted-foreground"
        } ${likeLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        ❤️ {likesCount}
      </button>

      <button
        onClick={handleFavorite}
        disabled={favoriteLoading}
        className={`transition ${
          favorited ? "text-yellow-500" : "text-muted-foreground"
        } ${favoriteLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        ⭐ {favoritesCount}
      </button>

      <span className="text-muted-foreground">💬 {commentsCount}</span>
    </div>
  );
}
