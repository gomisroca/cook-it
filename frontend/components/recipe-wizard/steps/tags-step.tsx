import { UseFormReturn, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { RecipeFormData } from "../types";

interface Props {
  form: UseFormReturn<RecipeFormData>;
}

export function TagsStep({ form }: Props) {
  const { control, watch } = form;
  const tags = watch("tags");

  return (
    <div className="space-y-4">
      <FieldSet>
        <Field>
          <FieldLabel>Tags</FieldLabel>
          <p className="text-xs text-muted-foreground mb-2">
            Add comma-separated tags to help people find your recipe.
          </p>
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <Input
                value={field.value.join(", ")}
                onChange={(e) =>
                  field.onChange(
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="e.g. italian, pasta, comfort food"
              />
            )}
          />
          {tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Field>
      </FieldSet>
    </div>
  );
}
