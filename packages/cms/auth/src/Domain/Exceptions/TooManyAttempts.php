<?php

declare(strict_types=1);

namespace Cms\Auth\Domain\Exceptions;

use RuntimeException;

final class TooManyAttempts extends RuntimeException {}
