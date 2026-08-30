<?php

declare(strict_types=1);

namespace Cms\Research\Application\Exceptions;

use Illuminate\Validation\ValidationException;

/**
 * Нарушение доменного инварианта ресёрча: превышен предел одновременных прогонов,
 * темы запрошены у незавершённого исследования, тема уже использована.
 *
 * Наследник `ValidationException` по образцу `ContentRuleViolation`: тексты
 * правил живут в одном месте, а маппинг в 422 уже настроен в приложениях.
 */
final class ResearchRuleViolation extends ValidationException
{
    public static function tooManyRunning(int $limit): self
    {
        return self::withMessages([
            'query' => ["The project already has {$limit} running researches. Wait for one to finish."],
        ]);
    }

    public static function researchNotCompleted(): self
    {
        return self::withMessages(['research' => ['Topics can only be extracted from a completed research.']]);
    }

    public static function noSourcesFetched(): self
    {
        return self::withMessages(['research' => ['None of the found pages could be fetched.']]);
    }

    public static function noSourcesIndexed(): self
    {
        return self::withMessages(['research' => ['Research has no material in the knowledge base yet.']]);
    }

    public static function topicAlreadyUsed(): self
    {
        return self::withMessages(['topic' => ['A post has already been written for this topic.']]);
    }

    public static function topicRejected(): self
    {
        return self::withMessages(['topic' => ['Rejected topic cannot be used for a post.']]);
    }

    public static function buildoutAlreadyRunning(): self
    {
        return self::withMessages(['topic' => ['Project buildout is already running.']]);
    }

    public static function knowledgeBaseEmpty(): self
    {
        return self::withMessages(['topic' => ['No research material found for this topic in the knowledge base.']]);
    }

    public static function postBlocksTooFew(int $expected, int $actual): self
    {
        return self::withMessages([
            'topic' => ["The model returned {$actual} content blocks, at least {$expected} are required. Try again."],
        ]);
    }

    public static function postTooShort(int $expected, int $actual): self
    {
        return self::withMessages([
            'topic' => ["The model returned {$actual} characters of content, at least {$expected} are required. Try again."],
        ]);
    }

    public static function seoRebuildAlreadyRunning(): self
    {
        return self::withMessages(['entities' => ['SEO rebuild is already running for this project.']]);
    }

    public static function citySeoAdaptationAlreadyRunning(): self
    {
        return self::withMessages(['topic' => ['Адаптация SEO городов уже выполняется в этом проекте.']]);
    }

    public static function projectTopicMissing(): self
    {
        return self::withMessages(['topic' => ['У проекта не задана тематика: укажите её при запуске.']]);
    }

    public static function imageSearchUnavailable(): self
    {
        return self::withMessages(['query' => ['The image search service is unavailable or rejected the request.']]);
    }
}
