// АВТОГЕНЕРАЦИЯ из openapi/openapi.json — не редактировать руками.
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch } from './client';

export function useAuthForgotApiAdminV1AuthForgotPasswordMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/auth/forgot-password`, { method: 'POST', body }) });
}

export function useAuthLoginApiAdminV1AuthLoginMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/auth/login`, { method: 'POST', body }) });
}

export function useAuthLogoutApiAdminV1AuthLogoutMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/auth/logout`, { method: 'POST', body }) });
}

export function useAuthResetApiAdminV1AuthResetPasswordMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/auth/reset-password`, { method: 'POST', body }) });
}

export function useAuthInvokeApiAdminV1BootstrapQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authInvokeApiAdminV1Bootstrap'], queryFn: () => apiFetch(`/api/admin/v1/bootstrap`), ...options });
}

export function useAuthMeApiAdminV1MeQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authMeApiAdminV1Me'], queryFn: () => apiFetch(`/api/admin/v1/me`), ...options });
}

export function useAuthUpdateProfileApiAdminV1MeMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/me`, { method: 'PATCH', body }) });
}

export function useAuthIndexApiAdminV1ProjectsQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authIndexApiAdminV1Projects'], queryFn: () => apiFetch(`/api/admin/v1/projects`), ...options });
}

export function useAuthStoreApiAdminV1ProjectsMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects`, { method: 'POST', body }) });
}

export function useAuthShowApiAdminV1ProjectsProjectQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authShowApiAdminV1ProjectsProject', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}`), ...options });
}

export function useAuthUpdateApiAdminV1ProjectsProjectMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}`, { method: 'PATCH', body }) });
}

export function useAnalyticsExportApiAdminV1ProjectsProjectAnalyticsExportMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/analytics/export`, { method: 'POST', body }) });
}

export function useAnalyticsHistoryApiAdminV1ProjectsProjectAnalyticsHistorySubjectkeyQuery(project: string | number, subjectKey: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['analyticsHistoryApiAdminV1ProjectsProjectAnalyticsHistorySubjectkey', project, subjectKey], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/analytics/history/${subjectKey}`), ...options });
}

export function useAnalyticsOverviewApiAdminV1ProjectsProjectAnalyticsOverviewQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['analyticsOverviewApiAdminV1ProjectsProjectAnalyticsOverview', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/analytics/overview`), ...options });
}

export function useAnalyticsRevenueApiAdminV1ProjectsProjectAnalyticsRevenueQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['analyticsRevenueApiAdminV1ProjectsProjectAnalyticsRevenue', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/analytics/revenue`), ...options });
}

export function useAnalyticsShowApiAdminV1ProjectsProjectAnalyticsSettingsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['analyticsShowApiAdminV1ProjectsProjectAnalyticsSettings', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/analytics/settings`), ...options });
}

export function useAnalyticsUpdateApiAdminV1ProjectsProjectAnalyticsSettingsMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/analytics/settings`, { method: 'PUT', body }) });
}

export function useAnalyticsTopPagesApiAdminV1ProjectsProjectAnalyticsTopPagesQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['analyticsTopPagesApiAdminV1ProjectsProjectAnalyticsTopPages', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/analytics/top-pages`), ...options });
}

export function useAuthIndexApiAdminV1ProjectsProjectApiKeysQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authIndexApiAdminV1ProjectsProjectApiKeys', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/api-keys`), ...options });
}

export function useAuthStoreApiAdminV1ProjectsProjectApiKeysMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/api-keys`, { method: 'POST', body }) });
}

export function useAuthDestroyApiAdminV1ProjectsProjectApiKeysKeyMutation(project: string | number, key: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/api-keys/${key}`, { method: 'DELETE', body }) });
}

export function useAuthArchiveApiAdminV1ProjectsProjectArchiveMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/archive`, { method: 'POST', body }) });
}

export function useAuthIndexApiAdminV1ProjectsProjectAuditQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authIndexApiAdminV1ProjectsProjectAudit', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/audit`), ...options });
}

export function useContentShowApiAdminV1ProjectsProjectContentBuildoutQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentShowApiAdminV1ProjectsProjectContentBuildout', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/buildout`), ...options });
}

export function useContentStoreApiAdminV1ProjectsProjectContentBuildoutMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/buildout`, { method: 'POST', body }) });
}

export function useContentIndexApiAdminV1ProjectsProjectContentCategoriesQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentCategories', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/categories`), ...options });
}

