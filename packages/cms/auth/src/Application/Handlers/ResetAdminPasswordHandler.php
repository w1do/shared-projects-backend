<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\ResetAdminPasswordCommand;
use Cms\Auth\Domain\Models\Admin;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

final class ResetAdminPasswordHandler
{
    public function handle(ResetAdminPasswordCommand $command): void
    {
        $row = DB::table('password_reset_tokens')
            ->where('email', $command->data->email)
            ->where('guard', 'admin')
            ->first();

        $ttl = (int) config('cms-auth.reset_token_ttl', 60);

        if ($row === null
            || ! hash_equals($row->token, hash('sha256', $command->data->token))
            || now()->diffInMinutes($row->created_at) > $ttl) {
            throw ValidationException::withMessages(['token' => ['Reset token is invalid or expired.']]);
        }

        /** @var Admin $admin */
        $admin = Admin::query()->where('email', $command->data->email)->firstOrFail();
        $admin->forceFill(['password' => Hash::make($command->data->password)])->save();

        // Одноразовость: токен удаляется, все выданные токены доступа инвалидируются
        DB::table('password_reset_tokens')->where('email', $command->data->email)->where('guard', 'admin')->delete();
        $admin->tokens()->delete();
    }
}
