<?php

declare(strict_types=1);

namespace Cms\Pay\Presentation\Http\Api\V1\Requests\ProviderAccount;

use Closure;
use Cms\Pay\Domain\Enums\ProviderStatus;
use Cms\Pay\Infrastructure\Gateways\ProviderRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpsertProviderAccountRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        // Ключ провайдера — сегмент маршрута; тело его переопределить не может
        $this->merge(['provider' => $this->route('provider')]);
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'provider' => ['required', 'string', Rule::in(ProviderRegistry::available())],
            'group' => ['sometimes', 'string', 'max:32'],
            'label' => ['sometimes', 'nullable', 'string', 'max:255'],
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'credentials' => ['sometimes', 'array', $this->jsonObject()],
            'properties' => ['sometimes', 'array', $this->jsonObject()],
            'return_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'fail_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'status' => ['sometimes', Rule::enum(ProviderStatus::class)],
        ];
    }

    /** JSON-объект «ключ → значение»: списки не принимаются, пустой объект — да. */
    private function jsonObject(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if (is_array($value) && $value !== [] && array_is_list($value)) {
                $fail("The {$attribute} field must be a JSON object.");
            }
        };
    }
}
