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

// FileRouter for your app, can contain multiple FileRoutes
export const UploadThingRouter = {
  profilePicture: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      return await verifyToken();
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.ufsUrl);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
  recipeHeaderImage: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      return await verifyToken();
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.ufsUrl);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
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
