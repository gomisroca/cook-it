"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Props {
  expanded?: boolean;
}

export function SearchBar({ expanded }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("search") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (input) {
      params.set("search", input);
    } else {
      params.delete("search");
    }

    if (pathname === "/recipes") {
      router.push(`/recipes?${params.toString()}`);
    } else {
      router.push(`/recipes?${params.toString()}`);
    }

    setInput("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-2">
      {expanded ? (
        <div className="flex items-center gap-2 w-full rounded-lg border bg-background px-3 py-1.5 focus-within:ring-2 focus-within:ring-ring">
          <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search recipes..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      ) : (
        <button
          type="submit"
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-accent"
        >
          <Search className="h-5 w-5" />
        </button>
      )}
    </form>
  );
}
