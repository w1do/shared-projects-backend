<?php

declare(strict_types=1);

namespace Cms\Research\Application\Actions;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\RunInstruct\RunInstructRequestDTO;
use Cms\Instructs\Domain\Models\Instruct;
use Cms\Research\Application\DTOs\PostDraft\PostDraftDTO;
use Cms\Research\Application\Exceptions\ResearchRuleViolation;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Contracts\Translation\Translator;

/**
 * Черновик поста по инструкции и материалам базы знаний: один способ получать
 * текст и для генерации по теме, и для пересборки существующего поста.
 */
final readonly class ComposePostDraftAction
{
    public function __construct(
        private AiOperations $ai,
        private Config $config,
        private Translator $translator,
    ) {}

    /** @param  list<string>  $materials */
    public function handle(Instruct $instruct, string $topic, ?string $rationale, array $materials): PostDraftDTO
    {
        $draft = $this->ai->runInstruct(new RunInstructRequestDTO(
            rule: $instruct->rule,
            schema: $instruct->schema,
            input: [
                'topic' => $topic,
                'rationale' => $rationale,
                'materials' => $materials,
                'locale' => $this->translator->getLocale(),
            ],
        ))->output;

        return new PostDraftDTO(
            title: $this->text($draft, 'title'),
            slug: $this->text($draft, 'slug'),
            blocks: $this->blocks($draft),
            tags: $this->tags($draft),
        );
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

    /** @param  array<string, mixed>  $source */
    private function text(array $source, string $key): ?string
    {
        $value = $source[$key] ?? null;

        return is_string($value) && trim($value) !== '' ? $value : null;
    }
}
