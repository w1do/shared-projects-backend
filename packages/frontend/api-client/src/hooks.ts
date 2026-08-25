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

export function useAuthIndexApiAdminV1ProjectsQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authIndexApiAdminV1Projects'], queryFn: () => apiFetch(`/api/admin/v1/projects`), ...options });
}

export function useAuthShowApiAdminV1ProjectsProjectQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authShowApiAdminV1ProjectsProject', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}`), ...options });
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

export function useAnalyticsTopPagesApiAdminV1ProjectsProjectAnalyticsTopPagesQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['analyticsTopPagesApiAdminV1ProjectsProjectAnalyticsTopPages', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/analytics/top-pages`), ...options });
}

export function useAuthIndexApiAdminV1ProjectsProjectApiKeysQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authIndexApiAdminV1ProjectsProjectApiKeys', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/api-keys`), ...options });
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

export function useContentIndexApiAdminV1ProjectsProjectContentCategoriesQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentCategories', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/categories`), ...options });
}

export function useContentUpdateApiAdminV1ProjectsProjectContentCategoriesCategoryMutation(project: string | number, category: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/categories/${category}`, { method: 'PUT', body }) });
}

export function useContentMoveApiAdminV1ProjectsProjectContentCategoriesCategoryMoveMutation(project: string | number, category: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/content/categories/${category}/move`, { method: 'POST', body }) });
}

export function useContentIndexApiAdminV1ProjectsProjectContentMediaQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentMedia', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/media`), ...options });
}

export function useContentIndexApiAdminV1ProjectsProjectContentPagesQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentIndexApiAdminV1ProjectsProjectContentPages', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/pages`), ...options });
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

export function useContentShowApiAdminV1ProjectsProjectContentPostsPostQuery(project: string | number, post: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentShowApiAdminV1ProjectsProjectContentPostsPost', project, post], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/posts/${post}`), ...options });
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

export function useContentShowApiAdminV1ProjectsProjectContentSeoTypeIdQuery(project: string | number, type: string | number, id: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentShowApiAdminV1ProjectsProjectContentSeoTypeId', project, type, id], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/content/seo/${type}/${id}`), ...options });
}

export function useAuthIndexApiAdminV1ProjectsProjectMembersQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authIndexApiAdminV1ProjectsProjectMembers', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/members`), ...options });
}

export function useAuthDestroyApiAdminV1ProjectsProjectMembersMemberMutation(project: string | number, member: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/members/${member}`, { method: 'DELETE', body }) });
}

export function useAuthAssignRoleApiAdminV1ProjectsProjectMembersMemberRoleMutation(project: string | number, member: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/members/${member}/role`, { method: 'PUT', body }) });
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

export function usePayUpdateApiAdminV1ProjectsProjectPayPlansPlanMutation(project: string | number, plan: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/plans/${plan}`, { method: 'PUT', body }) });
}

export function usePayArchiveApiAdminV1ProjectsProjectPayPlansPlanArchiveMutation(project: string | number, plan: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/plans/${plan}/archive`, { method: 'POST', body }) });
}

export function usePayIndexApiAdminV1ProjectsProjectPaySubscriptionsQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['payIndexApiAdminV1ProjectsProjectPaySubscriptions', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/pay/subscriptions`), ...options });
}

export function usePayChangeApiAdminV1ProjectsProjectPaySubscriptionsSubscriptionActionMutation(project: string | number, subscription: string | number, action: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/pay/subscriptions/${subscription}/${action}`, { method: 'POST', body }) });
}

export function useAuthIndexApiAdminV1ProjectsProjectRolesQuery(project: string | number, options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['authIndexApiAdminV1ProjectsProjectRoles', project], queryFn: () => apiFetch(`/api/admin/v1/projects/${project}/roles`), ...options });
}

export function useAuthUpdateApiAdminV1ProjectsProjectRolesRoleMutation(project: string | number, role: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/admin/v1/projects/${project}/roles/${role}`, { method: 'PUT', body }) });
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

export function usePayPlansApiV1PayPlansQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['payPlansApiV1PayPlans'], queryFn: () => apiFetch(`/api/v1/pay/plans`), ...options });
}

export function usePaySubscribeApiV1PaySubscriptionsMutation() {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/pay/subscriptions`, { method: 'POST', body }) });
}

export function usePayChangeApiV1PaySubscriptionsSubscriptionActionMutation(subscription: string | number, action: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/api/v1/pay/subscriptions/${subscription}/${action}`, { method: 'POST', body }) });
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

export function useContentRobotsRobotsTxtQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentRobotsRobotsTxt'], queryFn: () => apiFetch(`/robots.txt`), ...options });
}

export function useContentSitemapSitemapXmlQuery(options: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['contentSitemapSitemapXml'], queryFn: () => apiFetch(`/sitemap.xml`), ...options });
}

export function usePayInvokeWebhooksProviderMutation(provider: string | number) {
  return useMutation({ mutationFn: (body?: unknown) => apiFetch(`/webhooks/${provider}`, { method: 'POST', body }) });
}
