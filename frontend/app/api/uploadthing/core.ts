import { getCurrentUser } from "@/lib/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

async function verifyRequest() {
  const user = await getCurrentUser();
  if (!user) throw new UploadThingError("Unauthorized");
  return { userId: user.id };
}

export const UploadThingRouter = {
  profilePicture: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(verifyRequest)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  collectionHeaderImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(verifyRequest)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  recipeHeaderImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(verifyRequest)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  recipeStepImage: f({ image: { maxFileSize: "1MB", maxFileCount: 1 } })
    .middleware(verifyRequest)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type UploadThingRouter = typeof UploadThingRouter;
