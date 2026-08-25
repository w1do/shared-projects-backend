<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Manifest;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Регистрация манифеста сервиса.
 *
 * Правилами закрыты только идентификатор и версия; остальное тело — декларация
 * сервиса, чью форму знает `Cms\Contracts\Manifest\ServiceManifest`, а не auth.
 * Поэтому в handler уходит полное тело, а не `validated()`: сузить его до двух
 * ключей значило бы потерять права, навигацию и схемы настроек.
 */
final class PublishManifestRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'key' => ['required', 'string', 'max:32', 'alpha_dash'],
            'version' => ['required', 'string', 'max:32'],
        ];
    }

    /** @return array<string, mixed> тело манифеста целиком */
    public function manifestPayload(): array
    {
        return $this->all();
    }
}
