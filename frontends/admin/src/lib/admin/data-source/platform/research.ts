/** content-service: ресёрч, темы постов, инструкции и сборка проекта по AI. */

import { adminApiGet, adminApiSend } from "../api-client";
import type { PlatformPost } from "./types";

const base = "/api/admin/v1/projects/{project}/content";

export type PlatformResearchSource = {
  id: number;
  url: string;
  title: string | null;
  sub_query: string | null;
  position: number;
  indexed: boolean;
};

export type PlatformResearch = {
  id: number;
  query: string;
  offer: string | null;
  engine: string;
  status: string;
  status_label: string;
  progress_stage: string;
  progress_stage_label: string;
  sub_queries: string[];
  summary: string | null;
  error_message: string | null;
  sources_count: number;
  topics_count: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  sources: PlatformResearchSource[];
};

export type PlatformTopic = {
  id: number;
  research_id: number;
  title: string;
  rationale: string | null;
  category_id: number | null;
  suggested_category: string | null;
  status: string;
  status_label: string;
  post_id: number | null;
  created_at: string | null;
};

export type StartResearchBody = {
  query: string;
  offer?: string | null;
  engine?: string | null;
  sub_queries_count?: number | null;
  results_per_sub_query?: number | null;
};

export function listResearches(params?: { status?: string }) {
  const suffix = params?.status
    ? `?status=${encodeURIComponent(params.status)}`
    : "";
  return adminApiGet<PlatformResearch[]>(`${base}/research${suffix}`);
}

export function getResearch(id: number) {
  return adminApiGet<PlatformResearch>(`${base}/research/${id}`);
}

export function startResearch(body: StartResearchBody) {
  return adminApiSend<PlatformResearch>(`${base}/research`, {
    method: "POST",
    body,
  });
}

export function cancelResearch(id: number) {
  return adminApiSend<PlatformResearch>(`${base}/research/${id}/cancel`, {
    method: "POST",
  });
}

export function listResearchTopics(
  researchId: number,
  params?: { status?: string },
) {
  const suffix = params?.status
    ? `?status=${encodeURIComponent(params.status)}`
    : "";
  return adminApiGet<PlatformTopic[]>(
    `${base}/research/${researchId}/topics${suffix}`,
  );
}

export function listTopics(params?: { status?: string }) {
  const suffix = params?.status
    ? `?status=${encodeURIComponent(params.status)}`
    : "";
  return adminApiGet<PlatformTopic[]>(`${base}/topics${suffix}`);
}

export function extractTopics(researchId: number, maxCount?: number) {
  return adminApiSend<PlatformTopic[]>(
    `${base}/research/${researchId}/topics`,
    {
      method: "POST",
      body: maxCount ? { max_count: maxCount } : {},
    },
  );
}

export function rejectTopic(topicId: number) {
  return adminApiSend<PlatformTopic>(`${base}/topics/${topicId}/reject`, {
    method: "POST",
  });
}

export function generatePostFromTopic(topicId: number) {
  return adminApiSend<PlatformTopic>(`${base}/posts/generate`, {
    method: "POST",
    body: { topic_id: topicId },
  });
}

export function findPostByTopic(topic: PlatformTopic) {
  return topic.post_id == null
    ? Promise.resolve<PlatformPost | null>(null)
    : adminApiGet<PlatformPost>(`${base}/posts/${topic.post_id}`);
}
