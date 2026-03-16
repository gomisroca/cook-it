"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { get, patch } from "@/services/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import RecipeCard from "@/components/recipe-card";
import { UploadButton } from "@uploadthing/react";
import { UploadThingRouter } from "@/app/api/uploadthing/core";
import { sileo } from "sileo";
import { Pencil, X, Check, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface ProfileData {
  id: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  _count: {
    followers: number;
    following: number;
    likes: number;
    favorites: number;
  };
  recipes: PaginatedResponse<Recipe>;
}

interface Props {
  profile: ProfileData;
  isOwnProfile: boolean;
}

export default function ProfileClient({ profile, isOwnProfile }: Props) {
  const { setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [loading, setLoading] = useState(false);

  const [recipes, setRecipes] = useState(profile.recipes.data);
  const [cursor, setCursor] = useState<string | undefined>(
    profile.recipes.cursor,
  );
  const [recipesLoading, setRecipesLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (!cursor || recipesLoading) return;
    setRecipesLoading(true);
    try {
      const res = await get<PaginatedResponse<Recipe>>(
        `/users/${profile.username}/recipes?cursor=${cursor}`,
      );
      setRecipes((prev) => [...prev, ...res.data]);
      setCursor(res.cursor);
    } finally {
      setRecipesLoading(false);
    }
  }, [cursor, recipesLoading, profile.username]);

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

  async function handleSave() {
    setLoading(true);
    try {
      const updated = await patch<User>("/users/me", { bio, avatarUrl });
      setUser(updated);
      sileo.success({ title: "Profile updated!" });
      setEditing(false);
    } catch {
      sileo.error({ title: "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setBio(profile.bio ?? "");
    setAvatarUrl(profile.avatarUrl ?? "");
    setEditing(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl} alt={profile.username} />
            <AvatarFallback className="text-3xl font-bold">
              {profile.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {editing && (
            <div className="mt-2">
              <UploadButton<UploadThingRouter, "profilePicture">
                endpoint="profilePicture"
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.ufsUrl) setAvatarUrl(res[0].ufsUrl);
                }}
                appearance={{
                  button:
                    "text-xs h-7 px-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90",
                  allowedContent: "hidden",
                  container: "flex flex-col items-start",
                }}
                content={{
                  button({ ready }) {
                    return ready ? "Change photo" : "...";
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            {isOwnProfile && !editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="gap-1"
              >
                <Pencil size={14} /> Edit profile
              </Button>
            )}
          </div>

          {editing ? (
            <FieldSet>
              <Field>
                <FieldLabel>Bio</FieldLabel>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people a bit about yourself..."
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/160
                </p>
              </Field>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                  className="gap-1"
                >
                  <Check size={14} /> Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="gap-1"
                >
                  <X size={14} /> Cancel
                </Button>
              </div>
            </FieldSet>
          ) : (
            <p className="text-muted-foreground text-sm max-w-lg">
              {bio ||
                (isOwnProfile
                  ? "No bio yet — click Edit profile to add one."
                  : "")}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Users size={14} />
              <strong className="text-foreground">
                {profile._count.followers}
              </strong>{" "}
              followers
            </span>
            <span>
              <strong className="text-foreground">
                {profile._count.following}
              </strong>{" "}
              following
            </span>
            <Link
              href={`/users/${profile.username}/likes`}
              className="hover:text-foreground transition"
            >
              <strong className="text-foreground">
                {profile._count.likes ?? 0}
              </strong>{" "}
              likes
            </Link>
            <Link
              href={`/users/${profile.username}/favorites`}
              className="hover:text-foreground transition"
            >
              <strong className="text-foreground">
                {profile._count.favorites ?? 0}
              </strong>{" "}
              favorites
            </Link>
            <span>
              <strong className="text-foreground">{recipes.length}</strong>{" "}
              recipes
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Recipes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recipes</h2>
        {recipes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {isOwnProfile
              ? "You haven't created any recipes yet."
              : "No public recipes yet."}
          </p>
        ) : (
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

            {recipesLoading && (
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

            {cursor && <div ref={loaderRef} className="h-10 mt-4" />}
          </>
        )}
      </div>
    </div>
  );
}
