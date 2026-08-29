<?php

declare(strict_types=1);

namespace Cms\Research\Application\Handlers;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\RunInstruct\RunInstructRequestDTO;
use Cms\Content\Application\Commands\UpsertPostCommand;
use Cms\Content\Application\Commands\UpsertSeoCommand;
use Cms\Content\Application\DTOs\Post\UpsertPostDTO;
use Cms\Content\Application\DTOs\Seo\UpsertSeoDTO;
use Cms\Content\Application\Handlers\UpsertPostHandler;
use Cms\Content\Application\Handlers\UpsertSeoHandler;
use Cms\Content\Domain\Models\Category;
use Cms\Content\Domain\Models\Post;
use Cms\Instructs\Application\Actions\RecordInstructUsageAction;
use Cms\Instructs\Application\Actions\ResolveInstructAction;
use Cms\Instructs\Domain\Enums\InstructCategory;
use Cms\Research\Application\Commands\GeneratePostCommand;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Cms\Research\Application\Queries\SearchKnowledgeQuery;
use Cms\Research\Domain\Enums\TopicStatus;
use Cms\Research\Domain\Models\ResearchTopic;
use Cms\Research\Domain\ValueObjects\KnowledgeFilter;
use Cms\Research\Domain\ValueObjects\KnowledgeHit;
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
        private AiOperations $ai,
        private ResolveInstructAction $instructs,
        private RecordInstructUsageAction $usages,
        private SearchKnowledgeQuery $knowledge,
        private UpsertPostHandler $posts,
        private UpsertSeoHandler $seo,
        private Config $config,
        private Translator $translator,
    ) {}

    public function handle(GeneratePostCommand $command): Post
    {
        $topic = ResearchTopic::query()->whereKey($command->topicId)->first();

        if ($topic === null) {
            throw (new ModelNotFoundException)->setModel(ResearchTopic::class, [$command->topicId]);
        }

        $this->assertUsable($topic);

        $materials = $this->materials($topic);

        if ($materials === []) {
            throw ResearchRuleViolation::knowledgeBaseEmpty();
        }

        $bodyInstruct = $this->instructs->handle(InstructCategory::PostBody);

        $draft = $this->ai->runInstruct(new RunInstructRequestDTO(
            rule: $bodyInstruct->rule,
            schema: $bodyInstruct->schema,
            input: [
                'topic' => $topic->title,
                'rationale' => $topic->rationale,
                'materials' => $materials,
                'locale' => $this->translator->getLocale(),
            ],
        ))->output;

        $post = $this->posts->handle(new UpsertPostCommand(
            UpsertPostDTO::from([
                'title' => $this->text($draft, 'title') ?? $topic->title,
                'slug' => $this->slug($draft, $topic),
                'blocks' => $this->blocks($draft),
                'categories' => [$this->categoryId($topic)],
                'tags' => $this->tags($draft),
            ]),
            authorId: $command->authorId,
        ));

        $this->fillSeo($post, $draft, $topic);

        $topic->forceFill(['status' => TopicStatus::Used, 'post_id' => $post->getKey()])->save();

        $this->usages->handle($bodyInstruct, $post);

        return $post;
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

    /** @param array<string, mixed> $draft */
    private function fillSeo(Post $post, array $draft, ResearchTopic $topic): void
    {
        $seoInstruct = $this->instructs->handle(InstructCategory::PostSeo);

        $seo = $this->ai->runInstruct(new RunInstructRequestDTO(
            rule: $seoInstruct->rule,
            schema: $seoInstruct->schema,
            input: [
                'title' => $post->title,
                'body' => $post->body,
                'topic' => $topic->title,
            ],
        ))->output;

        $this->seo->handle(new UpsertSeoCommand($post, UpsertSeoDTO::from([
            'title' => $this->text($seo, 'title') ?? $post->title,
            'description' => $this->text($seo, 'description'),
            'keywords' => $this->text($seo, 'keywords'),
        ])));
    }

    /**
     * Содержимое поста блоками: ответ короче предела по числу блоков или по
     * объёму текста отклоняется, а не превращается в пост из одного абзаца.
     *
     * @param  array<string, mixed>  $draft
     * @return list<array{title: string, markdown: string}>
     */
    private function blocks(array $draft): array
    {
        $raw = $draft['blocks'] ?? [];
        $blocks = [];

        foreach (is_array($raw) ? $raw : [] as $block) {
            if (! is_array($block)) {
                continue;
            }

            $markdown = trim((string) ($block['markdown'] ?? ''));

            if ($markdown === '') {
                continue;
            }

            $blocks[] = ['title' => trim((string) ($block['title'] ?? '')), 'markdown' => $markdown];
        }

        $minBlocks = (int) $this->config->get('cms-research.post_min_blocks', 10);

        if (count($blocks) < $minBlocks) {
            throw ResearchRuleViolation::postBlocksTooFew($minBlocks, count($blocks));
        }

        // Десять блоков по строчке — не пост: объём проверяется отдельно
        $length = array_sum(array_map(static fn (array $block): int => mb_strlen($block['markdown']), $blocks));
        $minLength = (int) $this->config->get('cms-research.post_min_length', 8000);

        if ($length < $minLength) {
            throw ResearchRuleViolation::postTooShort($minLength, $length);
        }

        return $blocks;
    }

    /**
     * @param  array<string, mixed>  $draft
     * @return list<string>
     */
    private function tags(array $draft): array
    {
        $tags = $draft['tags'] ?? [];

        if (! is_array($tags)) {
            return [];
        }

        return array_values(array_unique(array_filter(
            array_map(static fn (mixed $tag): string => is_string($tag) ? trim($tag) : '', $tags),
            static fn (string $tag): bool => $tag !== '',
        )));
    }

    /** @param array<string, mixed> $draft */
    private function slug(array $draft, ResearchTopic $topic): string
    {
        $slug = $this->text($draft, 'slug');

        if ($slug !== null && Str::slug($slug) !== '') {
            return Str::slug($slug);
        }

        $fromTitle = Str::slug($topic->title);

        return $fromTitle !== '' ? $fromTitle : 'topic-'.$topic->getKey();
    }

    /** @param array<string, mixed> $source */
    private function text(array $source, string $key): ?string
    {
        $value = $source[$key] ?? null;

        return is_string($value) && trim($value) !== '' ? $value : null;
    }
}
