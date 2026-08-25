<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Controllers\Admin;

use Cms\Content\Application\Commands\UploadMediaCommand;
use Cms\Content\Application\Handlers\UploadMediaHandler;
use Cms\Content\Domain\Models\MediaFile;
use Cms\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

final class MediaController
{
    #[OA\Get(path: '/api/admin/v1/projects/{project}/content/media', operationId: 'content_index_api_admin_v1_projects_project_content_media', tags: ['content'], summary: 'GET /api/admin/v1/projects/{project}/content/media', responses: [new OA\Response(response: 200, description: 'OK'), new OA\Response(response: 401, description: 'Unauthenticated'), new OA\Response(response: 422, description: 'Validation error')])]
    public function index(): JsonResponse
    {
        return ApiResponse::cursorPage(
            MediaFile::query()->orderByDesc('id')->cursorPaginate(50),
            fn (MediaFile $m) => $this->serialize($m),
        );
    }

    public function store(Request $request, UploadMediaHandler $command): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:20480'],
            'alt' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $media = $command->handle(new UploadMediaCommand($request->file('file'), $request->input('alt')));

        return ApiResponse::created($this->serialize($media));
    }

    private function serialize(MediaFile $media): array
    {
        return [
            'id' => $media->id,
            'path' => $media->path,
            'mime' => $media->mime,
            'size' => $media->size,
            'alt' => $media->alt,
            'variants' => $media->variants,
        ];
    }
}
