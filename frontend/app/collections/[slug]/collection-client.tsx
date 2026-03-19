"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { del, patch, post } from "@/services/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Lock, Globe, Pencil, Check, X, Heart } from "lucide-react";
import RecipeCard from "@/components/recipe-card";
import { sileo } from "sileo";
import Link from "next/link";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { UploadButton } from "@uploadthing/react";
import { UploadThingRouter } from "@/app/api/uploadthing/core";
import Image from "next/image";

interface Props {
  collection: SingleCollectionData;
  isOwner: boolean;
}

interface EditFormData {
  name: string;
  description?: string;
  isPublic: boolean;
  coverImageUrl?: string;
}

export default function CollectionClient({
  collection: initial,
  isOwner,
}: Props) {
  const router = useRouter();
  const [collection, setCollection] = useState(initial);
  const [liked, setLiked] = useState(initial.isLiked);
  const [likesCount, setLikesCount] = useState(initial.likesCount);
  const [likeLoading, setLikeLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { register, control, handleSubmit, reset, setValue, watch } =
    useForm<EditFormData>({
      defaultValues: {
        name: collection.name,
        description: collection.description ?? "",
        isPublic: collection.isPublic,
        coverImageUrl: collection.coverImageUrl ?? "",
      },
    });

  const watchedCoverImageUrl = watch("coverImageUrl");

  async function onEditSubmit(data: EditFormData) {
    try {
      const updated = await patch<SingleCollectionData>(
        `/collections/${collection.slug}`,
        data,
      );
      setCollection((prev) => ({ ...prev, ...updated, recipes: prev.recipes }));
      setEditing(false);
      sileo.success({ title: "Collection updated!" });

      if (updated.slug !== collection.slug) {
        router.replace(`/collections/${updated.slug}`);
      }
    } catch {
      sileo.error({ title: "Failed to update collection" });
    }
  }

  function handleCancelEdit() {
    reset({
      name: collection.name,
      description: collection.description ?? "",
      isPublic: collection.isPublic,
    });
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setDeleteLoading(true);
    try {
      await del(`/collections/${collection.slug}`);
      sileo.success({ title: "Collection deleted" });
      router.push(`/users/${collection.author.username}`);
    } catch {
      sileo.error({ title: "Failed to delete collection" });
      setDeleteLoading(false);
    }
  }

  async function handleLike() {
    if (likeLoading) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => (wasLiked ? c - 1 : c + 1));
    setLikeLoading(true);
    try {
      await post(`/collections/${collection.slug}/like`);
    } catch {
      setLiked(wasLiked);
      setLikesCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setLikeLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 w-full">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          {editing ? (
            <form
              onSubmit={handleSubmit(onEditSubmit)}
              className="flex-1 space-y-3"
            >
              <FieldSet>
                <Field>
                  <FieldLabel>Cover Image</FieldLabel>
                  <UploadButton<UploadThingRouter, "collectionHeaderImage">
                    endpoint="collectionHeaderImage"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.ufsUrl)
                        setValue("coverImageUrl", res[0].ufsUrl);
                    }}
                    appearance={{
                      button:
                        "text-xs h-8 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90",
                      allowedContent: "hidden",
                      container: "flex flex-col items-start",
                    }}
                    content={{
                      button({ ready }) {
                        return ready ? "Upload cover image" : "...";
                      },
                    }}
                  />
                  {watchedCoverImageUrl && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden mt-2">
                      <Image
                        src={watchedCoverImageUrl}
                        alt="Cover"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </Field>
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input {...register("name")} />
                </Field>
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea {...register("description")} rows={2} />
                </Field>
                <Field>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Controller
                      control={control}
                      name="isPublic"
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                        />
                      )}
                    />
                    <div>
                      <FieldLabel className="cursor-pointer">
                        Public collection
                      </FieldLabel>
                      <p className="text-xs text-muted-foreground">
                        Public collections are visible to everyone
                      </p>
                    </div>
                  </label>
                </Field>
              </FieldSet>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="gap-1">
                  <Check size={14} /> Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="gap-1"
                >
                  <X size={14} /> Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{collection.name}</h1>
                <Badge variant="outline" className="gap-1">
                  {collection.isPublic ? (
                    <Globe size={12} />
                  ) : (
                    <Lock size={12} />
                  )}
                  {collection.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                by{" "}
                <Link
                  href={`/users/${collection.author.username}`}
                  className="hover:underline"
                >
                  {collection.author.username}
                </Link>{" "}
                · {collection.recipeCount} recipes
              </p>
              {collection.description && (
                <p className="text-muted-foreground">
                  {collection.description}
                </p>
              )}
            </div>
          )}

          {isOwner && !editing && (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="gap-1"
              >
                <Pencil size={14} /> Edit
              </Button>
              <Button
                variant={confirming ? "destructive" : "outline"}
                size="sm"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="gap-2"
              >
                <Trash2 size={14} />
                {confirming ? "Are you sure?" : "Delete"}
              </Button>
            </div>
          )}
          {!isOwner && collection.isPublic && (
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition
                ${
                  liked
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "border-border text-muted-foreground hover:border-red-200 hover:text-red-500"
                }
                ${likeLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Heart size={14} className={liked ? "fill-red-500" : ""} />
              {likesCount}
            </button>
          )}
        </div>
      </div>

      {collection.recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
          <span className="text-5xl">📚</span>
          <h3 className="text-lg font-semibold">No recipes yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Add recipes to this collection from any recipe page.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {collection.recipes.map((recipe, index) => (
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
      )}
    </div>
  );
}
