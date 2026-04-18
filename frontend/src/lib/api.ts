import type { ApiErrorBody, RoadmapGraph, RoadmapSummary, TopicContent } from "@/lib/types";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export function resolveApiBaseUrl(isBrowser: boolean, backendBaseUrl?: string) {
  if (isBrowser) {
    return "";
  }

  return backendBaseUrl ?? "http://localhost:8080";
}

function getApiBaseUrl() {
  return resolveApiBaseUrl(typeof window !== "undefined", process.env.BACKEND_BASE_URL);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store"
  });

  if (!response.ok) {
    let message = `Request failed for ${path}`;
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body.message) {
        message = body.message;
      }
    } catch {
      // Ignore non-JSON error payloads and keep the fallback message.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export function getRoadmaps() {
  return request<RoadmapSummary[]>("/api/roadmaps");
}

export function getRoadmap(slug: string) {
  return request<RoadmapSummary>(`/api/roadmaps/${slug}`);
}

export function getRoadmapGraph(slug: string) {
  return request<RoadmapGraph>(`/api/roadmaps/${slug}/graph`);
}

export function getTopicContent(roadmapSlug: string, topicSlug: string) {
  return request<TopicContent>(`/api/roadmaps/${roadmapSlug}/topics/${topicSlug}`);
}
