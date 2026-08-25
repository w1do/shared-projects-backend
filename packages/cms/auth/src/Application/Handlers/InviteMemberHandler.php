<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\InviteMemberCommand;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Infrastructure\Support\Audit;
use Cms\Auth\Infrastructure\Support\BootstrapCache;
use Cms\Auth\Infrastructure\Support\DownstreamNotifier;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

final class InviteMemberHandler
{
    public function handle(InviteMemberCommand $command): Admin
    {
        // Роль проверяем до создания оператора: иначе неверная роль оставила бы аккаунт-сироту.
        if (! Role::query()->where('project_id', $command->project->id)->where('name', $command->data->role)->exists()) {
            throw ValidationException::withMessages(['role' => ['Unknown role for this project.']]);
        }

        /** @var Admin|null $member */
        $member = Admin::query()->where('email', $command->data->email)->first();
        $isNewAdmin = $member === null;

        if ($member === null) {
            // Приглашение нового человека: аккаунт заводится без пригодного пароля —
            // войти можно только пройдя сброс пароля по своему email.
            $member = Admin::query()->create([
                'name' => $command->data->name ?? $command->data->email,
                'email' => $command->data->email,
                'password' => Str::password(32),
            ]);
        }

        if ($command->project->hasMember($member)) {
            throw ValidationException::withMessages(['email' => ['Already a member of this project.']]);
        }

        $command->project->members()->attach($member->id);
        $member->assignRole($command->data->role); // team-контекст установлен ResolveProject

        if ($isNewAdmin) {
            Audit::record('admin.created', $command->project->id, "admin:{$member->id}", ['email' => $member->email]);
        }

        Audit::record('member.invited', $command->project->id, "admin:{$member->id}", ['role' => $command->data->role]);
        BootstrapCache::bump();
        DownstreamNotifier::cacheBust(['reason' => 'member_changed', 'project_id' => $command->project->id]);

        return $member;
    }
}
