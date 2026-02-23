import { del, post } from "@/services/api-client";

function createToggle(endpoint: "like" | "favorite") {
  return async (recipeId: string, isActive: boolean) => {
    if (isActive) {
      return del(`/recipes/${recipeId}/${endpoint}`);
    }
    return post(`/recipes/${recipeId}/${endpoint}`);
  };
}

export const toggleLike = createToggle("like");
export const toggleFavorite = createToggle("favorite");
