"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { get } from "@/services/api-client";
import { useDebounce } from "@/hooks/use-debounce";

interface Props {
  selected: string[];
  onChange: (ingredients: string[]) => void;
}

export function IngredientAutocomplete({ selected, onChange }: Props) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const debouncedInput = useDebounce(input, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInput(value);
    if (!value) {
      setSuggestions([]);
      setOpen(false);
    }
  }

  useEffect(() => {
    if (!debouncedInput) return;
    let cancelled = false;

    get<string[]>(`/recipes/ingredients/suggestions?search=${debouncedInput}`)
      .then((res) => {
        if (!cancelled) {
          setSuggestions(res.filter((s) => !selected.includes(s)));
          setOpen(true);
        }
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [debouncedInput, selected]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function add(ingredient: string) {
    onChange([...selected, ingredient]);
    setInput("");
    setSuggestions([]);
    setOpen(false);
  }

  function remove(ingredient: string) {
    onChange(selected.filter((i) => i !== ingredient));
  }

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Selected pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((ingredient) => (
            <span
              key={ingredient}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary font-medium"
            >
              {ingredient}
              <button onClick={() => remove(ingredient)}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Input
          placeholder="e.g. chicken"
          value={input}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
        />

        {/* Dropdown */}
        {open && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-popover border rounded-xl shadow-md overflow-hidden">
            {suggestions.map((s) => (
              <li
                key={s}
                onMouseDown={() => add(s)}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-muted transition"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
