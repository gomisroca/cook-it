import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 py-24">
      <span className="text-6xl">🍽️</span>
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground max-w-sm">
        Looks like this page got eaten. We couldn&apos;t find what you were
        looking for.
      </p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
