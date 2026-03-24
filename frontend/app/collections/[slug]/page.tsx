import { get } from "@/services/api-server";
import { notFound } from "next/navigation";
import CollectionClient from "./collection-client";
import { getCurrentUser } from "@/lib/auth";
import { Metadata } from "next";
import { cache } from "react";

const getCollection = cache(async (slug: string) => {
  return get<SingleCollectionData>(`/collections/${slug}`).catch(() => null);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return { title: "Collection not found" };

  const description =
    collection.description ??
    `A collection of recipes by ${collection.author.username}`;
  const image = collection.coverImageUrl ?? "/placeholder-recipe.jpg";

  return {
    title: `${collection.name} | Cook It!`,
    description,
    openGraph: {
      title: collection.name,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: collection.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: collection.name,
      description,
      images: [image],
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [collection, currentUser] = await Promise.all([
    getCollection(slug),
    getCurrentUser(),
  ]);

  if (!collection) notFound();

  const isOwner = currentUser?.id === collection.author.id;
  return <CollectionClient collection={collection} isOwner={isOwner} />;
}
