import * as z from "zod";

const optionalNumber = z.union([
  z.number(),
  z.nan().transform(() => undefined),
  z.undefined(),
]);

export const recipeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
    error: "Please select a difficulty",
  }),
  isPublic: z.boolean(),
  servings: optionalNumber,
  prepTime: optionalNumber,
  cookingTime: optionalNumber,
  coverImageUrl: z.string().optional(),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1, "Ingredient name is required"),
        quantity: optionalNumber,
        unit: z.string().optional(),
      }),
    )
    .min(1, "Add at least one ingredient"),
  steps: z
    .array(
      z.object({
        order: z.number(),
        instruction: z
          .string()
          .min(5, "Instruction must be at least 5 characters"),
        duration: optionalNumber,
        imageUrl: z.string().optional(),
      }),
    )
    .min(1, "Add at least one step"),
  tags: z.array(z.string()),
});
