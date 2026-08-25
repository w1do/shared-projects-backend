<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\ResetSitePasswordCommand;
use Cms\Auth\Domain\Models\User;
use Cms\Shared\Analytics\Analytics;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

final class ResetSitePasswordHandler
{
    public function handle(ResetSitePasswordCommand $command): void
    {
        $row = DB::table('password_reset_tokens')
            ->where('email', $command->data->email)
            ->where('guard', 'web')
            ->where('project_id', $command->projectId)
            ->first();

        $ttl = (int) config('cms-auth.reset_token_ttl', 60);

        if ($row === null
            || ! hash_equals($row->token, hash('sha256', $command->data->token))
            || now()->diffInMinutes($row->created_at) > $ttl) {
            throw ValidationException::withMessages(['token' => ['Reset token is invalid or expired.']]);
        }

        /** @var User $user */
        $user = User::acrossProjects()
            ->where('project_id', $command->projectId)
            ->where('email', $command->data->email)
            ->firstOrFail();

        $user->forceFill(['password' => Hash::make($command->data->password)])->save();

        DB::table('password_reset_tokens')
            ->where('email', $command->data->email)->where('guard', 'web')->where('project_id', $command->projectId)
            ->delete();
        $user->tokens()->delete();

        Analytics::push($user->subjectKey(), ['name' => 'user.password_reset'], $command->projectId);
    }
}
