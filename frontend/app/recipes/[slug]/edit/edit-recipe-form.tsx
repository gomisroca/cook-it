"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import { UploadThingRouter } from "@/app/api/uploadthing/core";
import Image from "next/image";
import { patch } from "@/services/api-client";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { renameFiles } from "@/lib/rename-files";
import { sileo } from "sileo";
import { Ban, Check } from "lucide-react";

interface Ingredient {
  name: string;
  quantity?: number;
  unit?: string;
}

interface Step {
  order: number;
  instruction: string;
  duration?: number;
  imageUrl?: string;
}

interface RecipeFormData {
  title: string;
  description?: string;
  coverImageUrl?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  servings?: number;
  prepTime?: number;
  cookingTime?: number;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
}

interface Props {
  recipe: Recipe & {
    ingredients: Ingredient[];
    steps: Step[];
    tags: { id: string; name: string }[];
  };
}

export default function EditRecipeForm({ recipe }: Props) {
  const router = useRouter();

  const { register, control, handleSubmit, watch } = useForm<RecipeFormData>({
    defaultValues: {
      title: recipe.title,
      description: recipe.description ?? "",
      coverImageUrl: recipe.coverImageUrl ?? "",
      difficulty: recipe.difficulty,
      servings: recipe.servings ?? undefined,
      prepTime: recipe.prepTime ?? undefined,
      cookingTime: recipe.cookingTime ?? undefined,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      tags: recipe.tags.map((t) => t.name),
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: "ingredients" });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({ control, name: "steps" });

  const onSubmit = async (data: RecipeFormData) => {
    try {
      const updated = await patch<Recipe>(`/recipes/slug/${recipe.slug}`, data);
      sileo.success({
        title: "Recipe updated!",
        icon: <Check className="size-3.5" />,
      });
      // redirect to new slug in case title changed
      router.push(`/recipes/${updated.slug}`);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Error updating recipe",
        icon: <Ban className="size-3.5" />,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-md space-y-4 overflow-x-hidden"
    >
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input {...register("title")} className="input mt-1 w-full" />
          </Field>
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea {...register("description")} />
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator className="my-2" />

      <FieldSet>
        <Field>
          <FieldLabel>Cover Image</FieldLabel>
          <Controller
            control={control}
            name="coverImageUrl"
            render={({ field }) => (
              <UploadButton<UploadThingRouter, "recipeHeaderImage">
                endpoint="recipeHeaderImage"
                onBeforeUploadBegin={renameFiles}
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.ufsUrl) field.onChange(res[0].ufsUrl);
                }}
                appearance={{
                  button:
                    "flex flex-col items-center justify-center rounded-md text-xs w-full md:flex-row md:text-sm font-medium transition-colors " +
                    "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 " +
                    "h-9 px-4 py-2 " +
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
                    "disabled:pointer-events-none disabled:opacity-50 " +
                    "ut-uploading:bg-primary/70 ut-uploading:cursor-not-allowed",
                  allowedContent: "text-xs text-muted-foreground mt-1",
                  container: "flex flex-col items-start",
                }}
                content={{
                  button({ ready }) {
                    return ready ? (
                      <div>Upload Cover Image</div>
                    ) : (
                      "Getting ready..."
                    );
                  },
                }}
              />
            )}
          />
          {watch("coverImageUrl") && (
            <div className="w-24 h-fit">
              <Image
                src={watch("coverImageUrl") as string}
                alt="cover"
                width={100}
                height={100}
                className="object-cover rounded mt-1"
              />
            </div>
          )}
        </Field>
      </FieldSet>
      <FieldSeparator className="my-2" />

      <FieldSet>
        <Field>
          <FieldLabel>Difficulty</FieldLabel>
          <select
            {...register("difficulty")}
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            )}
          >
            <option value="">Select</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </Field>
      </FieldSet>
      <FieldSeparator className="my-2" />

      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Servings</FieldLabel>
            <Input type="number" {...register("servings")} className="w-24" />
          </Field>
          <Field>
            <FieldLabel>Prep Time (min)</FieldLabel>
            <Input type="number" {...register("prepTime")} />
          </Field>
          <Field>
            <FieldLabel>Cooking Time (min)</FieldLabel>
            <Input type="number" {...register("cookingTime")} />
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator className="my-2" />

      <FieldSet>
        <FieldLabel>Ingredients</FieldLabel>
        {ingredientFields.map((field, idx) => (
          <div key={field.id} className="flex flex-wrap gap-2 mb-2">
            <Input
              {...register(`ingredients.${idx}.name`)}
              placeholder="Name"
              className="flex-1"
            />
            <Input
              {...register(`ingredients.${idx}.quantity`)}
              placeholder="Qty"
              type="number"
              className="w-20"
            />
            <Input
              {...register(`ingredients.${idx}.unit`)}
              placeholder="Unit"
              className="w-20"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => removeIngredient(idx)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={() =>
            appendIngredient({ name: "", quantity: undefined, unit: "" })
          }
          className="w-fit"
        >
          Add Ingredient
        </Button>
      </FieldSet>
      <FieldSeparator className="my-2" />

      <FieldSet>
        <FieldLabel>Steps</FieldLabel>
        {stepFields.map((field, idx) => (
          <FieldGroup key={field.id} className="flex-wrap">
            <Field className="flex-1">
              <Input
                {...register(`steps.${idx}.instruction`)}
                placeholder="Instruction"
                className="w-full"
              />
              <Input
                {...register(`steps.${idx}.duration`)}
                placeholder="Duration (min)"
                type="number"
                className="w-32 mt-1"
              />
            </Field>
            <Field>
              <Controller
                control={control}
                name={`steps.${idx}.imageUrl`}
                render={({ field }) => (
                  <UploadButton<UploadThingRouter, "recipeStepImage">
                    endpoint="recipeStepImage"
                    onBeforeUploadBegin={renameFiles}
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.ufsUrl) field.onChange(res[0].ufsUrl);
                    }}
                    appearance={{
                      button:
                        "flex flex-col items-center justify-center rounded-md w-full text-xs md:flex-row md:text-sm font-medium transition-colors " +
                        "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 " +
                        "h-9 px-4 py-2 " +
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
                        "disabled:pointer-events-none disabled:opacity-50 " +
                        "ut-uploading:bg-primary/70 ut-uploading:cursor-not-allowed",
                      allowedContent: "text-xs text-muted-foreground mt-1",
                      container: "flex flex-col items-start",
                    }}
                    content={{
                      button({ ready }) {
                        return ready ? (
                          <div>Upload Step Image</div>
                        ) : (
                          "Getting ready..."
                        );
                      },
                    }}
                  />
                )}
              />
              {watch(`steps.${idx}.imageUrl`) && (
                <div className="w-24 h-fit">
                  <Image
                    src={watch(`steps.${idx}.imageUrl`) as string}
                    alt="step"
                    width={100}
                    height={100}
                    className="object-cover rounded mt-1 mx-auto"
                  />
                </div>
              )}
            </Field>
            <Button variant="secondary" onClick={() => removeStep(idx)}>
              Remove
            </Button>
          </FieldGroup>
        ))}
        <Button
          type="button"
          onClick={() =>
            appendStep({
              order: stepFields.length + 1,
              instruction: "",
              duration: undefined,
              imageUrl: "",
            })
          }
          className="w-fit"
        >
          Add Step
        </Button>
      </FieldSet>
      <FieldSeparator className="my-2" />

      <FieldSet>
        <Field>
          <FieldLabel>Tags (comma separated)</FieldLabel>
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <Input
                value={field.value.join(", ")}
                onChange={(e) =>
                  field.onChange(e.target.value.split(",").map((t) => t.trim()))
                }
              />
            )}
          />
        </Field>
      </FieldSet>

      <Button type="submit" className="mt-6 w-full text-lg">
        Save Changes
      </Button>
    </form>
  );
}
