import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RecipeNotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 py-24">
      <span className="text-6xl">🥘</span>
      <h1 className="text-2xl font-bold">Recipe not found</h1>
      <p className="text-muted-foreground max-w-sm">
        This recipe may have been deleted or the link is incorrect.
      </p>
      <Button asChild>
        <Link href="/recipes">Browse recipes</Link>
      </Button>
    </div>
  );
}