export function useContentStoreApiAdminV1ProjectsProjectContentCategoriesMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/categories`, { method: 'POST', body }) });
}

export function useContentPurgeApiAdminV1ProjectsProjectContentCategoriesMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/categories`, { method: 'DELETE', body }) });
}

export function useContentBulkDestroyApiAdminV1ProjectsProjectContentCategoriesBulkDeleteMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/categories/bulk-delete`, { method: 'POST', body }) });
}

export function useContentUpdateApiAdminV1ProjectsProjectContentCategoriesCategoryMutation(project: string | number, category: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/categories/${category}`, { method: 'PUT', body }) });
}

export function useContentDestroyApiAdminV1ProjectsProjectContentCategoriesCategoryMutation(project: string | number, category: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/categories/${category}`, { method: 'DELETE', body }) });
}

export function useContentMoveApiAdminV1ProjectsProjectContentCategoriesCategoryMoveMutation(project: string | number, category: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/categories/${category}/move`, { method: 'POST', body }) });
}

export function useContentIndexApiAdminV1ProjectsProjectContentImagesSearchQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentImagesSearch', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/images/search`), ...options });
}

export function useContentIndexApiAdminV1ProjectsProjectContentInstructsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentInstructs', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/instructs`), ...options });
}

export function useContentStoreApiAdminV1ProjectsProjectContentInstructsMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/instructs`, { method: 'POST', body }) });
}

export function useContentCategoriesApiAdminV1ProjectsProjectContentInstructsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentCategoriesApiAdminV1ProjectsProjectContentInstructs', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/instructs/categories`), ...options });
}

export function useContentSchemaPresetsApiAdminV1ProjectsProjectContentInstructsSchemaPresetsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentSchemaPresetsApiAdminV1ProjectsProjectContentInstructsSchemaPresets', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/instructs/schema-presets`), ...options });
}

export function useContentShowApiAdminV1ProjectsProjectContentInstructsInstructQuery(project: string | number, instruct: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentShowApiAdminV1ProjectsProjectContentInstructsInstruct', project, instruct], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/instructs/${instruct}`), ...options });
}

export function useContentUpdateApiAdminV1ProjectsProjectContentInstructsInstructMutation(project: string | number, instruct: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/instructs/${instruct}`, { method: 'PUT', body }) });
}

export function useContentDestroyApiAdminV1ProjectsProjectContentInstructsInstructMutation(project: string | number, instruct: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/instructs/${instruct}`, { method: 'DELETE', body }) });
}

export function useContentIndexApiAdminV1ProjectsProjectContentLocalizationsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentLocalizations', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/localizations`), ...options });
}

export function useContentIndexApiAdminV1ProjectsProjectContentMediaQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentMedia', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/media`), ...options });
}

export function useContentStoreApiAdminV1ProjectsProjectContentMediaMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/media`, { method: 'POST', body }) });
}

export function useContentImportApiAdminV1ProjectsProjectContentMediaImportMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/media/import`, { method: 'POST', body }) });
}

export function useContentIndexApiAdminV1ProjectsProjectContentPagesQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentPages', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/pages`), ...options });
}

export function useContentStoreApiAdminV1ProjectsProjectContentPagesMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/pages`, { method: 'POST', body }) });
}

export function useContentUpdateApiAdminV1ProjectsProjectContentPagesPageMutation(project: string | number, page: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/pages/${page}`, { method: 'PUT', body }) });
}

export function useContentRevisionsApiAdminV1ProjectsProjectContentPagesPageRevisionsQuery(project: string | number, page: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentRevisionsApiAdminV1ProjectsProjectContentPagesPageRevisions', project, page], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/pages/${page}/revisions`), ...options });
}

export function useContentRestoreApiAdminV1ProjectsProjectContentPagesPageRevisionsRevisionRestoreMutation(project: string | number, page: string | number, revision: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/pages/${page}/revisions/${revision}/restore`, { method: 'POST', body }) });
}

export function useContentChangeStatusApiAdminV1ProjectsProjectContentPagesPageStatusMutation(project: string | number, page: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/pages/${page}/status`, { method: 'POST', body }) });
}

export function useContentIndexApiAdminV1ProjectsProjectContentPostsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentPosts', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/posts`), ...options });
}

export function useContentStoreApiAdminV1ProjectsProjectContentPostsMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/posts`, { method: 'POST', body }) });
}

export function useContentGenerateApiAdminV1ProjectsProjectContentPostsMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/posts/generate`, { method: 'POST', body }) });
}

