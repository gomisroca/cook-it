import { get } from "@/services/api-server";
import CollectionsClient from "./collections-client";
import { getCurrentUser } from "@/lib/auth";

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

export default async function CollectionsPage() {
  const currentUser = await getCurrentUser();

  const [publicCollections, myCollections] = await Promise.all([
    get<PaginatedResponse<CollectionData>>("/collections"),
    currentUser
      ? get<PaginatedResponse<CollectionData>>("/collections/mine")
      : Promise.resolve(null),
  ]);

  return (
    <div className="container mx-auto py-12 w-full max-w-7xl px-6">
      <h1 className="text-3xl font-bold mb-8">Collections</h1>
      <CollectionsClient
        initialPublic={publicCollections}
        initialMine={myCollections}
        currentUser={currentUser}
      />
    </div>
  );
}
