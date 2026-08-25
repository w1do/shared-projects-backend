<?php

declare(strict_types=1);

namespace Cms\Ai\Infrastructure\Ai;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\GeneratePost\GeneratePostRequestDTO;
use Cms\Ai\Application\DTOs\GeneratePost\PostDraftDTO;
use Cms\Ai\Application\DTOs\Normalize\NormalizeRequestDTO;
use Cms\Ai\Application\DTOs\Normalize\NormalizeResultDTO;
use Cms\Ai\Application\DTOs\Rewrite\RewriteRequestDTO;
use Cms\Ai\Application\DTOs\Rewrite\RewriteResultDTO;
use Cms\Ai\Application\DTOs\SuggestCategories\CategoryTreeDTO;
use Cms\Ai\Application\DTOs\SuggestCategories\SuggestCategoriesRequestDTO;
use Cms\Ai\Application\DTOs\Translate\TranslateRequestDTO;
use Cms\Ai\Application\DTOs\Translate\TranslateResultDTO;

/**
 * Адаптер контракта поверх laravel/ai.
 *
 * Каждая операция: инструкция (PromptCatalog) + JSON-схема результата
 * (ResponseSchemas) → structured-вызов (StructuredPromptRunner) → маппинг в DTO
 * (StructuredResponseMapper).
 */
final readonly class LaravelAiOperations implements AiOperations
{
    public function __construct(
        private StructuredPromptRunner $runner,
        private StructuredResponseMapper $mapper,
    ) {}

    public function rewrite(RewriteRequestDTO $request): RewriteResultDTO
    {
        $structured = $this->runner->run(
            PromptCatalog::REWRITE,
            ResponseSchemas::text('The rewritten text'),
            ['text' => $request->text, 'instruction' => $request->instruction],
        );

        return new RewriteResultDTO(text: $this->mapper->stringField($structured, 'text'));
    }

    public function normalize(NormalizeRequestDTO $request): NormalizeResultDTO
    {
        $structured = $this->runner->run(
            PromptCatalog::NORMALIZE,
            ResponseSchemas::text('The normalized text'),
            ['text' => $request->text, 'profile' => $request->profile],
        );

        return new NormalizeResultDTO(text: $this->mapper->stringField($structured, 'text'));
    }

    public function translate(TranslateRequestDTO $request): TranslateResultDTO
    {
        $structured = $this->runner->run(
            PromptCatalog::TRANSLATE,
            ResponseSchemas::translations(),
            [
                'items' => $request->texts,
                'target_locales' => $request->targetLocales,
                'source_locale' => $request->sourceLocale,
                'context' => $request->context,
            ],
        );

        return new TranslateResultDTO(
            translations: $this->mapper->translations($structured, $request->texts, $request->targetLocales),
        );
    }

    public function suggestCategories(SuggestCategoriesRequestDTO $request): CategoryTreeDTO
    {
        $structured = $this->runner->run(
            PromptCatalog::SUGGEST_CATEGORIES,
            ResponseSchemas::categories(),
            [
                'project_description' => $request->projectDescription,
                'max_count' => $request->maxCount,
                'locale' => $request->locale,
            ],
        );

        return new CategoryTreeDTO(
            categories: $this->mapper->categoryTree($this->mapper->listField($structured, 'categories')),
        );
    }

    public function generatePost(GeneratePostRequestDTO $request): PostDraftDTO
    {
        $structured = $this->runner->run(
            PromptCatalog::GENERATE_POST,
            ResponseSchemas::postDraft(),
            [
                'topic' => $request->topic,
                'instructions' => $request->instructions,
                'locale' => $request->locale,
            ],
        );

        return new PostDraftDTO(
            title: $this->mapper->stringField($structured, 'title'),
            slug: $this->mapper->stringField($structured, 'slug'),
            body: $this->mapper->stringField($structured, 'body'),
        );
    }
}
