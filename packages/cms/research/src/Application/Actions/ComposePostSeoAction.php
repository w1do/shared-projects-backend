<?php

declare(strict_types=1);

namespace Cms\Research\Application\Actions;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\RunInstruct\RunInstructRequestDTO;
use Cms\Content\Application\DTOs\Seo\UpsertSeoDTO;
use Cms\Content\Domain\Models\Post;
use Cms\Instructs\Domain\Models\Instruct;

/** SEO-поля поста по его тексту: общий шаг генерации по теме и пересборки. */
final readonly class ComposePostSeoAction
{
    public function __construct(private AiOperations $ai) {}

    public function handle(Instruct $instruct, Post $post, string $topic): UpsertSeoDTO
    {
        $seo = $this->ai->runInstruct(new RunInstructRequestDTO(
            rule: $instruct->rule,
            schema: $instruct->schema,
            input: [
                'title' => $post->title,
                'body' => $post->body,
                'topic' => $topic,
            ],
        ))->output;

        return UpsertSeoDTO::from([
            'title' => $this->text($seo, 'title') ?? $post->title,
            'description' => $this->text($seo, 'description'),
            'keywords' => $this->text($seo, 'keywords'),
        ]);
    }

    /** @param  array<string, mixed>  $source */
    private function text(array $source, string $key): ?string
    {
        $value = $source[$key] ?? null;

        return is_string($value) && trim($value) !== '' ? $value : null;
    }
}
