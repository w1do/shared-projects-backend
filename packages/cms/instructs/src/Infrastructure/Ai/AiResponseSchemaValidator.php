<?php

declare(strict_types=1);

namespace Cms\Instructs\Infrastructure\Ai;

use Cms\Ai\Application\Exceptions\AiSchemaException;
use Cms\Ai\Infrastructure\Ai\JsonSchemaCompiler;
use Cms\Instructs\Domain\Contracts\ResponseSchemaValidator;

/** Схема считается пригодной, если её принимает тот же компилятор, что и при вызове модели. */
final readonly class AiResponseSchemaValidator implements ResponseSchemaValidator
{
    public function __construct(private JsonSchemaCompiler $compiler) {}

    public function rejectionReason(array $schema): ?string
    {
        try {
            $this->compiler->compile($schema);
        } catch (AiSchemaException $exception) {
            return $exception->getMessage();
        }

        return null;
    }
}
