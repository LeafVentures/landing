import { useEffect, useState, type ComponentType } from "react";
import { initShowClient } from "@/lib/show-runtime";

export function ForestHost() {
  const [Scene, setScene] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    initShowClient();
    let live = true;
    import("./ForestCanvas")
      .then((m) => {
        if (live) setScene(() => m.ForestCanvas);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, []);

  if (failed) {
    return <div className="pointer-events-none fixed inset-0 z-0 bg-bg" />;
  }
  if (!Scene) {
    return <div className="pointer-events-none fixed inset-0 z-0 bg-bg" />;
  }
  return <Scene />;
}
