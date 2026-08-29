<?php

declare(strict_types=1);

namespace Cms\Research\Console;

use Cms\Research\Domain\Contracts\KnowledgeBase;
use Illuminate\Console\Command;

/** Создание коллекции базы знаний под текущую размерность векторов (вызывается на деплое). */
final class ProvisionKnowledgeCommand extends Command
{
    protected $signature = 'knowledge:provision';

    protected $description = 'Create the knowledge base collection if it does not exist';

    public function handle(KnowledgeBase $knowledge): int
    {
        $knowledge->provision();

        $this->info('Knowledge base collection is ready.');

        return self::SUCCESS;
    }
}
