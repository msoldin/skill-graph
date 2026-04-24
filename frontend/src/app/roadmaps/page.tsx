import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";
import { getRoadmaps } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function RoadmapsPage() {
  const roadmaps = await getRoadmaps();

  return (
    <div className="min-h-screen bg-[#f0ede8] dark:bg-stone-950">
      {/* Top nav */}
      <nav className="bg-white dark:bg-stone-900 border-b border-gray-200 dark:border-stone-700 px-6 py-3 shadow-sm flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-stone-100">Skill Graph</span>
        <ThemeToggle />
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-950 dark:text-stone-100 mb-2">
            Learning Roadmaps
          </h1>
          <p className="text-gray-600 dark:text-stone-400 text-base leading-relaxed max-w-xl">
            Browse curated learning paths, inspect the dependency graph, and jump
            straight into roadmap-scoped notes and references.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {roadmaps.map((roadmap) => (
            <Link
              key={roadmap.slug}
              href={`/roadmaps/${roadmap.slug}`}
              className="group block bg-white dark:bg-stone-800 rounded-2xl p-6 catalog-card"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold text-gray-950 dark:text-stone-100 leading-snug">
                  {roadmap.title}
                </h2>
                <span className="text-gray-300 dark:text-stone-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors text-lg shrink-0 mt-0.5">
                  →
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-stone-400 leading-relaxed line-clamp-2">
                {roadmap.description}
              </p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
