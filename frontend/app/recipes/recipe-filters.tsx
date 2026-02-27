"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TagMultiselect } from "@/components/tag-multiselect";
import { IngredientAutocomplete } from "@/components/ingredient-autocomplete";

export interface RecipeFilters {
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  maxCookingTime?: number;
  maxPrepTime?: number;
  ingredients: string[];
  tags: string[];
}

export const defaultFilters: RecipeFilters = {
  ingredients: [],
  tags: [],
};

interface Props {
  filters: RecipeFilters;
  onChange: (filters: RecipeFilters) => void;
}

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

export function RecipeFilters({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    filters.difficulty,
    filters.maxCookingTime,
    filters.maxPrepTime,
    ...filters.ingredients,
    ...filters.tags,
  ].filter(Boolean).length;

  function update(partial: Partial<RecipeFilters>) {
    onChange({ ...filters, ...partial });
  }

  function clear() {
    onChange(defaultFilters);
  }

  return (
    <div className="border rounded-2xl bg-card shadow-sm mb-8">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          Filters
          {activeCount > 0 && <Badge variant="secondary">{activeCount}</Badge>}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t pt-4">
          {/* Difficulty */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Difficulty
            </p>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() =>
                    update({
                      difficulty: filters.difficulty === d ? undefined : d,
                    })
                  }
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition
                    ${
                      filters.difficulty === d
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-transparent hover:border-primary"
                    }`}
                >
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Max Cooking Time */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Max cooking time
              {filters.maxCookingTime ? ` — ${filters.maxCookingTime} min` : ""}
            </p>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={filters.maxCookingTime ?? 120}
              onChange={(e) =>
                update({
                  maxCookingTime:
                    Number(e.target.value) === 120
                      ? undefined
                      : Number(e.target.value),
                })
              }
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Max Prep Time */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Max prep time
              {filters.maxPrepTime ? ` — ${filters.maxPrepTime} min` : ""}
            </p>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={filters.maxPrepTime ?? 60}
              onChange={(e) =>
                update({
                  maxPrepTime:
                    Number(e.target.value) === 60
                      ? undefined
                      : Number(e.target.value),
                })
              }
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Ingredients
            </p>
            <IngredientAutocomplete
              selected={filters.ingredients}
              onChange={(ingredients) => update({ ingredients })}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tags
            </p>
            <TagMultiselect
              selected={filters.tags}
              onChange={(tags) => update({ tags })}
            />
          </div>

          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clear} className="gap-1">
              <X size={14} /> Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
