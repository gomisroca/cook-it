"use client";

import { useEffect, useState } from "react";
import { Plus, BookMarked, Check, X, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { get, post, del } from "@/services/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { sileo } from "sileo";

interface Collection {
  id: string;
  name: string;
  slug: string;
  isPublic: boolean;
  recipeCount: number;
}

interface Props {
  recipeId: string;
}

export default function AddToCollection({ recipeId }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [inCollections, setInCollections] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    get<Collection[]>(`/collections/user/${user.id}`)
      .then(async (cols) => {
        setCollections(cols);
        // check which collections already have this recipe
        const recipeCollections = await get<{ collectionId: string }[]>(
          `/collections/recipe/${recipeId}`,
        ).catch(() => []);
        setInCollections(new Set(recipeCollections.map((r) => r.collectionId)));
      })
      .catch(console.error);
  }, [open, user, recipeId]);

  if (!user) return null;

  async function handleToggle(collection: Collection) {
    const isIn = inCollections.has(collection.id);
    try {
      if (isIn) {
        await del(`/collections/${collection.slug}/recipes/${recipeId}`);
        setInCollections((prev) => {
          const next = new Set(prev);
          next.delete(collection.id);
          return next;
        });
      } else {
        await post(`/collections/${collection.slug}/recipes/${recipeId}`);
        setInCollections((prev) => new Set(prev).add(collection.id));
      }
    } catch {
      sileo.error({ title: "Something went wrong" });
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const created = await post<Collection>("/collections", { name: newName });
      setCollections((prev) => [created, ...prev]);
      setNewName("");
      setCreating(false);
    } catch {
      sileo.error({ title: "Failed to create collection" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <Button onClick={() => setOpen((o) => !o)} className="gap-2">
        <BookMarked size={14} />
        Save
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 w-72 rounded-xl border bg-popover shadow-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
              Your collections
            </p>

            {collections.length === 0 && !creating && (
              <p className="text-sm text-muted-foreground px-1">
                No collections yet.
              </p>
            )}

            {collections.map((col) => {
              const isIn = inCollections.has(col.id);
              return (
                <button
                  key={col.id}
                  onClick={() => handleToggle(col)}
                  className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted transition"
                >
                  <span className="flex items-center gap-2">
                    {col.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                    {col.name}
                    <span className="text-xs text-muted-foreground">
                      {col.recipeCount}
                    </span>
                  </span>
                  {isIn && <Check size={14} className="text-primary" />}
                </button>
              );
            })}

            {creating ? (
              <div className="flex gap-2 pt-1">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Collection name"
                  className="h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <Button
                  size="sm"
                  className="h-8 px-2"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  <Check size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => setCreating(false)}
                >
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <Plus size={14} /> New collection
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
