<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Профиль оператора. Частичное обновление: непереданные поля не трогаются.
 *
 * `current_password` обязателен ровно тогда, когда меняется пароль. Правило
 * `required_with` — implicit, оно срабатывает и на ОТСУТСТВУЮЩЕМ поле; `sometimes`
 * рядом с ним ставить нельзя — оно бы отменило проверку в единственном случае,
 * ради которого правило существует. Сообщение — часть контракта (guard 0.5).
 *
 * Порядок ключей = порядок ошибок в `error.details`; он зафиксирован снимками.
 */
final class UpdateProfileRequest extends FormRequest
{
    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'locale' => ['sometimes', 'string', 'max:10'],
            'password' => ['sometimes', 'string', 'min:8'],
            'current_password' => ['required_with:password', 'string'],
        ];
    }
}
