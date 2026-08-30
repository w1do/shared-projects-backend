<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Content\Application\Commands\UpsertPostCommand;
use Cms\Content\Application\Commands\UpsertSeoCommand;
use Cms\Content\Application\DTOs\Post\UpsertPostDTO;
use Cms\Content\Application\Handlers\UpsertPostHandler;
use Cms\Content\Application\Handlers\UpsertSeoHandler;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Post;
use Cms\Instructs\Application\Actions\RecordInstructUsageAction;
use Cms\Instructs\Application\Actions\ResolveInstructAction;
use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Research\Application\Actions\ComposePostDraftAction;
use Cms\Research\Application\Actions\ComposePostSeoAction;
use Cms\Research\Application\Commands\GeneratePostCommand;
use Cms\Research\Application\DTOs\PostDraft\PostDraftDTO;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Application\Queries\SearchKnowledgeQuery;
use Cms\Research\Domain\Enums\TopicStatus;
use Cms\Research\Domain\Models\ResearchTopic;
use Cms\Research\Domain\ValueObjects\KnowledgeFilter;
use Cms\Research\Domain\ValueObjects\KnowledgeHit;
use Cms\Shared\BackgroundTasks\TaskProgress;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Contracts\Translation\Translator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;

/**
 * Пост по выбранной теме: текст опирается на материалы базы знаний, категории,
 * теги и SEO проставляются сразу, пост появляется черновиком.
 */
final readonly class GeneratePostFromTopicHandler
{
    public function __construct(
        private ResolveInstructAction $instructs,
        private RecordInstructUsageAction $usages,
        private ComposePostDraftAction $draft,
        private ComposePostSeoAction $draftSeo,
        private SearchKnowledgeQuery $knowledge,
        private UpsertPostHandler $posts,
        private UpsertSeoHandler $seo,
        private Config $config,
        private Translator $translator,
        private TaskProgress $progress,
    ) {}

    public function handle(GeneratePostCommand $command): Post
    {
        $topic = ResearchTopic::query()->whereKey($command->topicId)->first();

        if ($topic === null) {
            throw (new ModelNotFoundException)->setModel(ResearchTopic::class, [$command->topicId]);
        }

        $this->assertUsable($topic);

        $this->stage($command, 'preparing');
        $materials = $this->materials($topic);

        if ($materials === []) {
            throw ResearchRuleViolation::knowledgeBaseEmpty();
        }

        $bodyInstruct = $this->instructs->handle(InstructCategory::PostBody);

        $this->stage($command, 'ai_request');
        $draft = $this->draft->handle($bodyInstruct, $topic->title, $topic->rationale, $materials);

        $this->stage($command, 'saving');
        $post = $this->posts->handle(new UpsertPostCommand(
            UpsertPostDTO::from([
                'title' => $draft->title ?? $topic->title,
                'slug' => $this->slug($draft, $topic),
                'blocks' => $draft->blocks,
                'categories' => [$this->categoryId($topic)],
                'tags' => $draft->tags,
            ]),
            authorId: $command->authorId,
        ));

        $seoInstruct = $this->instructs->handle(InstructCategory::PostSeo);
        $this->seo->handle(new UpsertSeoCommand($post, $this->draftSeo->handle($seoInstruct, $post, $topic->title)));

        $topic->forceFill(['status' => TopicStatus::Used, 'post_id' => $post->getKey()])->save();

        $this->usages->handle($bodyInstruct, $post);

        return $post;
    }

    /** Этап работы уходит в реестр задач, только если генерацию запустила задача. */
    private function stage(GeneratePostCommand $command, string $stage): void
    {
        if ($command->taskId !== null) {
            $this->progress->stage($command->taskId, $stage);
        }
    }

    private function assertUsable(ResearchTopic $topic): void
    {
        if ($topic->status === TopicStatus::Used) {
            throw ResearchRuleViolation::topicAlreadyUsed();
        }

        if ($topic->status === TopicStatus::Rejected) {
            throw ResearchRuleViolation::topicRejected();
        }
    }

    /** @return list<string> */
    private function materials(ResearchTopic $topic): array
    {
        $hits = $this->knowledge->handle(
            query: $topic->title.' '.(string) $topic->rationale,
            limit: (int) $this->config->get('cms-research.post_context_limit', 12),
            filter: new KnowledgeFilter(researchId: $topic->research_id),
        );

        return array_values(array_filter(array_map(
            static fn (KnowledgeHit $hit): string => trim($hit->topic."\n".$hit->content),
            $hits,
        ), static fn (string $material): bool => $material !== ''));
    }

    /**
     * Предложенная категория создаётся, если её ещё нет в проекте.
     *
     * Привязка темы проверяется на существование: оператор мог удалить
     * категорию после извлечения тем, и мёртвая ссылка роняла бы генерацию
     * нарушением внешнего ключа уже после написания текста.
     */
    private function categoryId(ResearchTopic $topic): int
    {
        if ($topic->category_id !== null && Category::query()->whereKey($topic->category_id)->exists()) {
            return $topic->category_id;
        }

        $name = $topic->suggested_category ?? 'Без категории';
        $slug = Str::slug($name) !== '' ? Str::slug($name) : 'category-'.$topic->getKey();

        $existing = Category::query()->where('slug', $slug)->first();

        if ($existing !== null) {
            $topic->forceFill(['category_id' => $existing->getKey()])->save();

            return (int) $existing->getKey();
        }

        $category = new Category;
        $category->setTranslation('name', $this->translator->getLocale(), $name);
        $category->slug = $slug;
        $category->saveAsRoot();

        $topic->forceFill(['category_id' => $category->getKey()])->save();

        return (int) $category->getKey();
    }

    private function slug(PostDraftDTO $draft, ResearchTopic $topic): string
    {
        if ($draft->slug !== null && Str::slug($draft->slug) !== '') {
            return Str::slug($draft->slug);
        }

        $fromTitle = Str::slug($topic->title);

        return $fromTitle !== '' ? $fromTitle : 'topic-'.$topic->getKey();
    }
}
