<?php

declare(strict_types=1);

namespace Cms\Generators;

use Illuminate\Support\ServiceProvider;

final class GeneratorsServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([MakeModuleCommand::class]);
        }
    }
}
