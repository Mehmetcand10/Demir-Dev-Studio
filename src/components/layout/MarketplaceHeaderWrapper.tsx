import { Suspense } from "react";
import { MarketplaceHeader } from "./MarketplaceHeader";

type Props = {
  user: { id: string; email?: string } | null;
  userRole: string;
  cartInitialCount: number;
};

function HeaderFallback() {
  return (
    <div className="h-20 border-b border-slate-200 bg-white sm:h-24">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center px-3 sm:px-4">
        <div className="h-9 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mx-3 h-10 max-w-3xl flex-1 animate-pulse rounded-md bg-slate-100" />
        <div className="h-9 w-20 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

export function MarketplaceHeaderWrapper(props: Props) {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <MarketplaceHeader {...props} />
    </Suspense>
  );
}
