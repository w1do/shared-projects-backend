<?php

declare(strict_types=1);

namespace Cms\Localization\Presentation\Http\Api\V1\Controllers;

use Cms\Localization\Application\Commands\DeleteTranslationCommand;
use Cms\Localization\Application\Commands\TranslateMissingCommand;
use Cms\Localization\Application\Commands\UpsertTranslationCommand;
use Cms\Localization\Application\DTOs\Translation\TranslateMissingDTO;
use Cms\Localization\Application\DTOs\Translation\TranslationDTO;
use Cms\Localization\Application\DTOs\Translation\UpsertTranslationDTO;
use Cms\Localization\Application\Handlers\DeleteTranslationHandler;
use Cms\Localization\Application\Handlers\TranslateMissingHandler;
use Cms\Localization\Application\Handlers\UpsertTranslationHandler;
use Cms\Localization\Application\Queries\ListTranslationsQuery;
use Cms\Localization\Application\Queries\ProjectLocalesQuery;
use Cms\Localization\Application\Queries\TranslationDictionaryQuery;
use Cms\Localization\Presentation\Http\Api\V1\Requests\TranslateMissingRequest;
use Cms\Localization\Presentation\Http\Api\V1\Requests\UpsertTranslationRequest;
use Cms\Localization\Presentation\Http\Api\V1\Resources\TranslationDictionaryResource;
use Cms\Localization\Presentation\Http\Api\V1\Resources\TranslationResource;
use Cms\Shared\AuthClient\RequestIntrospection;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class TranslationController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/translations', operationId: 'content_index_api_admin_v1_projects_project_content_translations', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/translations', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(
        Request $request,
        ListTranslationsQuery $translations,
        TranslationDictionaryQuery $dictionary,
        ProjectLocalesQuery $locales,
        RequestIntrospection $introspection,
    ): JsonResponse {
        // ?locale=ru — плоский словарь для панели; без locale — полные записи
        $locale = $request->query('locale');

        if (is_string($locale) && $locale !== '') {
            $fallback = $locales->defaultLocale($introspection->result($request));

            return (new TranslationDictionaryResource($dictionary->handle($locale, $fallback)))->toResponse($request);
        }

        return TranslationResource::collection($translations->handle())->toResponse($request);
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/content/translations', operationId: 'content_store_api_admin_v1_projects_project_content_translations', tags: ['content'], summary: 'POST /api/admin/v1/projects/{project}/content/translations', responses: [new OA\Response(response: 201, description: 'Created'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function store(UpsertTranslationRequest $request, UpsertTranslationHandler $handler): JsonResponse
    {
        $translation = $handler->handle(new UpsertTranslationCommand(UpsertTranslationDTO::fromValidated($request->validated())));

        return (new TranslationResource(TranslationDTO::fromModel($translation)))->toCreatedResponse($request);
    }

    #[OA\Put(path: '/api/admin/v1/projects/{project}/content/translations/{translation}', operationId: 'content_update_api_admin_v1_projects_project_content_translations_translation', tags: ['content'], summary: 'PUT /api/admin/v1/projects/{project}/content/translations/{translation}', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function update(UpsertTranslationRequest $request, UpsertTranslationHandler $handler): JsonResponse
    {
        // Ключ берётся из найденной записи — присланный `key` игнорируется (см. Handler).
        $updated = $handler->handle(new UpsertTranslationCommand(
            UpsertTranslationDTO::fromValidated($request->validated()),
            translationId: $this->translationId($request),
        ));

        return (new TranslationResource(TranslationDTO::fromModel($updated)))->toResponse($request);
    }

    #[OA\Delete(path: '/api/admin/v1/projects/{project}/content/translations/{translation}', operationId: 'content_destroy_api_admin_v1_projects_project_content_translations_translation', tags: ['content'], summary: 'DELETE /api/admin/v1/projects/{project}/content/translations/{translation}', responses: [new OA\Response(response: 204, description: 'No content'), new OA\Response(response: 401, description: 'Unauthenticated')])]
    public function destroy(Request $request, DeleteTranslationHandler $handler): JsonResponse
    {
        $handler->handle(new DeleteTranslationCommand($this->translationId($request)));

        return ApiResponse::noContent();
    }

    #[OA\Post(path: '/api/admin/v1/projects/{project}/content/translations/translate-missing', operationId: 'content_translateMissing_api_admin_v1_projects_project_content_translations', tags: ['content'], summary: 'POST /api/admin/v1/projects/{project}/content/translations/translate-missing', responses: [new OA\Response(response: 202, description: 'Accepted'), new OA\Response(response: 401, description: 'Unauthenticated')])]
    public function translateMissing(
        TranslateMissingRequest $request,
        ProjectLocalesQuery $locales,
        RequestIntrospection $introspection,
        TranslateMissingHandler $handler,
    ): JsonResponse {
        $result = $introspection->result($request);

        $handler->handle(new TranslateMissingCommand(
            targetLocales: $locales->handle($result),
            defaultLocale: $locales->defaultLocale($result),
            ids: TranslateMissingDTO::fromValidated($request->validated())->ids,
        ));

        return ApiResponse::accepted();
    }

    /**
     * id записи из сегмента {translation}. Читается по имени, а не через
     * аргумент экшена: route-параметры подставляются позиционно, и объявление
     * одного лишь {translation} получило бы значение {project}.
     */
    private function translationId(Request $request): int
    {
        return (int) $request->route('translation');
    }
}
