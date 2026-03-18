import { get } from "@/services/api-server";
import { notFound } from "next/navigation";
import CollectionClient from "./collection-client";
import { getCurrentUser } from "@/lib/auth";

interface CollectionData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  author: User;
  recipeCount: number;
  recipes: Recipe[];
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [collection, currentUser] = await Promise.all([
    get<CollectionData>(`/collections/${slug}`).catch(() => null),
    getCurrentUser(),
  ]);

  if (!collection) notFound();

  const isOwner = currentUser?.id === collection.author.id;

  return <CollectionClient collection={collection} isOwner={isOwner} />;
}
