"use client";

import { UseFormReturn, Controller } from "react-hook-form";
import { UploadButton } from "@uploadthing/react";
import { UploadThingRouter } from "@/app/api/uploadthing/core";
import Image from "next/image";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { RecipeFormData } from "../types";

interface Props {
  form: UseFormReturn<RecipeFormData>;
}

export function MediaStep({ form }: Props) {
  const { control, watch } = form;
  const coverImageUrl = watch("coverImageUrl");

  return (
    <div className="space-y-4">
      <FieldSet>
        <Field>
          <FieldLabel>Cover Image</FieldLabel>
          <p className="text-xs text-muted-foreground mb-2">
            A great cover image makes your recipe stand out.
          </p>
          <Controller
            control={control}
            name="coverImageUrl"
            render={({ field }) => (
              <UploadButton<UploadThingRouter, "recipeHeaderImage">
                endpoint="recipeHeaderImage"
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.ufsUrl) field.onChange(res[0].ufsUrl);
                }}
                appearance={{
                  button:
                    "flex flex-col items-center justify-center rounded-md text-xs w-full md:flex-row md:text-sm font-medium transition-colors " +
                    "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 " +
                    "h-9 px-4 py-2 ut-uploading:bg-primary/70 ut-uploading:cursor-not-allowed",
                  allowedContent: "text-xs text-muted-foreground mt-1",
                  container: "flex flex-col items-start w-full",
                }}
                content={{
                  button({ ready }) {
                    return ready ? "Upload Cover Image" : "Getting ready...";
                  },
                }}
              />
            )}
          />
          {coverImageUrl && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden mt-3">
              <Image
                src={coverImageUrl}
                alt="Cover preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </Field>
      </FieldSet>
    </div>
  );
}
