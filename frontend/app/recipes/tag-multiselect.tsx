"use client";

import { useEffect, useState } from "react";
import { get } from "@/services/api-client";

interface Props {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function TagMultiselect({ selected, onChange }: Props) {
  const [tags, setTags] = useState<RecipeTag[]>([]);

  useEffect(() => {
    get<RecipeTag[]>("/tags").then(setTags).catch(console.error);
  }, []);

  function toggle(tagName: string) {
    onChange(
      selected.includes(tagName)
        ? selected.filter((t) => t !== tagName)
        : [...selected, tagName],
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => toggle(tag.name)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition
            ${
              selected.includes(tag.name)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-transparent hover:border-primary"
            }`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
