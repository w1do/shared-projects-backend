<?php

declare(strict_types=1);

namespace Cms\Localization\Application\Handlers;

use Cms\Localization\Application\Commands\DeleteTranslationCommand;
use Cms\Localization\Domain\Models\Translation;
use Cms\Localization\Infrastructure\TranslationsVersion;

final class DeleteTranslationHandler
{
    public function __construct(private readonly TranslationsVersion $version) {}

    public function handle(DeleteTranslationCommand $command): void
    {
        // Поиск в скоупе проекта: запись чужого проекта не находится (404).
        $translation = Translation::query()->findOrFail($command->translationId);

        $projectId = $translation->project_id;
        $translation->delete();

        $this->version->bump($projectId);
    }
}
