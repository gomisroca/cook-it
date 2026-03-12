"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { del, post } from "@/services/api-client";

interface Props {
  authorId: string;
  initialIsFollowing: boolean;
}

export default function FollowButton({ authorId, initialIsFollowing }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  if (!user) return null;
  if (user.id === authorId) return null;

  const handleFollow = async () => {
    const prevFollowing = isFollowing;

    setIsFollowing(!isFollowing);

    startTransition(async () => {
      try {
        if (prevFollowing) {
          await del(`/users/follow/${authorId}`);
        } else {
          await post(`/users/follow/${authorId}`);
        }
        router.refresh();
      } catch (err) {
        console.error(err);
        setIsFollowing(prevFollowing);
      }
    });
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={isPending}
      variant={isFollowing ? "outline" : "default"}
      className={isPending ? "opacity-50 cursor-not-allowed" : ""}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
