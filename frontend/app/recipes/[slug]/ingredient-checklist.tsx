"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function IngredientChecklist({
  ingredients,
  recipeId,
}: {
  ingredients: Recipe["ingredients"];
  recipeId: string;
}) {
  const STORAGE_KEY = `ingredient-checklist-${recipeId}`;

  const [checked, setChecked] = useState<boolean[]>(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
    return new Array(ingredients.length).fill(false);
  });

  // Persist state to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggle = (index: number) => {
    setChecked((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const allChecked = checked.every(Boolean);
  const toggleAll = () => {
    const newState = allChecked
      ? new Array(ingredients.length).fill(false)
      : new Array(ingredients.length).fill(true);
    setChecked(newState);
  };

  return (
    <Card className="rounded-2xl shadow-sm h-fit">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col justify-start items-start">
          <h2 className="text-xl font-semibold">Ingredients</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={toggleAll}>
              {allChecked ? "Uncheck All" : "Check All"}
            </Button>
            {allChecked && (
              <Badge variant="secondary" className="uppercase text-xs">
                Ready ✅
              </Badge>
            )}
          </div>
        </div>

        <ul className="space-y-3 text-sm">
          {ingredients.map((i, idx) => (
            <AnimatePresence key={i.id}>
              <motion.li
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-[32px_80px_1fr] gap-3 items-center"
              >
                {/* Checkbox */}
                <Checkbox
                  checked={checked[idx]}
                  onCheckedChange={() => toggle(idx)}
                  className="scale-110"
                />

                {/* Amount */}
                <span className="font-medium text-right whitespace-nowrap">
                  {i.quantity} {i.unit}
                </span>

                {/* Ingredient Name */}
                <span
                  className={`break-words transition-all duration-200 ${
                    checked[idx] ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {i.name}
                </span>
              </motion.li>
            </AnimatePresence>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
