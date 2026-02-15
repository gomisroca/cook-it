import { JwtPayload } from "@/contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

async function verifyToken() {
  const token = localStorage.getItem("token");
  if (!token) throw new UploadThingError("Unauthorized: No token");

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      throw new UploadThingError("Unauthorized: Token expired");
    }

    return { userId: decoded.id };
  } catch {
    throw new UploadThingError("Unauthorized: Invalid token");
  }
}

export const UploadThingRouter = {
  profilePicture: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      return await verifyToken();
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
  recipeHeaderImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      return await verifyToken();
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
  recipeStepImage: f({
    image: {
      maxFileSize: "1MB",
      maxFileCount: 10,
    },
  })
    .middleware(async () => {
      return await verifyToken();
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type UploadThingRouter = typeof UploadThingRouter;
