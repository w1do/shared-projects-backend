<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\ApiKey;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

final class IssueApiKeyDTO extends Data
{
    /** @param list<string>|Optional $scopes */
    public function __construct(
        public string $type,
        public array|Optional $scopes,
    ) {}

    /** @return array<string, list<mixed>> */
    public static function rules(): array
    {
        return [
            'type' => ['required', 'in:public,secret'],
            'scopes' => ['sometimes', 'array'],
            'scopes.*' => ['string', 'max:64'],
        ];
    }
}