export function useContentShowApiAdminV1ProjectsProjectContentPostsPostQuery(project: string | number, post: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentShowApiAdminV1ProjectsProjectContentPostsPost', project, post], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/posts/${post}`), ...options });
}

export function useContentUpdateApiAdminV1ProjectsProjectContentPostsPostMutation(project: string | number, post: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/posts/${post}`, { method: 'PUT', body }) });
}

export function useContentDestroyApiAdminV1ProjectsProjectContentPostsPostMutation(project: string | number, post: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/posts/${post}`, { method: 'DELETE', body }) });
}

export function useContentRevisionsApiAdminV1ProjectsProjectContentPostsPostRevisionsQuery(project: string | number, post: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentRevisionsApiAdminV1ProjectsProjectContentPostsPostRevisions', project, post], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/posts/${post}/revisions`), ...options });
}

export function useContentRestoreApiAdminV1ProjectsProjectContentPostsPostRevisionsRevisionRestoreMutation(project: string | number, post: string | number, revision: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/posts/${post}/revisions/${revision}/restore`, { method: 'POST', body }) });
}

export function useContentChangeStatusApiAdminV1ProjectsProjectContentPostsPostStatusMutation(project: string | number, post: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/posts/${post}/status`, { method: 'POST', body }) });
}

export function useContentIndexApiAdminV1ProjectsProjectContentResearchQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentResearch', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/research`), ...options });
}

export function useContentStoreApiAdminV1ProjectsProjectContentResearchMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/research`, { method: 'POST', body }) });
}

export function useContentShowApiAdminV1ProjectsProjectContentResearchResearchQuery(project: string | number, research: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentShowApiAdminV1ProjectsProjectContentResearchResearch', project, research], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/research/${research}`), ...options });
}

export function useContentCancelApiAdminV1ProjectsProjectContentResearchResearchMutation(project: string | number, research: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/research/${research}/cancel`, { method: 'POST', body }) });
}

export function useContentIndexApiAdminV1ProjectsProjectContentResearchResearchTopicsQuery(project: string | number, research: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentResearchResearchTopics', project, research], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/research/${research}/topics`), ...options });
}

export function useContentStoreApiAdminV1ProjectsProjectContentResearchResearchTopicsMutation(project: string | number, research: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/research/${research}/topics`, { method: 'POST', body }) });
}

export function useContentShowApiAdminV1ProjectsProjectContentSeoTypeIdQuery(project: string | number, type: string | number, id: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentShowApiAdminV1ProjectsProjectContentSeoTypeId', project, type, id], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/seo/${type}/${id}`), ...options });
}

export function useContentUpdateApiAdminV1ProjectsProjectContentSeoTypeIdMutation(project: string | number, type: string | number, id: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/seo/${type}/${id}`, { method: 'PUT', body }) });
}

export function useContentIndexApiAdminV1ProjectsProjectContentTasksQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentTasks', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/tasks`), ...options });
}

export function useContentAllApiAdminV1ProjectsProjectContentTopicsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentAllApiAdminV1ProjectsProjectContentTopics', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/topics`), ...options });
}

export function useContentRejectApiAdminV1ProjectsProjectContentTopicsTopicMutation(project: string | number, topic: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/topics/${topic}/reject`, { method: 'POST', body }) });
}

export function useContentIndexApiAdminV1ProjectsProjectContentTranslationsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentTranslations', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/translations`), ...options });
}

export function useContentStoreApiAdminV1ProjectsProjectContentTranslationsMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/translations`, { method: 'POST', body }) });
}

export function useContentTranslateMissingApiAdminV1ProjectsProjectContentTranslationsMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/translations/translate-missing`, { method: 'POST', body }) });
}

export function useContentUpdateApiAdminV1ProjectsProjectContentTranslationsTranslationMutation(project: string | number, translation: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/translations/${translation}`, { method: 'PUT', body }) });
}

export function useContentDestroyApiAdminV1ProjectsProjectContentTranslationsTranslationMutation(project: string | number, translation: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/translations/${translation}`, { method: 'DELETE', body }) });
}

export function useAuthIndexApiAdminV1ProjectsProjectMembersQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authIndexApiAdminV1ProjectsProjectMembers', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/members`), ...options });
}

export function useAuthStoreApiAdminV1ProjectsProjectMembersMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/members`, { method: 'POST', body }) });
}

export function useAuthDestroyApiAdminV1ProjectsProjectMembersMemberMutation(project: string | number, member: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/members/${member}`, { method: 'DELETE', body }) });
}

