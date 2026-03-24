import { get } from "@/services/api-server";
import ProfileClient from "./profile-client";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";

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

const getProfile = cache(async (username: string) => {
  return get<ProfileData>(`/users/${username}`).catch(() => null);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  const profile = await getProfile(username);
  if (!profile) return { title: "User not found" };

  return {
    title: `${profile.username} | Cook It!`,
    description: profile.bio ?? `${profile.username}'s recipes on Cook It!`,
    openGraph: {
      title: `${profile.username} | Cook It!`,
      description: profile.bio ?? `${profile.username}'s recipes on Cook It!`,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : [],
    },
    twitter: {
      card: "summary",
      title: `${profile.username} | Cook It!`,
      description: profile.bio ?? `${profile.username}'s recipes on Cook It!`,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  const [profile, currentUser] = await Promise.all([
    getProfile(username),
    getCurrentUser(),
  ]);
  if (!profile) notFound();

  const isOwnProfile = currentUser?.id === profile.id;
  return <ProfileClient profile={profile} isOwnProfile={isOwnProfile} />;
}
