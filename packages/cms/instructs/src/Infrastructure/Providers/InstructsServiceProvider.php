<?php

declare(strict_types=1);

namespace Cms\Instructs\Infrastructure\Providers;

use Cms\Instructs\Console\SeedSystemInstructsCommand;
use Cms\Instructs\Domain\Contracts\ResponseSchemaValidator;
use Cms\Instructs\Domain\Models\Instruct;
use Cms\Instructs\Infrastructure\Ai\AiResponseSchemaValidator;
use Cms\Instructs\Infrastructure\Persistence\InstructProjectScope;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\ServiceProvider;

final class InstructsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ResponseSchemaValidator::class, AiResponseSchemaValidator::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../../../routes/admin.php');

        // Изоляция вешается здесь, а не в модели: Domain остаётся без
        // сервис-локатора, а scoped-контекст резолвится на каждый запрос.
        $app = $this->app;
        Instruct::addGlobalScope(new InstructProjectScope(
            static fn (): ProjectContext => $app->make(ProjectContext::class),
        ));

        if ($this->app->runningInConsole()) {
            $this->commands([SeedSystemInstructsCommand::class]);
        }
    }
}
