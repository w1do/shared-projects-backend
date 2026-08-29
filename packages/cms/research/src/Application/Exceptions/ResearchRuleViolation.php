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
}
