import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextSSRPlugin as UploadThingSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { UploadThingRouter } from "@/app/api/uploadthing/core";
import localFont from "next/font/local";
import { Toaster } from "sileo";

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
        <Toaster position="top-right" />
        <UploadThingSSRPlugin
          routerConfig={extractRouterConfig(UploadThingRouter)}
        />
        <AuthProvider>
          <div
            className="
            min-h-screen 
            bg-white 
            bg-[linear-gradient(45deg,#f6f6f6_25%,transparent_25%),linear-gradient(-45deg,#f6f6f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f6f6f6_75%),linear-gradient(-45deg,transparent_75%,#f6f6f6_75%)] 
            bg-size-[120px_120px] 
            bg-position-[0_0,0_60px,60px_-60px,-60px_0px]"
          >
            <header className="flex items-center justify-between py-4 px-5 sm:px-6 lg:px-8">
              <h1
                className={`${titleFont.className} bg-white border-4 border-black rounded p-4 -skew-y-4 cursor-pointer active:scale-95 transition-transform text-5xl text-red-500 tracking-wide text-shadow-sm text-shadow-black -skew-x-6`}
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
