import { env } from "@/env";
import { NextRequest } from "next/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

interface JwtValidateResponse {
  status: "success" | "error";
  data: {
    id: string;
    username: string;
    role: string;
    iat: number;
    exp: number;
  };
}

async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) throw new UploadThingError("Unauthorized");
  const token = authHeader.split(" ")[1];

  const res = await fetch(env.NEXT_PUBLIC_BACKEND_URL + "/auth/validate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new UploadThingError("Unauthorized");

  const { status, data } = (await res.json()) as JwtValidateResponse;

  if (status !== "success" || !data) throw new UploadThingError("Unauthorized");

  return { userId: data.id };
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
    .middleware(async ({ req }) => {
      return await verifyToken(req);
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
    .middleware(async ({ req }) => {
      return await verifyToken(req);
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
    .middleware(async ({ req }) => {
      return await verifyToken(req);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type UploadThingRouter = typeof UploadThingRouter;
