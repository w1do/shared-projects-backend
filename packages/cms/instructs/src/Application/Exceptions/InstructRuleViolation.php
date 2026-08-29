<?php

declare(strict_types=1);

namespace Cms\Instructs\Application\Exceptions;

use Illuminate\Validation\ValidationException;

/**
 * Нарушение доменного инварианта инструкций: категория вне перечня платформы,
 * непригодная схема ответа, правка предустановленной инструкции.
 *
 * Наследник `ValidationException` по образцу `ContentRuleViolation`: маппинг в
 * `ErrorEnvelope::validation()` живёт в `bootstrap/app.php` приложений и ловит
 * наследников, а тексты правил остаются в одном месте.
 */
final class InstructRuleViolation extends ValidationException
{
    public static function unknownCategory(string $category): self
    {
        return self::withMessages([
            'category' => ["Instruct category '{$category}' is not supported by the platform."],
        ]);
    }

    public static function invalidSchema(string $reason): self
    {
        return self::withMessages(['schema' => [$reason]]);
    }

    public static function systemInstructIsReadOnly(string $reason): self
    {
        return self::withMessages(['id' => [$reason]]);
    }

    public static function draftIsNotApplicable(string $category): self
    {
        return self::withMessages([
            'instruct' => ["Instruct for '{$category}' is a draft and cannot be applied."],
        ]);
    }

    /**
     * Ни своей опубликованной инструкции, ни предустановленной: чаще всего
     * предустановленные не разложены на стенде — сообщение называет причину,
     * а не выдаёт её за черновик.
     */
    public static function missingInstruct(string $category): self
    {
        return self::withMessages([
            'instruct' => [
                "No instruct found for '{$category}': the project has no published one "
                .'and the platform defaults are not seeded (run instructs:seed-system).',
            ],
        ]);
    }
}
