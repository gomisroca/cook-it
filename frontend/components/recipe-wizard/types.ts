import { z } from "zod";
import { recipeSchema } from "./schemas";

export type RecipeFormData = z.infer<typeof recipeSchema>;

export const defaultValues: RecipeFormData = {
  title: "",
  description: "",
  isPublic: true,
  coverImageUrl: "",
  difficulty: "EASY",
  servings: undefined,
  prepTime: undefined,
  cookingTime: undefined,
  ingredients: [{ name: "", quantity: undefined, unit: "" }],
  steps: [{ order: 1, instruction: "", duration: undefined, imageUrl: "" }],
  tags: [],
};
