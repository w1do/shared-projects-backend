<?php

declare(strict_types=1);

namespace Cms\Ai\Infrastructure\Ai;

use Cms\Ai\Application\Exceptions\AiSchemaException;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\JsonSchema as SchemaFactory;
use Illuminate\JsonSchema\Types\ObjectType;
use Illuminate\JsonSchema\Types\Type;
use InvalidArgumentException;
use Throwable;

/**
 * Компиляция JSON-схемы, пришедшей данными (инструкция оператора), в схему
 * структурного ответа SDK.
 *
 * Схема разбирается сразу в compile(): непригодная схема — отказ до обращения
 * к провайдеру, а не ошибка в момент вызова модели.
 */
final class JsonSchemaCompiler
{
    /**
     * @param  array<string, mixed>  $schema  корневая схема типа object
     * @return callable(JsonSchema): array<string, Type>
     *
     * @throws AiSchemaException
     */
    public function compile(array $schema): callable
    {
        $properties = $this->rootProperties($schema);

        return static fn (JsonSchema $builder): array => $properties;
    }

    /**
     * @param  array<string, mixed>  $schema
     * @return array<string, Type>
     *
     * @throws AiSchemaException
     */
    private function rootProperties(array $schema): array
    {
        if (($schema['type'] ?? 'object') !== 'object') {
            throw new AiSchemaException('AI response schema must describe an object at the root.');
        }

        if (! isset($schema['properties']) || ! is_array($schema['properties']) || $schema['properties'] === []) {
            throw new AiSchemaException('AI response schema must declare at least one property.');
        }

        $root = $this->deserialize($schema);

        if (! $root instanceof ObjectType) {
            throw new AiSchemaException('AI response schema must describe an object at the root.');
        }

        return $this->propertiesOf($root);
    }

    /**
     * @param  array<string, mixed>  $schema
     *
     * @throws AiSchemaException
     */
    private function deserialize(array $schema): Type
    {
        try {
            return SchemaFactory::fromArray($schema);
        } catch (InvalidArgumentException $error) {
            throw AiSchemaException::wrap($error);
        } catch (Throwable $error) {
            throw AiSchemaException::wrap($error);
        }
    }

    /**
     * Свойства объекта закрыты в типе SDK: схема структурного ответа принимает
     * именно их, а не сам объект.
     *
     * @return array<string, Type>
     */
    private function propertiesOf(ObjectType $root): array
    {
        /** @var array<string, Type> $properties */
        $properties = (fn (): array => $this->properties)->call($root);

        return $properties;
    }
}
