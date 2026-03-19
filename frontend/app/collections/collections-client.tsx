"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { get, post } from "@/services/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Check } from "lucide-react";
import { sileo } from "sileo";
import CollectionCard from "@/components/collection-card";
import { useRouter } from "next/navigation";

interface CollectionData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  recipeCount: number;
  author: { username: string };
  coverImageUrl?: string;
  likesCount: number;
  isLiked: boolean;
}

interface Props {
  initialPublic: PaginatedResponse<CollectionData>;
  initialMine: PaginatedResponse<CollectionData> | null;
  currentUser: User | null;
}

export default function CollectionsClient({
  initialPublic,
  initialMine,
  currentUser,
}: Props) {
  const router = useRouter();

  // My collections state
  const [myCollections, setMyCollections] = useState(initialMine?.data ?? []);
  const [myCursor, setMyCursor] = useState(initialMine?.cursor);
  const [myLoading, setMyLoading] = useState(false);
  const myLoaderRef = useRef<HTMLDivElement | null>(null);

  // Public collections state
  const [publicCollections, setPublicCollections] = useState(
    initialPublic.data,
  );
  const [publicCursor, setPublicCursor] = useState(initialPublic.cursor);
  const [publicLoading, setPublicLoading] = useState(false);
  const publicLoaderRef = useRef<HTMLDivElement | null>(null);

  // Create collection state
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const loadMoreMine = useCallback(async () => {
    if (!myCursor || myLoading) return;
    setMyLoading(true);
    try {
      const res = await get<PaginatedResponse<CollectionData>>(
        `/collections/mine?cursor=${myCursor}`,
      );
      setMyCollections((prev) => [...prev, ...res.data]);
      setMyCursor(res.cursor);
    } finally {
      setMyLoading(false);
    }
  }, [myCursor, myLoading]);

  const loadMorePublic = useCallback(async () => {
    if (!publicCursor || publicLoading) return;
    setPublicLoading(true);
    try {
      const res = await get<PaginatedResponse<CollectionData>>(
        `/collections?cursor=${publicCursor}`,
      );
      setPublicCollections((prev) => [...prev, ...res.data]);
      setPublicCursor(res.cursor);
    } finally {
      setPublicLoading(false);
    }
  }, [publicCursor, publicLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreMine();
      },
      { threshold: 0.8 },
    );
    if (myLoaderRef.current) observer.observe(myLoaderRef.current);
    return () => observer.disconnect();
  }, [loadMoreMine]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMorePublic();
      },
      { threshold: 0.8 },
    );
    if (publicLoaderRef.current) observer.observe(publicLoaderRef.current);
    return () => observer.disconnect();
  }, [loadMorePublic]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreateLoading(true);
    try {
      const created = await post<CollectionData>("/collections", {
        name: newName,
      });
      setMyCollections((prev) => [created, ...prev]);
      setNewName("");
      setCreating(false);
      sileo.success({ title: "Collection created!" });
      router.push(`/collections/${created.slug}`);
    } catch {
      sileo.error({ title: "Failed to create collection" });
    } finally {
      setCreateLoading(false);
    }
  }

  return (
    <div className="space-y-12">
      {/* My Collections */}
      {currentUser && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Collections</h2>
            {!creating ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreating(true)}
                className="gap-1"
              >
                <Plus size={14} /> New Collection
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Collection name"
                  className="h-8 text-sm w-48"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <Button
                  size="sm"
                  className="h-8 px-2"
                  onClick={handleCreate}
                  disabled={createLoading}
                >
                  <Check size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => {
                    setCreating(false);
                    setNewName("");
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            )}
          </div>

          {myCollections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 border rounded-2xl">
              <span className="text-4xl">📚</span>
              <p className="text-muted-foreground text-sm">
                You don&apos;t have any collections yet.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreating(true)}
                className="gap-1"
              >
                <Plus size={14} /> Create your first collection
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myCollections.map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <CollectionCard collection={collection} />
                  </motion.div>
                ))}
              </div>

              {myLoading && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border p-5 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ))}
                </div>
              )}

              {myCursor && <div ref={myLoaderRef} className="h-10" />}
            </>
          )}
        </section>
      )}

      {/* Public Collections */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Discover Collections</h2>

        {publicCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 border rounded-2xl">
            <span className="text-4xl">🌍</span>
            <p className="text-muted-foreground text-sm">
              No public collections yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publicCollections.map((collection, index) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <CollectionCard collection={collection} showAuthor />
                </motion.div>
              ))}
            </div>

            {publicLoading && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {publicCursor && <div ref={publicLoaderRef} className="h-10" />}
          </>
        )}
      </section>
    </div>
  );
}
