import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "./ui/card";

export function BikeCardSkeleton() {
  return (
    <Card className="w-full max-w-[300px] overflow-hidden rounded-[12px] border-0 shadow-sm">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <CardContent className="p-0">
        <div className="flex flex-col gap-2 px-3 py-3">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
        <div className="px-3 pb-3 pt-0">
          <Skeleton className="h-7 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}
