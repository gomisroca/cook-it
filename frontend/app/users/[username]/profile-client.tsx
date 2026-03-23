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
import {
  Pencil,
  X,
  Check,
  Users,
  Heart,
  BookOpen,
  Star,
  UserCheck,
  BookMarked,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormError from "@/components/ui/form-error";
import { KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import CollectionCard from "@/components/collection-card";

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
  initialCollections: PaginatedResponse<CollectionData>;
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export default function ProfileClient({
  profile,
  isOwnProfile,
  initialCollections,
}: Props) {
  const { setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [loading, setLoading] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Recipes
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

  // Collections
  const [collections, setCollections] = useState(initialCollections.data);
  const [collectionsCursor, setCollectionsCursor] = useState(
    initialCollections.cursor,
  );
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const collectionsLoaderRef = useRef<HTMLDivElement | null>(null);

  const loadMoreCollections = useCallback(async () => {
    if (!collectionsCursor || collectionsLoading) return;
    setCollectionsLoading(true);
    try {
      const res = await get<PaginatedResponse<CollectionData>>(
        `/collections/user/${profile.username}?cursor=${collectionsCursor}`,
      );
      setCollections((prev) => [...prev, ...res.data]);
      setCollectionsCursor(res.cursor);
    } finally {
      setCollectionsLoading(false);
    }
  }, [collectionsCursor, collectionsLoading, profile.username]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreCollections();
      },
      { threshold: 0.8 },
    );
    if (collectionsLoaderRef.current)
      observer.observe(collectionsLoaderRef.current);
    return () => observer.disconnect();
  }, [loadMoreCollections]);

  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function handleChangePassword(data: ChangePasswordData) {
    setPasswordLoading(true);
    try {
      await patch("/users/me/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      sileo.success({ title: "Password changed successfully!" });
      setChangingPassword(false);
      passwordForm.reset();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to change password";
      passwordForm.setError("currentPassword", { message });
    } finally {
      setPasswordLoading(false);
    }
  }

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

          <div className="flex flex-wrap gap-4 pt-1">
            {/* Social */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users size={14} />
                <strong className="text-foreground">
                  {profile._count.followers}
                </strong>{" "}
                followers
              </span>
              <span className="flex items-center gap-1">
                <UserCheck size={14} />
                <strong className="text-foreground">
                  {profile._count.following}
                </strong>{" "}
                following
              </span>
            </div>

            <span className="text-muted-foreground/40 text-sm">|</span>

            {/* Recipes */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen size={14} />
                <strong className="text-foreground">
                  {recipes.length}
                </strong>{" "}
                recipes
              </span>
              <Link
                href={`/users/${profile.username}/likes`}
                className="flex items-center gap-1 hover:text-foreground transition"
              >
                <Heart size={14} />
                <strong className="text-foreground">
                  {profile._count.likes ?? 0}
                </strong>{" "}
                likes
              </Link>
              <Link
                href={`/users/${profile.username}/favorites`}
                className="flex items-center gap-1 hover:text-foreground transition"
              >
                <Star size={14} />
                <strong className="text-foreground">
                  {profile._count.favorites ?? 0}
                </strong>{" "}
                favorites
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Separator />
      {isOwnProfile && (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Security</h2>
              {!changingPassword && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChangingPassword(true)}
                  className="gap-1"
                >
                  <KeyRound size={14} /> Change password
                </Button>
              )}
            </div>

            {changingPassword && (
              <form
                onSubmit={(e) => e.preventDefault()}
                className="border rounded-xl p-4 space-y-4 max-w-md"
              >
                <FieldSet>
                  <Field>
                    <FieldLabel>Current password</FieldLabel>
                    <Input
                      type="password"
                      {...passwordForm.register("currentPassword")}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <FormError>
                        {passwordForm.formState.errors.currentPassword.message}
                      </FormError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>New password</FieldLabel>
                    <Input
                      type="password"
                      {...passwordForm.register("newPassword")}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <FormError>
                        {passwordForm.formState.errors.newPassword.message}
                      </FormError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Confirm new password</FieldLabel>
                    <Input
                      type="password"
                      {...passwordForm.register("confirmPassword")}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <FormError>
                        {passwordForm.formState.errors.confirmPassword.message}
                      </FormError>
                    )}
                  </Field>
                </FieldSet>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={passwordForm.handleSubmit(handleChangePassword)}
                    disabled={passwordLoading}
                    className="gap-1"
                  >
                    <Check size={14} />
                    {passwordLoading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setChangingPassword(false);
                      passwordForm.reset();
                    }}
                    className="gap-1"
                  >
                    <X size={14} /> Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          <Separator />
        </>
      )}

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

      <Separator />

      {/* Collections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Collections</h2>
          {isOwnProfile && (
            <Button asChild variant="outline" size="sm" className="gap-1">
              <Link href="/collections">
                <BookMarked size={14} /> Manage
              </Link>
            </Button>
          )}
        </div>

        {collections.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {isOwnProfile
              ? "You haven't created any collections yet."
              : "No public collections yet."}
          </p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection, index) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <CollectionCard collection={collection} />
                </motion.div>
              ))}
            </div>

            {collectionsLoading && (
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

            {collectionsCursor && (
              <div ref={collectionsLoaderRef} className="h-10" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
