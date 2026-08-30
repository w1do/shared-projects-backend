<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Content\Application\Commands\UpsertPostCommand;
use Cms\Content\Application\Commands\UpsertSeoCommand;
use Cms\Content\Application\DTOs\Post\UpsertPostDTO;
use Cms\Content\Application\Handlers\UpsertPostHandler;
use Cms\Content\Application\Handlers\UpsertSeoHandler;
use Cms\Content\Domain\Models\Post;
use Cms\Instructs\Application\Actions\RecordInstructUsageAction;
use Cms\Instructs\Application\Actions\ResolveInstructAction;
use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Research\Application\Actions\ComposePostDraftAction;
use Cms\Research\Application\Actions\ComposePostSeoAction;
use Cms\Research\Application\Commands\RebuildPostCommand;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Application\Queries\SearchKnowledgeQuery;
use Cms\Research\Domain\ValueObjects\KnowledgeHit;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Illuminate\Contracts\Config\Repository as Config;

/**
 * Пересборка существующего поста: заголовок, содержимое и SEO собираются
 * заново по материалам базы знаний. Адрес, категории, теги, изображения и
 * статус остаются прежними, прежнее содержимое уходит ревизией.
 */
final readonly class RebuildPostHandler
{
    /** Пересобранный пост не длиннее десяти блоков. */
    private const MAX_BLOCKS = 10;

    public function __construct(
        private ResolveInstructAction $instructs,
        private RecordInstructUsageAction $usages,
        private ComposePostDraftAction $draft,
        private ComposePostSeoAction $draftSeo,
        private SearchKnowledgeQuery $knowledge,
        private UpsertPostHandler $posts,
        private UpsertSeoHandler $seo,
        private Config $config,
        private TaskProgress $progress,
    ) {}

    public function handle(RebuildPostCommand $command): Post
    {
        $post = Post::query()->findOrFail($command->postId);

        $this->stage($command, 'preparing');
        $materials = $this->materials($post);

        if ($materials === []) {
            throw ResearchRuleViolation::knowledgeBaseEmpty();
        }

        $bodyInstruct = $this->instructs->handle(InstructCategory::PostBody);

        $this->stage($command, 'ai_request');
        $draft = $this->draft->handle($bodyInstruct, $post->title, null, $materials);

        $this->stage($command, 'saving');
        $rebuilt = $this->posts->handle(new UpsertPostCommand(
            UpsertPostDTO::from([
                'title' => $draft->title ?? $post->title,
                'blocks' => array_slice($draft->blocks, 0, self::MAX_BLOCKS),
            ]),
            $post,
            $command->authorId,
        ));

        $seoInstruct = $this->instructs->handle(InstructCategory::PostSeo);
        $this->seo->handle(new UpsertSeoCommand($rebuilt, $this->draftSeo->handle($seoInstruct, $rebuilt, $rebuilt->title)));

        $this->usages->handle($bodyInstruct, $rebuilt);

        return $rebuilt;
    }

    /** Этап работы уходит в реестр задач, только если пересборку запустила задача. */
    private function stage(RebuildPostCommand $command, string $stage): void
    {
        if ($command->taskId !== null) {
            $this->progress->stage($command->taskId, $stage);
        }
    }

    /**
     * Материалы ищутся по заголовку и тексту блоков: пост мог быть написан
     * руками и темы исследования не иметь.
     *
     * @return list<string>
     */
    private function materials(Post $post): array
    {
        $blocks = array_map(
            static fn (array $block): string => trim($block['title'].' '.$block['markdown']),
            $post->blocks ?? [],
        );

        $hits = $this->knowledge->handle(
            query: trim($post->title.' '.implode(' ', $blocks)),
            limit: (int) $this->config->get('cms-research.post_context_limit', 12),
        );

        return array_values(array_filter(array_map(
            static fn (KnowledgeHit $hit): string => trim($hit->topic."\n".$hit->content),
            $hits,
        ), static fn (string $material): bool => $material !== ''));
    }
}
