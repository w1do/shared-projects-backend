<?php

declare(strict_types=1);

namespace Cms\Localization\Infrastructure\Jobs;

use Cms\Localization\Application\Commands\TranslateDictionaryCommand;
use Cms\Localization\Application\Commands\TranslateSubjectsCommand;
use Cms\Localization\Application\Handlers\TranslateDictionaryHandler;
use Cms\Localization\Application\Handlers\TranslateSubjectsHandler;
use Cms\Localization\Infrastructure\TranslationsVersion;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Автоперевод недостающих локалей проекта: диспетчеризация по предмету.
 *
 * Сам перевод — в handlers (словарь и предметы чужих пакетов), версия словаря
 * растёт один раз и только если что-то изменилось.
 */
final class TranslateMissingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @param  list<int>|null  $ids  ограничить набор записей; null — весь словарь
     * @param  list<string>  $targetLocales  локали проекта
     */
    public function __construct(
        public readonly string $projectId,
        public readonly array $targetLocales,
        public readonly string $defaultLocale,
        public readonly ?array $ids = null,
        /** dictionary | categories | null — оба предмета */
        public readonly ?string $subject = null,
    ) {}

    public function handle(
        ProjectContext $context,
        TranslationsVersion $version,
        TranslateDictionaryHandler $dictionary,
        TranslateSubjectsHandler $subjects,
    ): void {
        $context->set($this->projectId);

        $changedAnything = false;
        if ($this->subject === null || $this->subject === 'dictionary') {
            $changedAnything = $dictionary->handle(new TranslateDictionaryCommand(
                targetLocales: $this->targetLocales,
                defaultLocale: $this->defaultLocale,
                ids: $this->ids,
            ));
        }

        // Предметы чужих пакетов: реестр сам отбирает адаптеры по subject.
        $changedAnything = $subjects->handle(new TranslateSubjectsCommand(
            targetLocales: $this->targetLocales,
            defaultLocale: $this->defaultLocale,
            subject: $this->subject,
        )) || $changedAnything;

        if ($changedAnything) {
            $version->bump($this->projectId);
        }
    }

    public function failed(Throwable $error): void
    {
        Log::error('translate-missing failed', ['project' => $this->projectId, 'error' => $error->getMessage()]);
    }
}
