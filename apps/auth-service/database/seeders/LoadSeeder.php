<?php

declare(strict_types=1);

namespace Database\Seeders;

use Cms\Auth\Domain\Enums\ActorType;
use Cms\Auth\Domain\Enums\ApiKeyType;
use Cms\Auth\Domain\Enums\AuditAction;
use Cms\Auth\Domain\Enums\ProjectType;
use Cms\Auth\Domain\Enums\ServiceName;
use Cms\Auth\Domain\Enums\SystemRole;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Cms\Auth\Domain\Models\ProjectApiKey;
use Cms\Auth\Domain\Models\ProjectService;
use Cms\Auth\Domain\Settings\SiteSettings;
use Cms\Auth\Infrastructure\Persistence\AdminPermissionResolver;
use Cms\Auth\Infrastructure\Persistence\BootstrapCache;
use Cms\Auth\Infrastructure\Persistence\PermissionSyncer;
use Cms\Auth\Infrastructure\Persistence\SettingWriter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

/**
 * Нагруженный dev-стенд, auth-сервис: проекты `load-01 … load-NN` и всё, что
 * к ним относится — участники с ролями, ключи, настройки, аудит, пользователи сайта.
 *
 * Сеялка — источник истины по составу проектов сидера. Она печатает строку
 * `LOAD_PROJECT_IDS=<новые>,<прежние>`: оркестратор передаёт этот список
 * сеялкам остальных сервисов, те удаляют данные всех перечисленных проектов
 * и засеивают первые `LOAD_PROJECTS` из списка.
 *
 * Запуск: ./tools/cms seed-load [N]
 */
class LoadSeeder extends Seeder
{
    /** Проекты сидера отличает префикс ключа: всё остальное на стенде — чужое. */
    public const KEY_PREFIX = 'load-';

    private const DEFAULT_PROJECTS = 20;

    private const USERS_PER_PROJECT = 2000;

    /**
     * Идентификаторы пользователей сайта задаются явно: `позиция проекта × BASE + номер`.
     * Так pay-сеялка ссылается на существующих плательщиков, зная только позицию
     * проекта в `LOAD_PROJECT_IDS`, — межсервисного запроса за списком не нужно.
     * Диапазон начинается с миллиона: вручную заведённые пользователи идут из
     * последовательности снизу и с ним не пересекаются.
     */
    private const USER_ID_BASE = 1000000;

    private const AUDIT_PER_PROJECT = 200;

    private const CHUNK = 2000;

    /** Домен операторов и пользователей сидера: по нему они и удаляются. */
    private const MAIL_DOMAIN = 'example.test';

    /** Участники проекта: по одному оператору на каждую системную роль. */
    private const MEMBER_ROLES = [
        SystemRole::Owner,
        SystemRole::Admin,
        SystemRole::Editor,
        SystemRole::Analyst,
        SystemRole::Viewer,
    ];

    /** @var array<string, int> */
    private array $counters = [];

    public function run(
        AdminPermissionResolver $permissions,
        PermissionSyncer $syncer,
        SettingWriter $settings,
    ): void {
        $this->guardProduction();

        $wanted = $this->projectCount();
        $stale = $this->ownedProjectIds();

        $this->purge($stale);

        $created = [];

        for ($index = 1; $index <= $wanted; $index++) {
            $project = $this->createProject($index);
            $syncer->syncSystemRoles($project);

            $this->seedServices($project);
            $this->seedSettings($project, $index, $settings);
            $this->seedApiKeys($project);
            $admins = $this->seedMembers($project, $permissions);
            $this->seedAudit($project, $admins);
            $this->seedSiteUsers($project, $index);

            $created[] = $project->id;
        }

        BootstrapCache::bump();

        $this->report($created, $stale, $wanted > 0);
    }

