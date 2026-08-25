<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Setting;

use Cms\Auth\Application\Queries\ServiceSettingsSchemaQuery;
use Cms\Contracts\Manifest\SettingDefinition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Validator as ValidatorFactory;
use Illuminate\Validation\Validator;

/**
 * Валидация настроек сервиса на проект.
 *
 * Правила приходят не из кода, а из схемы в манифесте сервиса, поэтому проверка
 * идёт в `withValidator`, а не в `rules()`. Порядок проверок — контракт ответа и
 * сохранён дословно:
 *   1. конверт (`values` обязателен и массив);
 *   2. сервис зарегистрирован;
 *   3. все ключи объявлены в схеме (первый неизвестный прекращает разбор);
 *   4. значения проходят правила своих определений.
 * Смешать шаги нельзя: тело 422 сегодня содержит ошибки ровно одного шага.
 */
final class PutSettingsRequest extends FormRequest
{
    public function __construct(private readonly ServiceSettingsSchemaQuery $schema)
    {
        parent::__construct();
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return ['values' => ['required', 'array']];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            // Конверт уже невалиден — дальше не идём: раньше сюда просто не доходило
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $definitions = $this->schema->handle((string) $this->route('service'));

            if ($definitions === null) {
                $validator->errors()->add('service', 'Service manifest is not registered.');

                return;
            }

            /** @var array<string, mixed> $values */
            $values = (array) $this->input('values', []);
            $rules = [];

            foreach ($values as $key => $value) {
                $definition = $definitions->get((string) $key);

                if (! $definition instanceof SettingDefinition) {
                    $validator->errors()->add("values.{$key}", 'Unknown setting.');

                    return;
                }

                if ($definition->rules !== []) {
                    $rules["values.{$key}"] = $definition->rules;
                }
            }

            $schema = ValidatorFactory::make(['values' => $values], $rules);

            foreach ($schema->errors()->messages() as $attribute => $messages) {
                foreach ($messages as $message) {
                    $validator->errors()->add($attribute, $message);
                }
            }
        });
    }
}
