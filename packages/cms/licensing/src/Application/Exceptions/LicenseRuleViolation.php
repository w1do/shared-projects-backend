<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Exceptions;

/** Доменные инварианты лицензии и её установок (admin-сторона). */
final class LicenseRuleViolation extends LicensingRuleViolation
{
    /** Отзыв необратим: повторный отзыв отклоняется (Д2). */
    public static function alreadyRevoked(): self
    {
        return self::withMessages([
            'license' => ['License is already revoked.'],
        ]);
    }

    /** Отозванная лицензия не продлевается (Д5). */
    public static function revokedNotRenewable(): self
    {
        return self::withMessages([
            'license' => ['Revoked license cannot be renewed.'],
        ]);
    }

    /** Продление только вперёд: дата не позже текущего окна отклоняется (Д5). */
    public static function renewalMustExtend(): self
    {
        return self::withMessages([
            'updates_until' => ['Renewal date must be later than the current updates window end.'],
        ]);
    }

    /** Ключ показывается один раз: шифрованная копия уже затёрта (Д8). */
    public static function keyAlreadyRevealed(): self
    {
        return self::withMessages([
            'license' => ['License key is no longer available.'],
        ]);
    }

    /** Лимит установок исчерпан — admin-сторона (офлайн-активация). */
    public static function installationLimitReached(): self
    {
        return self::withMessages([
            'install_id' => ['Installation limit reached.'],
        ]);
    }

    /** Установка уже отозвана: повторный отзыв и офлайн-активация отклоняются (Д7). */
    public static function installationAlreadyRevoked(): self
    {
        return self::withMessages([
            'installation' => ['Installation is already revoked.'],
        ]);
    }
}
