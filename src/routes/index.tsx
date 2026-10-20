import { createFileRoute } from "@tanstack/react-router";
import { ForestHost } from "@/components/scene/ForestHost";
import { NavBar } from "@/components/landing/NavBar";
import { ShowOverlay } from "@/components/landing/ShowOverlay";
import { PageSections } from "@/components/landing/PageSections";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="relative min-h-screen bg-bg text-fg">
      <ForestHost />
      <NavBar />
      <ShowOverlay />
      <PageSections />
    </main>
  );
}
