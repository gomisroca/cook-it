"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { get } from "@/services/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeCard from "@/components/recipe-card";

interface Props {
  initialData: Recipe[];
  initialCursor?: string;
}

export default function RecipeBrowse({ initialData, initialCursor }: Props) {
  const [recipes, setRecipes] = useState(initialData);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;

    setLoading(true);
    try {
      const res = await get<PaginatedResponse<Recipe>>(
        `/recipes?cursor=${cursor}`,
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
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.8 },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [loadMore]);

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

      {/* Skeleton Loader */}
      {loading && (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Intersection trigger */}
      {cursor && <div ref={loaderRef} className="h-10 mt-10" />}
    </>
  );
}
