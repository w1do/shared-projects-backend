<?php

declare(strict_types=1);

namespace Cms\Ai\Infrastructure\Ai;

use Illuminate\Contracts\JsonSchema\JsonSchema;

/** JSON-схемы ответов по операциям: форма ответа модели задаётся здесь. */
final class ResponseSchemas
{
    /** @return callable(JsonSchema): array<string, mixed> */
    public static function text(string $description): callable
    {
        return fn (JsonSchema $schema): array => ['text' => $schema->string()->description($description)->required()];
    }

    /**
     * Схема с фиксированными полями вместо динамических ключей: строгий
     * structured output не дружит с произвольными именами свойств.
     *
     * @return callable(JsonSchema): array<string, mixed>
     */
    public static function translations(): callable
    {
        return fn (JsonSchema $schema): array => [
            'items' => $schema->array()->items(
                $schema->object([
                    'key' => $schema->string()->required(),
                    'locale' => $schema->string()->required(),
                    'value' => $schema->string()->required(),
                ]),
            )->required(),
        ];
    }

    /**
     * Плоский список с parent_slug вместо рекурсивной схемы: рекурсия в
     * JSON-схемах поддерживается провайдерами непредсказуемо.
     *
     * @return callable(JsonSchema): array<string, mixed>
     */
    public static function categories(): callable
    {
        return fn (JsonSchema $schema): array => [
            'categories' => $schema->array()->items(
                $schema->object([
                    'name' => $schema->string()->required(),
                    'slug' => $schema->string()->required(),
                    'parent_slug' => $schema->string()->nullable()->required(),
                ]),
            )->required(),
        ];
    }

    /** @return callable(JsonSchema): array<string, mixed> */
    public static function postDraft(): callable
    {
        return fn (JsonSchema $schema): array => [
            'title' => $schema->string()->required(),
            'slug' => $schema->string()->required(),
            'body' => $schema->string()->required(),
        ];
    }
}
