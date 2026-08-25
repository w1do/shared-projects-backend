<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\ForgotSitePasswordCommand;
use Cms\Auth\Domain\Exceptions\TooManyAttempts;
use Cms\Auth\Domain\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

final class ForgotSitePasswordHandler
{
    public function handle(ForgotSitePasswordCommand $command): void
    {
        $throttleKey = "web-reset:{$command->projectId}:".strtolower($command->data->email);
        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            throw new TooManyAttempts;
        }
        RateLimiter::hit($throttleKey, 300);

        $exists = User::acrossProjects()
            ->where('project_id', $command->projectId)
            ->where('email', $command->data->email)
            ->exists();

        if (! $exists) {
            return;
        }

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $command->data->email, 'guard' => 'web'],
            ['token' => hash('sha256', Str::random(64)), 'created_at' => now(), 'project_id' => $command->projectId],
        );
    }
}
