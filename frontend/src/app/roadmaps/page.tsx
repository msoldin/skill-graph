import Link from "next/link";

import { getRoadmaps } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function RoadmapsPage() {
  const roadmaps = await getRoadmaps();

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <nav className="border-b border-gray-100 px-6 py-3">
        <span className="text-sm font-semibold text-gray-900">Skill Graph</span>
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Learning Roadmaps
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl">
            Browse curated learning paths, inspect the dependency graph, and jump
            straight into roadmap-scoped notes and references.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {roadmaps.map((roadmap) => (
            <Link
              key={roadmap.slug}
              href={`/roadmaps/${roadmap.slug}`}
              className="group block bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold text-gray-900 leading-snug">
                  {roadmap.title}
                </h2>
                <span className="text-gray-300 group-hover:text-blue-400 transition-colors text-lg shrink-0 mt-0.5">
                  →
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">
                {roadmap.description}
              </p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