    /** Сидер наполняет стенд разработчика и в production не выполняется никогда. */
    private function guardProduction(): void
    {
        if (app()->environment('production')) {
            throw new RuntimeException('LoadSeeder не выполняется в production: это dev-инструмент нагруженного стенда.');
        }
    }

    private function projectCount(): int
    {
        $value = $_SERVER['LOAD_PROJECTS'] ?? null;

        return is_string($value) && $value !== '' ? max(0, (int) $value) : self::DEFAULT_PROJECTS;
    }

    /** @return list<string> */
    private function ownedProjectIds(): array
    {
        return array_values(
            Project::query()
                ->where('key', 'like', self::KEY_PREFIX.'%')
                ->orderBy('key')
                ->pluck('id')
                ->map(strval(...))
                ->all(),
        );
    }

    /** @param  list<string>  $projectIds */
    private function purge(array $projectIds): void
    {
        if ($projectIds !== []) {
            // Роли уходят первыми: каскад снимает и выданные права, и назначения ролей
            DB::table('roles')->whereIn('project_id', $projectIds)->delete();

            foreach (['project_members', 'project_api_keys', 'project_services', 'project_settings', 'audit_logs', 'settings', 'users', 'password_reset_tokens'] as $table) {
                DB::table($table)->whereIn('project_id', $projectIds)->delete();
            }

            DB::table('model_has_roles')->whereIn('project_id', $projectIds)->delete();
            DB::table('model_has_permissions')->whereIn('project_id', $projectIds)->delete();
            DB::table('projects')->whereIn('id', $projectIds)->delete();
        }

        Admin::query()->where('email', 'like', self::KEY_PREFIX.'%@'.self::MAIL_DOMAIN)->delete();
    }

    private function createProject(int $index): Project
    {
        $key = self::KEY_PREFIX.str_pad((string) $index, 2, '0', STR_PAD_LEFT);
        mt_srand(crc32($key));

        $project = Project::create([
            'key' => $key,
            'name' => 'Нагрузочный проект '.str_pad((string) $index, 2, '0', STR_PAD_LEFT),
            'description' => 'Проект нагруженного стенда: данные сгенерированы командой seed-load.',
            'topic' => ['доставка топлива', 'автопомощь на дорогах', 'логистика', 'ремонт техники'][$index % 4],
            'locales' => ['ru', 'en'],
        ]);

        $this->count('проектов');

        return $project;
    }

    private function seedServices(Project $project): void
    {
        foreach (ServiceName::toggleable() as $service) {
            ProjectService::create([
                'project_id' => $project->id,
                'service' => $service,
                'enabled' => true,
                'enabled_at' => now(),
            ]);
            $this->count('сервисов включено');
        }
    }

