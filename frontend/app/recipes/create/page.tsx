"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import { UploadThingRouter } from "@/app/api/uploadthing/core";
import Image from "next/image";
import { post } from "@/services/api";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { renameFiles } from "@/lib/rename-files";

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

export default function CreateRecipeForm() {
  const router = useRouter();
  const { register, control, handleSubmit, watch } = useForm<RecipeFormData>({
    defaultValues: {
      ingredients: [{ name: "", quantity: undefined, unit: "" }],
      steps: [{ order: 1, instruction: "", duration: undefined, imageUrl: "" }],
      tags: [],
    },
  });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

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
      await post("/recipes", data);
      alert("Recipe created!");
      router.push("/recipes"); // redirect to recipe listing
    } catch (err) {
      console.error(err);
      alert("Error creating recipe");
    }
  };

  if (!token) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 rounded-md">
      {/* Title & Slug */}
      <FieldGroup>
        <Field>
          <FieldLabel>Title</FieldLabel>
          <Input {...register("title")} className="input mt-1 w-full" />
        </Field>

        {/* Description */}
        <Field>
          <FieldLabel>Description</FieldLabel>
          <Textarea {...register("description")} />
        </Field>
      </FieldGroup>

      {/* Cover Image */}

      <Field>
        <FieldLabel>Cover Image</FieldLabel>
        <Controller
          control={control}
          name="coverImageUrl"
          render={({ field }) => (
            <UploadButton<UploadThingRouter, "recipeHeaderImage">
              endpoint="recipeHeaderImage"
              headers={{
                Authorization: `Bearer ${token}`,
              }}
              onBeforeUploadBegin={(files) => {
                return renameFiles(files);
              }}
              onClientUploadComplete={(res) => {
                if (res?.[0]?.ufsUrl) field.onChange(res[0].ufsUrl);
              }}
            />
          )}
        />
        {watch("coverImageUrl") && (
          <div className="w-24 h-16">
            <Image
              src={watch("coverImageUrl") as string}
              alt="step"
              width={100}
              height={100}
              className="object-cover rounded mt-1 mx-auto"
            />
          </div>
        )}
      </Field>

      {/* Difficulty */}
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

      {/* Servings & Time */}
      <FieldGroup>
        <Field>
          <FieldLabel>Servings</FieldLabel>
          <Input
            type="number"
            {...register("servings")}
            className="input mt-1 w-24"
          />
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

      {/* Ingredients */}
      <div>
        <h3 className="font-semibold mb-2">Ingredients</h3>
        {ingredientFields.map((field, idx) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <Input
              {...register(`ingredients.${idx}.name` as const)}
              placeholder="Name"
              className="input flex-1"
            />
            <Input
              {...register(`ingredients.${idx}.quantity` as const)}
              placeholder="Qty"
              type="number"
              className="input w-20"
            />
            <Input
              {...register(`ingredients.${idx}.unit` as const)}
              placeholder="Unit"
              className="input w-20"
            />
            <button
              type="button"
              onClick={() => removeIngredient(idx)}
              className="btn-red"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            appendIngredient({ name: "", quantity: undefined, unit: "" })
          }
          className="btn"
        >
          Add Ingredient
        </button>
      </div>

      {/* Steps */}
      <div>
        <h3 className="font-semibold mb-2">Steps</h3>
        {stepFields.map((field, idx) => (
          <FieldGroup key={field.id} className="flex gap-2 mb-2 items-start">
            <Field className="flex-1">
              <Input
                {...register(`steps.${idx}.instruction` as const)}
                placeholder="Instruction"
                className="input w-full"
              />
              <Input
                {...register(`steps.${idx}.duration` as const)}
                placeholder="Duration (min)"
                type="number"
                className="input w-32 mt-1"
              />
            </Field>
            <Field>
              <Controller
                control={control}
                name={`steps.${idx}.imageUrl` as const}
                render={({ field }) => (
                  <UploadButton<UploadThingRouter, "recipeStepImage">
                    endpoint="recipeStepImage"
                    headers={{
                      Authorization: `Bearer ${token}`,
                    }}
                    onBeforeUploadBegin={(files) => {
                      return renameFiles(files);
                    }}
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.ufsUrl) field.onChange(res[0].ufsUrl);
                    }}
                  />
                )}
              />
              {watch(`steps.${idx}.imageUrl`) && (
                <div className="w-24 h-16">
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
        >
          Add Step
        </Button>
      </div>

      {/* Tags */}
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
              className="input mt-1 w-full"
            />
          )}
        />
      </Field>

      <Button type="submit" className="mt-6">
        Create Recipe
      </Button>
    </form>
  );
}
