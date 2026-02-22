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

  if (!user) return null; // hide if not logged in
  if (user.id === authorId) return null; // prevent self-follow

  const handleFollow = async () => {
    startTransition(async () => {
      try {
        if (isFollowing) {
          await del(`/users/follow/${authorId}`);
          setIsFollowing(false);
        } else {
          await post(`/users/follow/${authorId}`);
          setIsFollowing(true);
        }

        router.refresh(); // keep server in sync
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <Button onClick={handleFollow} disabled={isPending}>
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
