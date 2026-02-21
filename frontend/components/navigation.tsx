"use client";

import * as React from "react";
import localFont from "next/font/local";
import Link from "./ui/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  CookingPot,
  ForkKnifeCrossed,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { post } from "@/services/api";

const titleFont = localFont({
  src: "../public/fonts/LuckiestGuy.ttf",
});

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuth();

  const [open, setOpen] = React.useState(false);

  const navItems = [
    ...(user
      ? [
          {
            label: "Logout",
            href: "#",
            icon: LogOut,
            section: "Account",
            action: "logout",
          },
          {
            label: "Create",
            href: "/recipes/create",
            icon: CookingPot,
            section: "Recipes",
          },
        ]
      : [
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
        ]),

    {
      label: "Browse",
      href: "/recipes",
      icon: ForkKnifeCrossed,
      section: "Recipes",
    },
  ];

  const handleLogout = async () => {
    await post("/auth/logout");

    setUser(null);
    router.refresh();
  };

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
      <motion.aside
        onHoverStart={() => setOpen(true)}
        onHoverEnd={() => setOpen(false)}
        animate={{ width: open ? 256 : 80 }}
        transition={{ duration: 0.25 }}
        className="fixed left-0 top-0 hidden h-screen border-r bg-muted/30 xl:flex flex-col overflow-hidden justify-start"
      >
        {/* Logo */}
        <div className="h-24 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-3">
            <motion.span
              animate={{ opacity: open ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              className={`${titleFont.className}
                w-fit
                rounded p-4
                -skew-y-4 -skew-x-6
                cursor-pointer
                text-4xl text-red-500 tracking-wide text-shadow-sm text-shadow-black
                transition-all duration-150 ease-out
                 whitespace-nowrap
              `}
            >
              Cook It!
            </motion.span>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-6 px-2">
          {sections.map((section) => (
            <div key={section} className="space-y-2">
              {/* Section label */}
              <motion.p
                animate={{ opacity: open ? 1 : 0 }}
                transition={{ duration: 0.15 }}
                className="text-xs font-semibold uppercase text-muted-foreground px-3"
              >
                {section}
              </motion.p>

              <div
                className={cn(
                  "flex flex-col gap-1 items-start",
                  open && "*:w-full",
                )}
              >
                {navItems
                  .filter((item) => item.section === section)
                  .map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    const isLogout = item.action === "logout";

                    if (isLogout) {
                      return (
                        <button
                          key="logout"
                          onClick={handleLogout}
                          className={cn(
                            "cursor-pointer inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            "text-foreground hover:bg-white/70 hover:text-accent-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "disabled:pointer-events-none disabled:opacity-50",
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          {open && (
                            <span className="ml-3 text-sm whitespace-nowrap">
                              Logout
                            </span>
                          )}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-lg py-2 transition-colors",
                          open ? "px-3" : "justify-center",
                          active
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50",
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {open && (
                          <span className="ml-3 text-sm whitespace-nowrap">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>
      </motion.aside>

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