    private function seedSettings(Project $project, int $index, SettingWriter $writer): void
    {
        $manifestSettings = [
            ServiceName::Content->value => [
                ['site_url', "https://{$project->key}.example.test", false],
                ['cache_ttl', 300, false],
            ],
            ServiceName::Analytics->value => [
                ['retention_months', 12, false],
            ],
            ServiceName::Pay->value => [
                ['default_currency', 'RUB', false],
                ['provider_secret', "sk_load_{$project->key}", true],
            ],
        ];

        foreach ($manifestSettings as $service => $definitions) {
            foreach ($definitions as [$key, $value, $secret]) {
                $writer->write($project->id, $service, $key, $value, $secret);
                $this->count('настроек сервисов');
            }
        }

        $site = SiteSettings::defaults();
        $site['project_type'] = ProjectType::values()[$index % count(ProjectType::values())];

        $rows = [];

        foreach ($site as $name => $value) {
            $rows[] = [
                'project_id' => $project->id,
                'group' => SiteSettings::group(),
                'name' => $name,
                'locked' => false,
                'payload' => json_encode($value, JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('settings')->insert($rows);
        $this->count('настроек сайта', count($rows));
    }

    private function seedApiKeys(Project $project): void
    {
        foreach (ApiKeyType::cases() as $type) {
            ProjectApiKey::issue($project->id, $type->value, $type->defaultScopes());
            $this->count('API-ключей');
        }
    }

    /** @return list<int> идентификаторы операторов проекта */
    private function seedMembers(Project $project, AdminPermissionResolver $permissions): array
    {
        $password = Hash::make('secret-123');
        $ids = [];

        foreach (self::MEMBER_ROLES as $role) {
            $admin = Admin::create([
                'name' => "{$project->key} · {$role->value}",
                'email' => "{$project->key}-{$role->value}@".self::MAIL_DOMAIN,
                'password' => $password,
                'locale' => 'ru',
            ]);

            $project->members()->attach($admin->id);
            $permissions->withTeam($project->id, static fn () => $admin->assignRole($role->value));

            $ids[] = $admin->id;
            $this->count('участников');
        }

        return $ids;
    }

    /** @param  list<int>  $admins */
    private function seedAudit(Project $project, array $admins): void
    {
        $actions = AuditAction::cases();
        $rows = [];

        for ($i = 0; $i < self::AUDIT_PER_PROJECT; $i++) {
            $rows[] = [
                'project_id' => $project->id,
                'actor_type' => ActorType::Admin->value,
                'actor_id' => (string) $admins[mt_rand(0, count($admins) - 1)],
                'action' => $actions[mt_rand(0, count($actions) - 1)]->value,
                'subject' => "project:{$project->key}",
                'changes' => json_encode(['seeded' => true], JSON_UNESCAPED_UNICODE),
                'trace_id' => null,
                'created_at' => now()->subMinutes(mt_rand(0, 60 * 24 * 180)),
            ];
        }

        DB::table('audit_logs')->insert($rows);
        $this->count('записей аудита', count($rows));
    }

    /** Пользователи сайта — самая объёмная таблица auth: только батч-вставка. */
    private function seedSiteUsers(Project $project, int $index): void
    {
        $password = Hash::make('secret-123');
        $created = 0;

        foreach (array_chunk(range(1, self::USERS_PER_PROJECT), self::CHUNK) as $chunk) {
            $rows = [];

            foreach ($chunk as $number) {
                $registeredAt = now()->subMinutes(mt_rand(0, 60 * 24 * 365));

                $rows[] = [
                    'id' => $index * self::USER_ID_BASE + $number,
                    'project_id' => $project->id,
                    'name' => 'Пользователь '.$number,
                    'email' => "user-{$number}@{$project->key}.".self::MAIL_DOMAIN,
                    'password' => $password,
                    'blocked_at' => $number % 50 === 0 ? $registeredAt->clone()->addDay() : null,
                    'created_at' => $registeredAt,
                    'updated_at' => $registeredAt,
                ];
            }

            DB::table('users')->insert($rows);
            $created += count($rows);
        }

        $this->count('пользователей сайта', $created);
    }

    /**
     * @param  list<string>  $created
     * @param  list<string>  $stale
     */
    private function report(array $created, array $stale, bool $seeded): void
    {
        $output = $this->command->getOutput();

        foreach ($this->counters as $what => $value) {
            $this->command->info("auth: {$what} — {$value}");
        }

        if ($seeded) {
            $output->writeln('LOAD_SKIP=auth: кастомные роли — каталога прав ещё нет (изменение access-roles-and-permissions не реализовано)');
        }
        $output->writeln('LOAD_STATS=auth: '.$this->statsLine());
        $output->writeln('LOAD_PROJECT_IDS='.implode(',', array_merge($created, $stale)));
    }

    private function statsLine(): string
    {
        $parts = [];

        foreach ($this->counters as $what => $value) {
            $parts[] = "{$what} {$value}";
        }

        return $parts === [] ? 'ничего не создано' : implode(', ', $parts);
    }

    private function count(string $what, int $by = 1): void
    {
        $this->counters[$what] = ($this->counters[$what] ?? 0) + $by;
    }
}