export function useAuthAssignRoleApiAdminV1ProjectsProjectMembersMemberRoleMutation(project: string | number, member: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/members/${member}/role`, { method: 'PUT', body }) });
}

export function useLicensingRevokeInstallationMutation(project: string | number, installation: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/installations/${installation}/revoke`, { method: 'POST', body }) });
}

export function useLicensingIndexLicensesQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['licensingIndexLicenses', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/licenses`), ...options });
}

export function useLicensingIssueLicenseMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/licenses`, { method: 'POST', body }) });
}

export function useLicensingShowLicenseQuery(project: string | number, license: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['licensingShowLicense', project, license], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/licenses/${license}`), ...options });
}

export function useLicensingIndexInstallationsQuery(project: string | number, license: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['licensingIndexInstallations', project, license], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/licenses/${license}/installations`), ...options });
}

export function useLicensingOfflineActivationMutation(project: string | number, license: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/licenses/${license}/offline-activation`, { method: 'POST', body }) });
}

export function useLicensingRenewLicenseMutation(project: string | number, license: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/licenses/${license}/renew`, { method: 'POST', body }) });
}

export function useLicensingRevealLicenseKeyMutation(project: string | number, license: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/licenses/${license}/reveal-key`, { method: 'POST', body }) });
}

export function useLicensingRevokeLicenseMutation(project: string | number, license: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/licenses/${license}/revoke`, { method: 'POST', body }) });
}

export function useLicensingIndexOrganizationsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['licensingIndexOrganizations', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/organizations`), ...options });
}

export function useLicensingStoreOrganizationMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/organizations`, { method: 'POST', body }) });
}

export function useLicensingShowOrganizationQuery(project: string | number, organization: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['licensingShowOrganization', project, organization], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/organizations/${organization}`), ...options });
}

export function useLicensingUpdateOrganizationMutation(project: string | number, organization: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/organizations/${organization}`, { method: 'PUT', body }) });
}

export function useLicensingDeleteOrganizationMutation(project: string | number, organization: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/organizations/${organization}`, { method: 'DELETE', body }) });
}

export function useLicensingIndexPlansQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['licensingIndexPlans', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/plans`), ...options });
}

export function useLicensingStorePlanMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/plans`, { method: 'POST', body }) });
}

export function useLicensingShowPlanQuery(project: string | number, plan: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['licensingShowPlan', project, plan], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/plans/${plan}`), ...options });
}

export function useLicensingUpdatePlanMutation(project: string | number, plan: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/plans/${plan}`, { method: 'PUT', body }) });
}

export function useLicensingDeletePlanMutation(project: string | number, plan: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/plans/${plan}`, { method: 'DELETE', body }) });
}

export function useLicensingStorePlanFeatureMutation(project: string | number, plan: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/plans/${plan}/features`, { method: 'POST', body }) });
}

export function useLicensingUpdatePlanFeatureMutation(project: string | number, plan: string | number, feature: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/plans/${plan}/features/${feature}`, { method: 'PUT', body }) });
}

export function useLicensingDeletePlanFeatureMutation(project: string | number, plan: string | number, feature: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/plans/${plan}/features/${feature}`, { method: 'DELETE', body }) });
}

export function useLicensingIndexReleasesQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['licensingIndexReleases', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/releases`), ...options });
}

export function useLicensingStoreReleaseMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/releases`, { method: 'POST', body }) });
}

export function useLicensingShowReleaseQuery(project: string | number, release: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['licensingShowRelease', project, release], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/releases/${release}`), ...options });
}

export function useLicensingUpdateReleaseMutation(project: string | number, release: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/releases/${release}`, { method: 'PUT', body }) });
}

export function useLicensingDeleteReleaseMutation(project: string | number, release: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/releases/${release}`, { method: 'DELETE', body }) });
}

export function useLicensingSigningKeyQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['licensingSigningKey', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/licensing/signing-key`), ...options });
}

export function usePayIndexApiAdminV1ProjectsProjectPayPaymentsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['payIndexApiAdminV1ProjectsProjectPayPayments', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/payments`), ...options });
}

export function usePayConfirmApiAdminV1ProjectsProjectPayPaymentsPaymentConfirmMutation(project: string | number, payment: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/payments/${payment}/confirm`, { method: 'POST', body }) });
}

export function usePayRefundApiAdminV1ProjectsProjectPayPaymentsPaymentRefundMutation(project: string | number, payment: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/payments/${payment}/refund`, { method: 'POST', body }) });
}

