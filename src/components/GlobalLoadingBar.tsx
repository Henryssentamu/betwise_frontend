import { useEffect, useState } from "react";
import { subscribeToLoading } from "../lib/api";

export default function GlobalLoadingBar() {
  const [loading, setLoading] = useState(false);

  useEffect(() => subscribeToLoading(setLoading), []);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[100] overflow-hidden bg-ink-hairline/40 pointer-events-none">
      <div className="h-full w-1/3 bg-ticker loading-bar-sweep" />
    </div>
  );
}
