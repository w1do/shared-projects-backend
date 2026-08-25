<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Handlers;

use Cms\Localization\Domain\Models\Translation;
use Cms\Localization\Infrastructure\TranslationsVersion;

final class DeleteTranslationHandler
{
    public function __construct(private readonly TranslationsVersion $version) {}

    public function handle(Translation $translation): void
    {
        $projectId = $translation->project_id;
        $translation->delete();

        $this->version->bump($projectId);
    }
}
