import { UseFormReturn, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import FormError from "@/components/ui/form-error";
import { cn } from "@/lib/utils";
import { RecipeFormData } from "../types";

interface Props {
  form: UseFormReturn<RecipeFormData>;
}

export function BasicInfoStep({ form }: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input
              {...register("title")}
              placeholder="e.g. Spaghetti Carbonara"
            />
            {errors.title && <FormError>{errors.title.message}</FormError>}
          </Field>
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              {...register("description")}
              placeholder="What makes this recipe special?"
              rows={3}
            />
            {errors.description && (
              <FormError>{errors.description.message}</FormError>
            )}
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <Field>
          <FieldLabel>Difficulty</FieldLabel>
          <select
            {...register("difficulty")}
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            )}
          >
            <option value="">Select difficulty</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
          {errors.difficulty && (
            <FormError>{errors.difficulty.message}</FormError>
          )}
        </Field>
      </FieldSet>

      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Servings</FieldLabel>
            <Input
              type="number"
              {...register("servings", { valueAsNumber: true })}
              className="w-24"
            />
          </Field>
          <Field>
            <FieldLabel>Prep Time (min)</FieldLabel>
            <Input
              type="number"
              {...register("prepTime", { valueAsNumber: true })}
            />
          </Field>
          <Field>
            <FieldLabel>Cooking Time (min)</FieldLabel>
            <Input
              type="number"
              {...register("cookingTime", { valueAsNumber: true })}
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <Controller
              control={control}
              name="isPublic"
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                />
              )}
            />
            <div>
              <FieldLabel className="cursor-pointer">Public recipe</FieldLabel>
              <p className="text-xs text-muted-foreground">
                Public recipes are visible to everyone
              </p>
            </div>
          </label>
        </Field>
      </FieldSet>
    </div>
  );
}
