import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextSSRPlugin as UploadThingSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { UploadThingRouter } from "@/app/api/uploadthing/core";
import localFont from "next/font/local";

const titleFont = localFont({
  src: "../public/fonts/LuckiestGuy.ttf",
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <UploadThingSSRPlugin
          routerConfig={extractRouterConfig(UploadThingRouter)}
        />
        <AuthProvider>
          <div className="min-h-screen bg-white">
            <header className="flex items-center justify-between py-4 px-5 sm:px-6 lg:px-8">
              <h1
                className={`${titleFont.className} text-5xl text-red-500 tracking-wide text-shadow-sm text-shadow-black -skew-x-6`}
              >
                Cook It!
              </h1>
            </header>
            <main className="flex items-center justify-center py-4 px-5 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
