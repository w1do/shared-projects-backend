<?php

declare(strict_types=1);

namespace Cms\Localization\Presentation\Http\Api\V1\Controllers;

use Cms\Localization\Application\Commands\UpsertTranslationCommand;
use Cms\Localization\Application\DTOs\Translation\UpsertTranslationDTO;
use Cms\Localization\Application\Handlers\DeleteTranslationHandler;
use Cms\Localization\Application\Handlers\UpsertTranslationHandler;
use Cms\Localization\Application\Queries\ProjectLocalesQuery;
use Cms\Localization\Domain\Models\Translation;
use Cms\Localization\Infrastructure\Jobs\TranslateMissingJob;
use Cms\Localization\Presentation\Http\Api\V1\Requests\UpsertTranslationRequest;
use Cms\Localization\Presentation\Http\Api\V1\Resources\TranslationResource;
use Cms\Shared\Http\ApiResponse;
use Cms\Shared\Http\ErrorEnvelope;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class TranslationController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/translations', operationId: 'content_index_api_admin_v1_projects_project_content_translations', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/translations', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(Request $request, ProjectLocalesQuery $locales): JsonResponse
    {
        // ?locale=ru — плоский словарь для панели; без locale — полные записи
        $locale = $request->query('locale');
        $translations = Translation::query()->orderBy('key')->get();

        if (is_string($locale) && $locale !== '') {
            $fallback = $locales->defaultLocale($request);
            $dictionary = [];
            foreach ($translations as $translation) {
                $value = $translation->valueFor($locale, $fallback);
                if ($value !== null) {
                    $dictionary[$translation->key] = $value;
                }
            }

            return ApiResponse::data($dictionary);
        }

        return ApiResponse::data(TranslationResource::collection($translations)->resolve($request));
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/content/translations', operationId: 'content_store_api_admin_v1_projects_project_content_translations', tags: ['content'], summary: 'POST /api/admin/v1/projects/{project}/content/translations', responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function store(UpsertTranslationRequest $request, UpsertTranslationHandler $handler): JsonResponse
    {
        $translation = $handler->handle(new UpsertTranslationCommand(UpsertTranslationDTO::fromRequest($request)));

        return ApiResponse::created((new TranslationResource($translation))->resolve($request));
    }

    #[OA\Put(path: '/api/admin/v1/projects/{project}/content/translations/{translation}', operationId: 'content_update_api_admin_v1_projects_project_content_translations_translation', tags: ['content'], summary: 'PUT /api/admin/v1/projects/{project}/content/translations/{translation}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function update(UpsertTranslationRequest $request, string $project, int $translationId, UpsertTranslationHandler $handler): JsonResponse
    {
        $existing = Translation::query()->find($translationId);
        if ($existing === null) {
            return ErrorEnvelope::notFound();
        }

        $data = UpsertTranslationDTO::fromRequest($request);
        $translation = $handler->handle(new UpsertTranslationCommand(new UpsertTranslationDTO(key: $existing->key, values: $data->values)));

        return ApiResponse::data((new TranslationResource($translation))->resolve($request));
    }

    #[OA\Delete(path: '/api/admin/v1/projects/{project}/content/translations/{translation}', operationId: 'content_destroy_api_admin_v1_projects_project_content_translations_translation', tags: ['content'], summary: 'DELETE /api/admin/v1/projects/{project}/content/translations/{translation}', responses: [new OA\Response(response: 204, description: 'No content'), new OA\Response(response: 401, description: 'Unauthenticated')])]
    public function destroy(Request $request, string $project, int $translationId, DeleteTranslationHandler $handler): JsonResponse
    {
        $translation = Translation::query()->find($translationId);
        if ($translation === null) {
            return ErrorEnvelope::notFound();
        }

        $handler->handle($translation);

        return ApiResponse::noContent();
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/content/translations/translate-missing', operationId: 'content_translateMissing_api_admin_v1_projects_project_content_translations', tags: ['content'], summary: 'POST /api/admin/v1/projects/{project}/content/translations/translate-missing', responses: [new OA\Response(response: 202, description: 'Accepted'), new OA\Response(response: 401, description: 'Unauthenticated')])]
    public function translateMissing(Request $request, ProjectContext $context, ProjectLocalesQuery $locales): JsonResponse
    {
        $ids = $request->input('ids');
        /** @var list<int>|null $idList */
        $idList = is_array($ids) ? array_map(intval(...), array_values($ids)) : null;

        TranslateMissingJob::dispatch(
            $context->required(),
            $locales->handle($request),
            $locales->defaultLocale($request),
            $idList,
        );

        return ApiResponse::accepted();
    }
}
