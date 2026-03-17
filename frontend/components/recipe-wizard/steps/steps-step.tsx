"use client";

import { UseFormReturn, useFieldArray, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldLabel, FieldSet } from "@/components/ui/field";
import FormError from "@/components/ui/form-error";
import { Trash2 } from "lucide-react";
import { UploadButton } from "@uploadthing/react";
import { UploadThingRouter } from "@/app/api/uploadthing/core";
import Image from "next/image";
import { RecipeFormData } from "../types";

interface Props {
  form: UseFormReturn<RecipeFormData>;
}

export function StepsStep({ form }: Props) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "steps" });

  return (
    <div className="space-y-4">
      <FieldSet>
        <FieldLabel>Steps</FieldLabel>
        <div className="space-y-6">
          {fields.map((field, idx) => (
            <div key={field.id} className="border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {idx + 1}
                </span>
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

              <Input
                {...register(`steps.${idx}.instruction`)}
                placeholder="Describe this step..."
              />
              {errors.steps?.[idx]?.instruction && (
                <FormError>{errors.steps[idx].instruction?.message}</FormError>
              )}

              <Input
                {...register(`steps.${idx}.duration`, { valueAsNumber: true })}
                placeholder="Duration (min)"
                type="number"
                className="w-36"
              />

              <Controller
                control={control}
                name={`steps.${idx}.imageUrl`}
                render={({ field }) => (
                  <>
                    <UploadButton<UploadThingRouter, "recipeStepImage">
                      endpoint="recipeStepImage"
                      onClientUploadComplete={(res) => {
                        if (res?.[0]?.ufsUrl) field.onChange(res[0].ufsUrl);
                      }}
                      appearance={{
                        button:
                          "text-xs h-8 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 ut-uploading:bg-primary/70 ut-uploading:cursor-not-allowed",
                        allowedContent: "text-xs text-muted-foreground mt-1",
                        container: "flex flex-col items-start",
                      }}
                      content={{
                        button({ ready }) {
                          return ready ? "Upload step image" : "...";
                        },
                      }}
                    />
                    {watch(`steps.${idx}.imageUrl`) && (
                      <div className="relative w-full h-40 rounded-xl overflow-hidden">
                        <Image
                          src={watch(`steps.${idx}.imageUrl`) as string}
                          alt={`Step ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </>
                )}
              />
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              order: fields.length + 1,
              instruction: "",
              duration: undefined,
              imageUrl: "",
            })
          }
          className="mt-2"
        >
          + Add Step
        </Button>
      </FieldSet>
    </div>
  );
}
