<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Research\Application\Commands\RejectTopicCommand;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Domain\Enums\TopicStatus;
use Cms\Research\Domain\Models\ResearchTopic;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/** Отклонённая тема перестаёт предлагаться, но остаётся в истории. */
final readonly class RejectTopicHandler
{
    public function handle(RejectTopicCommand $command): ResearchTopic
    {
        $topic = ResearchTopic::query()->whereKey($command->topicId)->first();

        if ($topic === null) {
            throw (new ModelNotFoundException)->setModel(ResearchTopic::class, [$command->topicId]);
        }

        if ($topic->status === TopicStatus::Rejected) {
            return $topic;
        }

        if (! $topic->status->canTransitionTo(TopicStatus::Rejected)) {
            throw ResearchRuleViolation::topicAlreadyUsed();
        }

        $topic->status = TopicStatus::Rejected;
        $topic->save();

        return $topic;
    }
}
