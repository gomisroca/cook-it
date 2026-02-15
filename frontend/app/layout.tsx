import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextSSRPlugin as UploadThingSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { UploadThingRouter } from "@/app/api/uploadthing/core";
import localFont from "next/font/local";

const titleFont = localFont({
  src: "./LuckiestGuy.ttf",
});

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
        <AuthProvider>
          <div className={titleFont.className}>
            <h1 className="text-5xl text-red-500 tracking-wide px-5 text-shadow-sm text-shadow-black">
              Cook It!
            </h1>
          </div>

          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
