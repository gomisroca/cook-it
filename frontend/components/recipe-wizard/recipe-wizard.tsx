"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { sileo } from "sileo";
import { Ban, Check } from "lucide-react";
import { StepIndicator } from "./step-indicator";
import { BasicInfoStep } from "./steps/basic-info-step";
import { MediaStep } from "./steps/media-step";
import { IngredientsStep } from "./steps/ingredients-step";
import { StepsStep } from "./steps/steps-step";
import { TagsStep } from "./steps/tags-step";
import { RecipeFormData, defaultValues } from "./types";
import { recipeSchema } from "./schemas";
import { post, patch } from "@/services/api-client";
import { zodResolver } from "@hookform/resolvers/zod";

const STEPS = [
  { label: "Basics" },
  { label: "Media" },
  { label: "Ingredients" },
  { label: "Steps" },
  { label: "Tags" },
];

const stepFields: (keyof RecipeFormData)[][] = [
  [
    "title",
    "description",
    "difficulty",
    "isPublic",
    "servings",
    "prepTime",
    "cookingTime",
  ],
  [], // media
  ["ingredients"],
  ["steps"],
  [], // tags
];

interface Props {
  mode: "create" | "edit";
  initialData?: Partial<RecipeFormData>;
  recipeSlug?: string;
}

export default function RecipeWizard({ mode, initialData, recipeSlug }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RecipeFormData>({
    defaultValues: { ...defaultValues, ...initialData },
    resolver: zodResolver(recipeSchema),
    mode: "onTouched",
  });

  const { handleSubmit, trigger, setError } = form;

  async function handleNext() {
    const fields = stepFields[currentStep];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setCurrentStep((s) => s + 1);
  }

  function handleBack() {
    setCurrentStep((s) => s - 1);
  }

  const onSubmit = async (data: RecipeFormData) => {
    setSubmitting(true);
    try {
      if (mode === "create") {
        await post("/recipes", data);
        sileo.success({
          title: "Recipe created!",
          icon: <Check className="size-3.5" />,
        });
        router.push("/recipes");
      } else {
        const updated = await patch<Recipe>(`/recipes/${recipeSlug}`, data);
        sileo.success({
          title: "Recipe updated!",
          icon: <Check className="size-3.5" />,
        });
        router.push(`/recipes/${updated.slug}`);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.toLowerCase()
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message).toLowerCase()
            : "";
      if (message.includes("title") || message.includes("slug")) {
        setCurrentStep(0);
        setError("title", {
          type: "manual",
          message: "A recipe with this title already exists.",
        });
      } else {
        sileo.error({
          title:
            mode === "create"
              ? "Error creating recipe"
              : "Error updating recipe",
          icon: <Ban className="size-3.5" />,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const stepComponents = [
    <BasicInfoStep key="basic" form={form} />,
    <MediaStep key="media" form={form} />,
    <IngredientsStep key="ingredients" form={form} />,
    <StepsStep key="steps" form={form} />,
    <TagsStep key="tags" form={form} />,
  ];

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <div className="min-h-[400px]">{stepComponents[currentStep]}</div>

      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            disabled={submitting}
            onClick={handleSubmit(onSubmit)}
          >
            {submitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Recipe"
                : "Save Changes"}
          </Button>
        ) : (
          <Button type="button" onClick={handleNext}>
            Next
          </Button>
        )}
      </div>
    </form>
  );
}
