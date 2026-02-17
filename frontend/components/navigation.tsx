"use client";

import * as React from "react";
import localFont from "next/font/local";
import Link from "./ui/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  CookingPot,
  ForkKnifeCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

const titleFont = localFont({
  src: "../public/fonts/LuckiestGuy.ttf",
});

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const navItems = [
    {
      label: "Login",
      href: "/login",
      icon: LogIn,
      section: "Account",
    },
    {
      label: "Register",
      href: "/register",
      icon: UserPlus,
      section: "Account",
    },
    {
      label: "Create",
      href: "/recipes/create",
      icon: CookingPot,
      section: "Recipes",
    },
    {
      label: "Browse",
      href: "/recipes",
      icon: ForkKnifeCrossed,
      section: "Recipes",
    },
  ];

  const sections = Array.from(new Set(navItems.map((item) => item.section)));

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed top-0 w-full flex items-center justify-between border-b bg-white z-10 px-4 py-3 xl:hidden">
        <Link href="/">
          <h1
            className={`${titleFont.className}
              w-fit
              bg-white border-4 border-black rounded p-2
              -skew-y-4 -skew-x-6
              cursor-pointer
              text-xl text-red-500 tracking-wide text-shadow-sm text-shadow-black
              shadow-[4px_4px_0px_black]
              transition-all duration-150 ease-out
              active:scale-95
              active:translate-y-0.5
              active:shadow-[2px_2px_0px_black]
            `}
          >
            Cook It!
          </h1>
        </Link>

        <button
          onClick={() => setOpen(true)}
          className="rounded-md border p-2 hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r bg-muted/30 xl:flex">
        <header className="flex items-center py-4 px-6">
          <Link href="/">
            <h1
              className={`${titleFont.className}
                w-fit
                bg-white border-4 border-black rounded p-4
                -skew-y-4 -skew-x-6
                cursor-pointer
                text-4xl text-red-500 tracking-wide text-shadow-sm text-shadow-black
                shadow-[6px_6px_0px_black]
                transition-all duration-150 ease-out
                active:scale-95
                active:translate-y-0.5
                active:shadow-[2px_2px_0px_black]
              `}
            >
              Cook It!
            </h1>
          </Link>
        </header>

        <nav className="mt-6 flex flex-1 flex-col gap-6 px-4">
          {sections.map((section) => (
            <div key={section} className="space-y-1">
              <p className="px-2 text-xs font-semibold uppercase text-muted-foreground">
                {section}
              </p>

              <div className="flex flex-col gap-1">
                {navItems
                  .filter((item) => item.section === section)
                  .map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "justify-start gap-2",
                          active && "bg-accent text-accent-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 h-fit w-full  border-r bg-background shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-6">
              <span className="font-semibold">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border p-2 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-6 p-4">
              {sections.map((section) => (
                <div key={section} className="space-y-1">
                  <p className="px-2 text-xs font-semibold uppercase text-muted-foreground">
                    {section}
                  </p>

                  <div className="flex flex-col gap-1">
                    {navItems
                      .filter((item) => item.section === section)
                      .map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "justify-start gap-2",
                              active && "bg-accent text-accent-foreground",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
