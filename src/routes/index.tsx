import { createFileRoute } from "@tanstack/react-router";
import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { PageSections } from "@/components/landing/PageSections";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="relative min-h-screen bg-bg text-fg">
      <div className="atmosphere" aria-hidden />
      <NavBar />
      <Hero />
      <PageSections />
    </main>
  );
}
