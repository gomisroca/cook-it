import * as React from "react";
import NextLink, { LinkProps } from "next/link";
import { cn } from "@/lib/utils";

interface AppLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
}

export const Link = React.forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <NextLink
        ref={ref}
        {...props}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          "text-foreground hover:bg-white/70 hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        {children}
      </NextLink>
    );
  },
);

Link.displayName = "Link";

export default Link;
