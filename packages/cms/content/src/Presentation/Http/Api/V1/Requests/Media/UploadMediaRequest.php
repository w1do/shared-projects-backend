<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\Media;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

/**
 * Правила перенесены из `MediaController::store()` дословно, включая порядок
 * ключей: он определяет порядок ключей в `error.details` ответа 422
 * (снимки `media-store-422`, `media-store-422-too-large`).
 */
final class UploadMediaRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:'.(int) config('cms-content.media_max_size_kb', 20480)],
            'alt' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }

    /** Файл гарантирован правилом `required|file`. */
    public function uploadedFile(): UploadedFile
    {
        $file = $this->file('file');

        assert($file instanceof UploadedFile);

        return $file;
    }

    public function alt(): ?string
    {
        $alt = $this->input('alt');

        return is_string($alt) ? $alt : null;
    }
}
