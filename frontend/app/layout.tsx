import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextSSRPlugin as UploadThingSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { UploadThingRouter } from "@/app/api/uploadthing/core";

export const metadata: Metadata = {
  title: "Cook It!",
  description: "The world's recipes, at your fingertips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <UploadThingSSRPlugin
          routerConfig={extractRouterConfig(UploadThingRouter)}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
