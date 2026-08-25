<?php

declare(strict_types=1);

namespace Cms\Ai\Application\Exceptions;

/** Ответ модели не соответствует ожидаемой форме — потребителю сырой текст не отдаётся. */
final class AiResponseException extends AiRequestException {}
