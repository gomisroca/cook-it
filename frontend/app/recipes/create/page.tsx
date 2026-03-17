import RecipeWizard from "@/components/recipe-wizard/recipe-wizard";

export default async function CreateRecipePage() {
  return (
    <div className="container mx-auto py-12 max-w-2xl w-full">
      <h1 className="text-3xl font-bold mb-8">Create Recipe</h1>
      <RecipeWizard mode="create" />
    </div>
  );
}
