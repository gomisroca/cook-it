import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextSSRPlugin as UploadThingSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { UploadThingRouter } from "@/app/api/uploadthing/core";
import { Toaster } from "sileo";
import Navigation from "@/components/navigation";

export const metadata: Metadata = {
  title: "Cook It!",
  description: "The world's recipes, at your fingertips.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="
            overflow-x-hidden
            relative
            min-h-screen 
            bg-white 
            bg-[linear-gradient(45deg,#f6f6f6_25%,transparent_25%),linear-gradient(-45deg,#f6f6f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f6f6f6_75%),linear-gradient(-45deg,transparent_75%,#f6f6f6_75%)] 
            bg-size-[120px_120px] 
            bg-position-[0_0,0_60px,60px_-60px,-60px_0px]"
      >
        <Toaster
          position="top-center"
          options={{
            styles: { description: "font-medium flex justify-center" },
          }}
        />
        <UploadThingSSRPlugin
          routerConfig={extractRouterConfig(UploadThingRouter)}
        />

        <AuthProvider>
          <Navigation />
          <main className="flex items-center justify-center py-4 px-5 sm:px-6 xl:px-8 mt-26 mb-10 lg:my-10 w-fit bg-white mx-auto rounded-md shadow-sm">
            {children}
          </main>
          <div id="modal-root" />
          {modal}
        </AuthProvider>
      </body>
    </html>
  );
}