export function usePayIndexApiAdminV1ProjectsProjectPayPlansQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['payIndexApiAdminV1ProjectsProjectPayPlans', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/plans`), ...options });
}

export function usePayStoreApiAdminV1ProjectsProjectPayPlansMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/plans`, { method: 'POST', body }) });
}

export function usePayUpdateApiAdminV1ProjectsProjectPayPlansPlanMutation(project: string | number, plan: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/plans/${plan}`, { method: 'PUT', body }) });
}

export function usePayArchiveApiAdminV1ProjectsProjectPayPlansPlanArchiveMutation(project: string | number, plan: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/plans/${plan}/archive`, { method: 'POST', body }) });
}

export function usePayIndexApiAdminV1ProjectsProjectPayProvidersQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['payIndexApiAdminV1ProjectsProjectPayProviders', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/providers`), ...options });
}

export function usePayShowApiAdminV1ProjectsProjectPayProvidersProviderQuery(project: string | number, provider: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['payShowApiAdminV1ProjectsProjectPayProvidersProvider', project, provider], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/providers/${provider}`), ...options });
}

export function usePayUpdateApiAdminV1ProjectsProjectPayProvidersProviderMutation(project: string | number, provider: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/providers/${provider}`, { method: 'PUT', body }) });
}

export function usePayShowApiAdminV1ProjectsProjectPaySettingsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['payShowApiAdminV1ProjectsProjectPaySettings', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/settings`), ...options });
}

export function usePayUpdateApiAdminV1ProjectsProjectPaySettingsMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/settings`, { method: 'PUT', body }) });
}

export function usePayIndexApiAdminV1ProjectsProjectPaySubscriptionsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['payIndexApiAdminV1ProjectsProjectPaySubscriptions', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/subscriptions`), ...options });
}

export function usePayStoreApiAdminV1ProjectsProjectPaySubscriptionsMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/subscriptions`, { method: 'POST', body }) });
}

export function usePayChangeApiAdminV1ProjectsProjectPaySubscriptionsSubscriptionActionMutation(project: string | number, subscription: string | number, action: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/subscriptions/${subscription}/${action}`, { method: 'POST', body }) });
}

export function useAuthIndexApiAdminV1ProjectsProjectRolesQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authIndexApiAdminV1ProjectsProjectRoles', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/roles`), ...options });
}

export function useAuthStoreApiAdminV1ProjectsProjectRolesMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/roles`, { method: 'POST', body }) });
}

export function useAuthUpdateApiAdminV1ProjectsProjectRolesRoleMutation(project: string | number, role: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/roles/${role}`, { method: 'PUT', body }) });
}

export function useAuthDestroyApiAdminV1ProjectsProjectRolesRoleMutation(project: string | number, role: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/roles/${role}`, { method: 'DELETE', body }) });
}

export function useAuthIndexApiAdminV1ProjectsProjectServicesQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authIndexApiAdminV1ProjectsProjectServices', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/services`), ...options });
}

export function useAuthUpdateApiAdminV1ProjectsProjectServicesServiceMutation(project: string | number, service: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/services/${service}`, { method: 'PUT', body }) });
}

export function useAuthShowApiAdminV1ProjectsProjectSettingsServiceQuery(project: string | number, service: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authShowApiAdminV1ProjectsProjectSettingsService', project, service], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/settings/${service}`), ...options });
}

export function useAuthUpdateApiAdminV1ProjectsProjectSettingsServiceMutation(project: string | number, service: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/settings/${service}`, { method: 'PUT', body }) });
}

export function useAuthShowApiAdminV1ProjectsProjectSiteSettingsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authShowApiAdminV1ProjectsProjectSiteSettings', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/site-settings`), ...options });
}

export function useAuthUpdateApiAdminV1ProjectsProjectSiteSettingsMutation(project: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/site-settings`, { method: 'PUT', body }) });
}

export function useAuthIndexApiAdminV1ProjectsProjectUsersQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authIndexApiAdminV1ProjectsProjectUsers', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/users`), ...options });
}

export function useAuthDestroyApiAdminV1ProjectsProjectUsersUserMutation(project: string | number, user: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/users/${user}`, { method: 'DELETE', body }) });
}

export function useAuthBlockApiAdminV1ProjectsProjectUsersUserBlockMutation(project: string | number, user: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/users/${user}/block`, { method: 'POST', body }) });
}

