import ReactMarkdown from "react-markdown";

import type { TopicAsset } from "@/lib/types";

export function TopicContent({ assets }: { assets: TopicAsset[] }) {
  const orderedAssets = [...assets].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.title.localeCompare(b.title);
  });

  if (orderedAssets.length === 0) {
    return (
      <section className="border border-dashed border-gray-200 dark:border-stone-700 rounded-2xl p-6 text-gray-400 dark:text-stone-500 text-sm">
        No study assets are attached to this topic yet.
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {orderedAssets.map((asset) => {
        if (asset.type === "markdown" && asset.body) {
          return (
            <article
              key={asset.id}
              className="border border-gray-100 dark:border-stone-800 rounded-2xl p-5"
            >
              <div className="text-xs font-medium uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-3">
                {asset.title}
              </div>
              <div className="prose prose-gray prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{asset.body}</ReactMarkdown>
              </div>
            </article>
          );
        }

        if (asset.type === "pdf" && asset.url) {
          return (
            <article
              key={asset.id}
              className="border border-gray-100 dark:border-stone-800 rounded-2xl p-5"
            >
              <div className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                PDF
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-stone-100 mb-2">
                {asset.title}
              </h2>
              <a
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Open PDF asset →
              </a>
            </article>
          );
        }

        return (
          <article
            key={asset.id}
            className="border border-red-200 dark:border-red-800 rounded-2xl p-5 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 text-sm"
          >
            Unsupported or incomplete asset: {asset.title}
          </article>
        );
      })}
    </div>
  );
}
