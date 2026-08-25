<?php

declare(strict_types=1);

namespace Cms\Ai\Infrastructure;

use Cms\Ai\Application\DTOs\GeneratePost\GeneratePostRequestDTO;
use Cms\Ai\Application\DTOs\GeneratePost\PostDraftDTO;
use Cms\Ai\Application\DTOs\Normalize\NormalizeRequestDTO;
use Cms\Ai\Application\DTOs\Normalize\NormalizeResultDTO;
use Cms\Ai\Application\DTOs\Rewrite\RewriteRequestDTO;
use Cms\Ai\Application\DTOs\Rewrite\RewriteResultDTO;
use Cms\Ai\Application\DTOs\SuggestCategories\CategorySuggestionDTO;
use Cms\Ai\Application\DTOs\SuggestCategories\CategoryTreeDTO;
use Cms\Ai\Application\DTOs\SuggestCategories\SuggestCategoriesRequestDTO;
use Cms\Ai\Application\DTOs\Translate\TranslateRequestDTO;
use Cms\Ai\Application\DTOs\Translate\TranslateResultDTO;
use Cms\Ai\Domain\Contracts\AiOperations;
use Cms\Ai\Domain\Exceptions\AiConfigurationException;
use Cms\Ai\Domain\Exceptions\AiException;
use Cms\Ai\Domain\Exceptions\AiRequestException;
use Cms\Ai\Domain\Exceptions\AiResponseException;
use Cms\Ai\Infrastructure\Agents\StructuredAgent;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Responses\StructuredAgentResponse;
use Throwable;

/**
 * Адаптер контракта поверх laravel/ai — единственное место, знающее про SDK.
 *
 * Каждая операция: инструкция + JSON-схема результата → structured-вызов →
 * маппинг в DTO. Ответ, не прошедший схему или маппинг, — AiResponseException;
 * потребитель никогда не получает сырой текст модели.
 */
final class LaravelAiOperations implements AiOperations
{
    private const REWRITE_INSTRUCTIONS = 'You are a text editor. Rewrite the given text following the provided instruction. Preserve the meaning and the language of the original text unless the instruction says otherwise.';

    private const NORMALIZE_INSTRUCTIONS = 'You are a text normalizer. Clean up the given text: fix punctuation, spacing, capitalization and obvious typos. Do not change the meaning, the language or the tone. Apply the normalization profile if provided.';

    private const TRANSLATE_INSTRUCTIONS = 'You are a professional translator. Translate every given item into every requested target locale. Keep placeholders, markup and formatting intact. If an item is already in the target locale, return it unchanged.';

    private const SUGGEST_CATEGORIES_INSTRUCTIONS = 'You design content taxonomies. Suggest a category tree for the described project: concise names in the requested locale and latin kebab-case slugs. Use parent_slug to express nesting; null for root categories. Slugs must be unique.';

    private const GENERATE_POST_INSTRUCTIONS = 'You are a content writer. Draft a blog post on the given topic in the requested locale: a concise title, a latin kebab-case slug derived from the title, and a well-structured body in plain HTML paragraphs.';

    /** @param array{provider: string, api_key: ?string, model: string, timeout: int} $config */
    public function __construct(private readonly array $config) {}

    public function rewrite(RewriteRequestDTO $request): RewriteResultDTO
    {
        $structured = $this->invoke(
            self::REWRITE_INSTRUCTIONS,
            fn (JsonSchema $schema): array => ['text' => $schema->string()->description('The rewritten text')->required()],
            ['text' => $request->text, 'instruction' => $request->instruction],
        );

        return new RewriteResultDTO(text: $this->stringField($structured, 'text'));
    }

    public function normalize(NormalizeRequestDTO $request): NormalizeResultDTO
    {
        $structured = $this->invoke(
            self::NORMALIZE_INSTRUCTIONS,
            fn (JsonSchema $schema): array => ['text' => $schema->string()->description('The normalized text')->required()],
            ['text' => $request->text, 'profile' => $request->profile],
        );

        return new NormalizeResultDTO(text: $this->stringField($structured, 'text'));
    }

    public function translate(TranslateRequestDTO $request): TranslateResultDTO
    {
        // Схема с фиксированными полями вместо динамических ключей: строгий
        // structured output не дружит с произвольными именами свойств.
        $structured = $this->invoke(
            self::TRANSLATE_INSTRUCTIONS,
            fn (JsonSchema $schema): array => [
                'items' => $schema->array()->items(
                    $schema->object([
                        'key' => $schema->string()->required(),
                        'locale' => $schema->string()->required(),
                        'value' => $schema->string()->required(),
                    ]),
                )->required(),
            ],
            [
                'items' => $request->texts,
                'target_locales' => $request->targetLocales,
                'source_locale' => $request->sourceLocale,
                'context' => $request->context,
            ],
        );

        $translations = [];
        foreach ($this->listField($structured, 'items') as $item) {
            if (! is_array($item) || ! isset($item['key'], $item['locale'], $item['value'])) {
                throw new AiResponseException('AI translation item is malformed.');
            }
            $translations[(string) $item['key']][(string) $item['locale']] = (string) $item['value'];
        }

        // Полнота ответа: каждая строка переведена на каждую запрошенную локаль.
        foreach (array_keys($request->texts) as $key) {
            foreach ($request->targetLocales as $locale) {
                if (! isset($translations[$key][$locale])) {
                    throw new AiResponseException("AI translation is missing locale '{$locale}' for key '{$key}'.");
                }
            }
        }

        return new TranslateResultDTO(translations: $translations);
    }

