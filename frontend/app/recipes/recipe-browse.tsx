"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { get } from "@/services/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeCard from "@/components/recipe-card";
import { defaultFilters, RecipeFilters } from "./recipe-filters";
import { useDebounce } from "@/hooks/use-debounce";

interface Props {
  initialData: Recipe[];
  initialCursor?: string;
}

function buildQuery(filters: RecipeFilters, cursor?: string) {
  const params = new URLSearchParams();
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.maxCookingTime)
    params.set("maxCookingTime", String(filters.maxCookingTime));
  if (filters.maxPrepTime)
    params.set("maxPrepTime", String(filters.maxPrepTime));
  filters.ingredients.forEach((i) => params.append("ingredients", i));
  filters.tags.forEach((t) => params.append("tags", t));
  if (cursor) params.set("cursor", cursor);
  return `/recipes?${params.toString()}`;
}

export default function RecipeBrowse({ initialData, initialCursor }: Props) {
  const [recipes, setRecipes] = useState(initialData);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<RecipeFilters>(defaultFilters);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const debouncedFilters = useDebounce(filters, 400);

  // Re-fetch from scratch when filters change
  useEffect(() => {
    let cancelled = false;
    async function fetchFiltered() {
      setLoading(true);
      try {
        const res = await get<PaginatedResponse<Recipe>>(
          buildQuery(debouncedFilters),
        );
        if (!cancelled) {
          setRecipes(res.data);
          setCursor(res.cursor);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchFiltered();
    return () => {
      cancelled = true;
    };
  }, [debouncedFilters]);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await get<PaginatedResponse<Recipe>>(
        buildQuery(debouncedFilters, cursor),
      );
      setRecipes((prev) => [...prev, ...res.data]);
      setCursor(res.cursor);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, debouncedFilters]);

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

  return (
    <>
      <RecipeFilters filters={filters} onChange={setFilters} />

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
          {Array.from({ length: 6 }).map((_, i) => (
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