export function useAuthUnblockApiAdminV1ProjectsProjectUsersUserUnblockMutation(project: string | number, user: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/users/${user}/unblock`, { method: 'POST', body }) });
}

export function useAnalyticsConfigApiV1AnalyticsConfigQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['analyticsConfigApiV1AnalyticsConfig'], queryFn: () => apiFetch(`/api/v1/analytics/config`), ...options });
}

export function useAuthForgotApiV1AuthForgotPasswordMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/auth/forgot-password`, { method: 'POST', body }) });
}

export function useAuthLoginApiV1AuthLoginMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/auth/login`, { method: 'POST', body }) });
}

export function useAuthLogoutApiV1AuthLogoutMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/auth/logout`, { method: 'POST', body }) });
}

export function useAuthMeApiV1AuthMeQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authMeApiV1AuthMe'], queryFn: () => apiFetch(`/api/v1/auth/me`), ...options });
}

export function useAuthUpdateProfileApiV1AuthMeMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/auth/me`, { method: 'PATCH', body }) });
}

export function useAuthRegisterApiV1AuthRegisterMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/auth/register`, { method: 'POST', body }) });
}

export function useAuthResetApiV1AuthResetPasswordMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/auth/reset-password`, { method: 'POST', body }) });
}

export function useAnalyticsInvokeApiV1CollectMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/collect`, { method: 'POST', body }) });
}

export function useContentCategoriesApiV1ContentCategoriesQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentCategoriesApiV1ContentCategories'], queryFn: () => apiFetch(`/api/v1/content/categories`), ...options });
}

export function useContentPageApiV1ContentPagesSlugQuery(slug: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentPageApiV1ContentPagesSlug', slug], queryFn: () => apiFetch(`/api/v1/content/pages/${slug}`), ...options });
}

export function useContentPostsApiV1ContentPostsQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentPostsApiV1ContentPosts'], queryFn: () => apiFetch(`/api/v1/content/posts`), ...options });
}

export function useContentPostApiV1ContentPostsSlugQuery(slug: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentPostApiV1ContentPostsSlug', slug], queryFn: () => apiFetch(`/api/v1/content/posts/${slug}`), ...options });
}

export function useLicensingActivateLicenseMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/pay/licensing/license/activate`, { method: 'POST', body }) });
}

export function useLicensingDeactivateLicenseMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/pay/licensing/license/deactivate`, { method: 'POST', body }) });
}

export function useLicensingRefreshLicenseMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/pay/licensing/license/refresh`, { method: 'POST', body }) });
}

export function useLicensingCheckUpdatesMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/pay/licensing/updates/check`, { method: 'POST', body }) });
}

export function usePayPlansApiV1PayPlansQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['payPlansApiV1PayPlans'], queryFn: () => apiFetch(`/api/v1/pay/plans`), ...options });
}

export function usePayMineApiV1PaySubscriptionsQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['payMineApiV1PaySubscriptions'], queryFn: () => apiFetch(`/api/v1/pay/subscriptions`), ...options });
}

export function usePaySubscribeApiV1PaySubscriptionsMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/pay/subscriptions`, { method: 'POST', body }) });
}

export function usePayChangeApiV1PaySubscriptionsSubscriptionActionMutation(subscription: string | number, action: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/pay/subscriptions/${subscription}/${action}`, { method: 'POST', body }) });
}

export function useSharedCacheBustInternalCacheBustMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/internal/cache-bust`, { method: 'POST', body }) });
}

export function useAnalyticsInvokeInternalEventsMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/internal/events`, { method: 'POST', body }) });
}

export function useAuthInvokeInternalIntrospectMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/internal/introspect`, { method: 'POST', body }) });
}

export function useAuthStoreInternalManifestsMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/internal/manifests`, { method: 'POST', body }) });
}

export function useAuthInvokeInternalProjectProfileMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/internal/project-profile`, { method: 'POST', body }) });
}

export function useAuthInvokeInternalTranslationsVersionMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/internal/translations-version`, { method: 'POST', body }) });
}

export function useContentRobotsRobotsTxtQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentRobotsRobotsTxt'], queryFn: () => apiFetch(`/robots.txt`), ...options });
}

export function useContentSitemapSitemapXmlQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentSitemapSitemapXml'], queryFn: () => apiFetch(`/sitemap.xml`), ...options });
}

export function usePayInvokeWebhooksProviderMutation(provider: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/webhooks/${provider}`, { method: 'POST', body }) });
}
