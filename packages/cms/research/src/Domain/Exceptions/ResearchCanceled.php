<?php

declare(strict_types=1);

namespace Cms\Research\Domain\Exceptions;

use RuntimeException;

/** Исследование отменено оператором: пайплайн останавливается на границе этапа. */
final class ResearchCanceled extends RuntimeException {}
