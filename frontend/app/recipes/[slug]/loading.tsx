import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export default function RecipeLoading() {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <div className="space-y-6">
          <Skeleton className="w-full h-[400px] rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-5 w-full max-w-3xl" />
            <Skeleton className="h-5 w-1/2 max-w-3xl" />
            <div className="flex gap-2 items-center">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <div className="flex gap-6">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>

        <Separator />

        {/* Ingredients + Steps */}
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="rounded-2xl shadow-sm h-fit">
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-6 w-32" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <Skeleton className="h-6 w-32" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
