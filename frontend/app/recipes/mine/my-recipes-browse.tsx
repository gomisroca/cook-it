"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { get } from "@/services/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeCard from "@/components/recipe-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  initialData: Recipe[];
  initialCursor?: string;
}

export default function MyRecipesBrowse({ initialData, initialCursor }: Props) {
  const [recipes, setRecipes] = useState(initialData);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await get<PaginatedResponse<Recipe>>(
        `/recipes/mine${cursor ? `?cursor=${cursor}` : ""}`,
      );
      setRecipes((prev) => [...prev, ...res.data]);
      setCursor(res.cursor);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.8 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  if (recipes.length === 0 && !loading) {
    return (
      <div className="w-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-3">
        <span className="text-5xl">🍳</span>
        <h3 className="text-lg font-semibold">No recipes yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          You haven&apos;t created any recipes yet. Start cooking!
        </p>
        <Button asChild>
          <Link href="/recipes/create" className="gap-2">
            <Plus size={16} /> Create your first recipe
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <RecipeCard recipe={recipe} />
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {cursor && <div ref={loaderRef} className="h-10 mt-10" />}
    </>
  );
}
