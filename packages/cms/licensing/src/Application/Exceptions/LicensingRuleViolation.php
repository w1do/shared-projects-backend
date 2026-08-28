<?php

declare(strict_types=1);

namespace Cms\Licensing\Application\Exceptions;

use Illuminate\Validation\ValidationException;

/**
 * База доменных исключений licensing (по образцу pay/DomainRuleViolation):
 * правила формата запроса живут в FormRequest, доменные инварианты —
 * в Application и выражаются этими исключениями. Наследование от
 * `ValidationException` даёт стандартный 422-конверт `ErrorEnvelope::validation()`.
 */
abstract class LicensingRuleViolation extends ValidationException {}
