<?php

declare(strict_types=1);

namespace Cms\Ai\Application\Exceptions;

use RuntimeException;

/** Базовое исключение AI-пакета: потребители ловят его, не различая причин без нужды. */
abstract class AiException extends RuntimeException {}
