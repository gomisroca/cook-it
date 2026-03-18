import Link from "next/link";
import { Globe, Lock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CollectionData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  recipeCount: number;
  author: { username: string };
}

interface Props {
  collection: CollectionData;
  showAuthor?: boolean;
}

export default function CollectionCard({
  collection,
  showAuthor = false,
}: Props) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group block rounded-2xl border bg-card shadow-sm hover:shadow-md transition p-5 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-lg group-hover:underline line-clamp-1">
          {collection.name}
        </h3>
        <Badge variant="outline" className="gap-1 flex-shrink-0">
          {collection.isPublic ? <Globe size={10} /> : <Lock size={10} />}
          {collection.isPublic ? "Public" : "Private"}
        </Badge>
      </div>

      {collection.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {collection.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <BookOpen size={14} />
          {collection.recipeCount} recipes
        </span>
        {showAuthor && <span>by {collection.author.username}</span>}
      </div>
    </Link>
  );
}
