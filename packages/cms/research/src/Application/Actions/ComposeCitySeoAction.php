<?php

declare(strict_types=1);

namespace Cms\Research\Application\Actions;

use Cms\Ai\Application\Contracts\AiOperations;
use Cms\Ai\Application\DTOs\RunInstruct\RunInstructRequestDTO;
use Cms\Content\Application\DTOs\Seo\UpsertSeoDTO;
use Cms\Content\Domain\Models\City;
use Cms\Instructs\Domain\Models\Instruct;

/** SEO-поля города под тематику проекта. */
final readonly class ComposeCitySeoAction
{
    public function __construct(private AiOperations $ai) {}

    public function handle(Instruct $instruct, City $city, string $topic): UpsertSeoDTO
    {
        $seo = $this->ai->runInstruct(new RunInstructRequestDTO(
            rule: $instruct->rule,
            schema: $instruct->schema,
            input: [
                'city' => $city->name,
                'region' => $city->region->name,
                'population' => $city->population,
                'topic' => $topic,
            ],
        ))->output;

        return UpsertSeoDTO::from([
            'title' => $this->text($seo, 'title') ?? $city->name,
            'description' => $this->text($seo, 'description'),
            'keywords' => $this->text($seo, 'keywords'),
            'og_title' => $this->text($seo, 'og_title'),
            'og_description' => $this->text($seo, 'og_description'),
            'twitter_card' => $this->text($seo, 'twitter_card'),
        ]);
    }

    /** @param  array<string, mixed>  $source */
    private function text(array $source, string $key): ?string
    {
        $value = $source[$key] ?? null;

        return is_string($value) && trim($value) !== '' ? $value : null;
    }
}
