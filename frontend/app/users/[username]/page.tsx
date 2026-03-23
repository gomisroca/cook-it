import { get } from "@/services/api-server";
import ProfileClient from "./profile-client";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";

export interface ProfileData {
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
  collections: PaginatedResponse<CollectionData>;
}

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  const [profile, currentUser] = await Promise.all([
    get<ProfileData>(`/users/${username}`).catch(() => null),
    getCurrentUser(),
  ]);
  if (!profile) notFound();

  const isOwnProfile = currentUser?.id === profile.id;

  return <ProfileClient profile={profile} isOwnProfile={isOwnProfile} />;
}
