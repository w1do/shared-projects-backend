<?php

declare(strict_types=1);

namespace Cms\Content\Presentation\Http\Api\V1\Requests\Media;

use Cms\Content\Application\DTOs\Media\ImportMediaDTO;
use Illuminate\Foundation\Http\FormRequest;

/** Импорт по ссылке: адрес обязателен и ограничен схемами http/https. */
final class ImportMediaRequest extends FormRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'url' => ['required', 'string', 'url:http,https', 'max:2048'],
            'alt' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }

    public function import(): ImportMediaDTO
    {
        $alt = $this->input('alt');

        return new ImportMediaDTO(
            url: (string) $this->input('url'),
            alt: is_string($alt) ? $alt : null,
        );
    }
}
