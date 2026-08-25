<?php

declare(strict_types=1);

namespace Cms\Auth\Application\Handlers;

use Cms\Auth\Application\Commands\InviteMemberCommand;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Infrastructure\Notifications\DownstreamNotifier;
use Cms\Auth\Infrastructure\Persistence\AuditRecorder;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;
use Illuminate\Support\Str;

/**
 * Приглашение оператора в проект.
 *
 * Существование роли в проекте и повторное приглашение проверены в
 * `InviteMemberRequest` — до того, как здесь заводится аккаунт.
 */
final class InviteMemberHandler
{
    public function __construct(
        private readonly AuditRecorder $audit,
        private readonly DownstreamNotifier $downstream,
    ) {}

    public function handle(InviteMemberCommand $command): Admin
    {
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

        $command->project->members()->attach($member->id);
        $member->assignRole($command->data->role); // team-контекст установлен ResolveProject

        if ($isNewAdmin) {
            $this->audit->record(AuditAction::AdminCreated, $command->project->id, "admin:{$member->id}", ['email' => $member->email]);
        }

        $this->audit->record(AuditAction::MemberInvited, $command->project->id, "admin:{$member->id}", ['role' => $command->data->role]);
        BootstrapCache::bump();
        $this->downstream->cacheBust(['reason' => 'member_changed', 'project_id' => $command->project->id]);

        return $member;
    }
}
