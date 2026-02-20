"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { sileo } from "sileo";
import { apiDelete, patch, post } from "@/services/api";
import { Ban, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface CommentsSectionProps {
  comments: RecipeComment[];
  recipeId: string;
}

export function CommentsSection({
  comments: initialComments,
  recipeId,
}: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  /* ----------------------------
     CREATE COMMENT (Optimistic)
  -----------------------------*/
  const handleCreate = async () => {
    if (!newComment.trim()) return;

    const tempId = nanoid();

    const optimisticComment: RecipeComment = {
      id: tempId,
      content: newComment,
      createdAt: new Date().toISOString(),
      user: {
        id: user!.id,
        username: user!.username ?? "You",
        email: "you@example.com",
        role: "USER",
      },
    };

    // Optimistically add
    setComments((prev) => [optimisticComment, ...prev]);
    setNewComment("");

    try {
      const res = await post<RecipeComment>(`/recipes/${recipeId}/comment`, {
        content: newComment,
      });
      console.log(res);

      // Replace temp with real
      setComments((prev) => prev.map((c) => (c.id === tempId ? res : c)));

      sileo.success({
        title: "Added your comment!",
        icon: <Check className="size-3.5" />,
      });
    } catch (err) {
      // Rollback
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      console.error(err);

      sileo.error({
        title: "Error adding comment",
        icon: <Ban className="size-3.5" />,
      });
    }
  };

  /* ----------------------------
     EDIT COMMENT (Optimistic)
  -----------------------------*/
  const handleEdit = async (id: string) => {
    const original = comments.find((c) => c.id === id);
    if (!original) return;

    // Optimistic update
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content: editingContent } : c)),
    );

    setEditingId(null);

    try {
      await patch(`/recipes/comments/${id}`, { content: editingContent });

      sileo.success({
        title: "Edited your comment!",
        icon: <Check className="size-3.5" />,
      });
    } catch {
      // Rollback if failed
      setComments((prev) => prev.map((c) => (c.id === id ? original : c)));

      sileo.error({
        title: "Error editing comment",
        icon: <Ban className="size-3.5" />,
      });
    }
  };

  /* ----------------------------
   DELETE COMMENT (Optimistic)
-----------------------------*/
  const handleDelete = async (id: string) => {
    const original = comments.find((c) => c.id === id);
    if (!original) return;

    // Optimistically remove
    setComments((prev) => prev.filter((c) => c.id !== id));

    try {
      await apiDelete(`/recipes/comments/${id}/`);

      sileo.success({
        title: "Deleted your comment",
        icon: <Check className="size-3.5" />,
      });
    } catch {
      // Rollback
      setComments((prev) => [original, ...prev]);

      sileo.error({
        title: "Error deleting comment",
        icon: <Ban className="size-3.5" />,
      });
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>

        {/* Add Comment */}
        {user?.id && (
          <div className="space-y-3">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleCreate}>Post Comment</Button>
            </div>
          </div>
        )}

        <Separator />

        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <AnimatePresence>
            <div className="space-y-6">
              {comments.map((comment) => {
                const isOwner = comment.user.id === user?.id;
                const isEditing = editingId === comment.id;

                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-4"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.user.avatarUrl ?? undefined} />
                      <AvatarFallback>
                        {comment.user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          {comment.user.username}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>

                          {isOwner && !isEditing && (
                            <>
                              <button
                                className="hover:text-foreground transition-colors"
                                onClick={() => {
                                  setEditingId(comment.id);
                                  setEditingContent(comment.content);
                                }}
                              >
                                Edit
                              </button>

                              <button
                                className="text-destructive hover:opacity-80 transition-opacity"
                                onClick={() => handleDelete(comment.id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEdit(comment.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p
                          className={cn(
                            "text-sm leading-relaxed",
                            "text-muted-foreground",
                          )}
                        >
                          {comment.content}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
