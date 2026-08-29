/** content-service: реестр фоновых задач проекта. */

import { adminApiGet } from "../api-client";

const base = "/api/admin/v1/projects/{project}/content";

export type PlatformTaskState = "queued" | "running" | "succeeded" | "failed";

export type PlatformTask = {
  id: number;
  kind: string;
  state: PlatformTaskState;
  stage: string | null;
  subject_type: string | null;
  subject_id: string | null;
  failure_reason: string | null;
  queued_at: string | null;
  started_at: string | null;
  finished_at: string | null;
};

export type TaskFilter = {
  kind?: string;
  subjectType?: string;
  subjectId?: string;
};

export function listTasks(filter: TaskFilter = {}) {
  const params = new URLSearchParams();
  if (filter.kind) params.set("kind", filter.kind);
  if (filter.subjectType) params.set("subject_type", filter.subjectType);
  if (filter.subjectId) params.set("subject_id", filter.subjectId);

  const suffix = params.size > 0 ? `?${params.toString()}` : "";

  return adminApiGet<PlatformTask[]>(`${base}/tasks${suffix}`);
}
