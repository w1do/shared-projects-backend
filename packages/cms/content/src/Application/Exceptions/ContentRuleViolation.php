<?php

declare(strict_types=1);

namespace Cms\Content\Application\Exceptions;

use Cms\Content\Domain\Enums\ContentStatus;
use Illuminate\Validation\ValidationException;

/**
 * Нарушение доменного инварианта контента: недопустимый переход статуса,
 * занятый слаг, перемещение узла под собственного потомка.
 *
 * Почему наследник `ValidationException`, а не собственная иерархия
 * (Decision 2 + Safety Protocol, гейт 2):
 *
 * - тело ответа 422 зафиксировано снимками (`posts-status-422-transition`,
 *   `posts-store-422-duplicate-slug`, `categories-move-422-descendant`) и
 *   обязано остаться байт-в-байт прежним;
 * - маппинг в `ErrorEnvelope::validation()` живёт в `bootstrap/app.php` каждого
 *   приложения, который в этом этапе не трогается, и ловит наследников тоже.
 *
 * Handlers при этом больше не собирают сообщения валидации сами: правило
 * называется доменным термином, а его текст живёт здесь в одном месте.
 * Расположение — `Application/Exceptions/` по образцу `cms/ai` (Decision 9):
 * канон `Domain/` каталога исключений не предусматривает.
 */
final class ContentRuleViolation extends ValidationException
{
    public static function statusTransition(ContentStatus $from, ContentStatus $to): self
    {
        return self::withMessages([
            'status' => ["Transition {$from->value} → {$to->value} is not allowed."],
        ]);
    }

    public static function slugTaken(): self
    {
        return self::withMessages(['slug' => ['Slug is already in use.']]);
    }

    public static function categoryMovedUnderOwnDescendant(): self
    {
        return self::withMessages(['parent_id' => ['Cannot move a node under its own descendant.']]);
    }
}
