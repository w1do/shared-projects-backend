<?php

declare(strict_types=1);

namespace Cms\Pay\Application\Exceptions;

use Illuminate\Validation\ValidationException;

/**
 * База доменных исключений pay (Decision 2): правила формата запроса живут
 * в FormRequest, доменные инварианты — в Application и выражаются этими
 * исключениями вместо анонимного `ValidationException::withMessages()`.
 *
 * Наследование от `ValidationException` — сознательное и обязательное:
 * маппинг в `ErrorEnvelope::validation()` объявлен в `bootstrap/app.php`
 * каждого приложения именно для него, поэтому код (422) и тело ответа
 * остаются байт-в-байт прежними (характеризационные снимки pay).
 */
abstract class DomainRuleViolation extends ValidationException {}