    public function suggestCategories(SuggestCategoriesRequestDTO $request): CategoryTreeDTO
    {
        // Плоский список с parent_slug вместо рекурсивной схемы: рекурсия в
        // JSON-схемах поддерживается провайдерами непредсказуемо.
        $structured = $this->invoke(
            self::SUGGEST_CATEGORIES_INSTRUCTIONS,
            fn (JsonSchema $schema): array => [
                'categories' => $schema->array()->items(
                    $schema->object([
                        'name' => $schema->string()->required(),
                        'slug' => $schema->string()->required(),
                        'parent_slug' => $schema->string()->nullable()->required(),
                    ]),
                )->required(),
            ],
            [
                'project_description' => $request->projectDescription,
                'max_count' => $request->maxCount,
                'locale' => $request->locale,
            ],
        );

        return new CategoryTreeDTO(categories: $this->buildTree($this->listField($structured, 'categories')));
    }

    public function generatePost(GeneratePostRequestDTO $request): PostDraftDTO
    {
        $structured = $this->invoke(
            self::GENERATE_POST_INSTRUCTIONS,
            fn (JsonSchema $schema): array => [
                'title' => $schema->string()->required(),
                'slug' => $schema->string()->required(),
                'body' => $schema->string()->required(),
            ],
            [
                'topic' => $request->topic,
                'instructions' => $request->instructions,
                'locale' => $request->locale,
            ],
        );

        return new PostDraftDTO(
            title: $this->stringField($structured, 'title'),
            slug: $this->stringField($structured, 'slug'),
            body: $this->stringField($structured, 'body'),
        );
    }

    /**
     * Structured-вызов SDK: конфигурация проверяется до сети, отказы провайдера
     * оборачиваются в исключения пакета без утечки ключа.
     *
     * @param  callable(JsonSchema): array<string, mixed>  $schema
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function invoke(string $instructions, callable $schema, array $payload): array
    {
        if (($this->config['api_key'] ?? null) === null || $this->config['api_key'] === '') {
            throw new AiConfigurationException(
                'AI provider key is not configured. Set OPENAI_API_KEY in the environment.',
            );
        }

        $agent = new StructuredAgent($instructions, $schema);

        try {
            $response = $agent->prompt(
                json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                provider: $this->config['provider'],
                model: $this->config['model'],
                timeout: $this->config['timeout'],
            );
        } catch (AiException $exception) {
            throw $exception;
        } catch (Throwable $error) {
            throw AiRequestException::wrap($error);
        }

        if (! $response instanceof StructuredAgentResponse) {
            throw new AiResponseException('AI provider returned an unstructured response.');
        }

        /** @var array<string, mixed> */
        return $response->structured;
    }

    /** @param array<string, mixed> $structured */
    private function stringField(array $structured, string $field): string
    {
        if (! isset($structured[$field]) || ! is_string($structured[$field])) {
            throw new AiResponseException("AI response is missing the '{$field}' field.");
        }

        return $structured[$field];
    }

    /** @return list<mixed> */
    private function listField(array $structured, string $field): array
    {
        if (! isset($structured[$field]) || ! is_array($structured[$field])) {
            throw new AiResponseException("AI response is missing the '{$field}' list.");
        }

        return array_values($structured[$field]);
    }

    /**
     * Плоский список {name, slug, parent_slug} → дерево DTO.
     *
     * @param  list<mixed>  $rows
     * @return list<CategorySuggestionDTO>
     */
    private function buildTree(array $rows): array
    {
        $children = [];
        $order = [];

        foreach ($rows as $row) {
            if (! is_array($row) || ! isset($row['name'], $row['slug'])) {
                throw new AiResponseException('AI category suggestion is malformed.');
            }
            $parent = isset($row['parent_slug']) && is_string($row['parent_slug']) && $row['parent_slug'] !== ''
                ? $row['parent_slug']
                : null;
            $children[$parent ?? ''][] = ['name' => (string) $row['name'], 'slug' => (string) $row['slug']];
            $order[(string) $row['slug']] = true;
        }

        $build = function (?string $parentSlug) use (&$build, $children): array {
            $nodes = [];
            foreach ($children[$parentSlug ?? ''] ?? [] as $row) {
                $nodes[] = new CategorySuggestionDTO(
                    name: $row['name'],
                    slug: $row['slug'],
                    children: $build($row['slug']),
                );
            }

            return $nodes;
        };

        unset($order);

        return $build(null);
    }
}
