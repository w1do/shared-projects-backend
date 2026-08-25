<?php

declare(strict_types=1);

namespace Cms\Ai\Domain\Exceptions;

/** Пакет не сконфигурирован: нет ключа или заведомо неверные значения. Проверяется до сети. */
final class AiConfigurationException extends AiException {}
