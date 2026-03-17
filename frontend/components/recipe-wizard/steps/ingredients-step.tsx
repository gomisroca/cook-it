import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldLabel, FieldSet } from "@/components/ui/field";
import FormError from "@/components/ui/form-error";
import { Trash2 } from "lucide-react";
import { RecipeFormData } from "../types";

interface Props {
  form: UseFormReturn<RecipeFormData>;
}

export function IngredientsStep({ form }: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  return (
    <div className="space-y-4">
      <FieldSet>
        <FieldLabel>Ingredients</FieldLabel>
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex flex-wrap gap-2 items-start">
              <div className="flex-1 min-w-32">
                <Input
                  {...register(`ingredients.${idx}.name`)}
                  placeholder="Name"
                />
                {errors.ingredients?.[idx]?.name && (
                  <FormError>{errors.ingredients[idx].name?.message}</FormError>
                )}
              </div>
              <Input
                {...register(`ingredients.${idx}.quantity`, {
                  valueAsNumber: true,
                })}
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
                variant="ghost"
                size="sm"
                onClick={() => remove(idx)}
                disabled={fields.length === 1}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
        {errors.ingredients?.root && (
          <FormError>{errors.ingredients.root.message}</FormError>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: "", quantity: undefined, unit: "" })}
          className="mt-2"
        >
          + Add Ingredient
        </Button>
      </FieldSet>
    </div>
  );
}
