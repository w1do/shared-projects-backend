<?php

declare(strict_types=1);

namespace Database\Seeders;

use Cms\Analytics\Domain\Enums\EventType;
use Cms\Analytics\Domain\Settings\AnalyticsSettings;
use Cms\Analytics\Infrastructure\Persistence\ClickHouse\Connection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Нагруженный dev-стенд, analytics-сервис: поток событий за последний год
 * прямо в ClickHouse — просмотры страниц и события платежей с суммами,
 * чтобы дневные агрегаты и выручка были непустыми.
 *
 * Проекты приходят из auth-сеялки: `LOAD_PROJECT_IDS` — все проекты сидера
 * (их данные удаляются), `LOAD_PROJECTS` — сколько первых из списка засеять.
 *
 * Запуск: ./tools/cms seed-load [N]
 */
class LoadSeeder extends Seeder
{
    private const EVENTS_PER_PROJECT = 100000;

    private const CHUNK = 50000;

    /** Окно истории: TTL таблицы событий — 12 месяцев, край окна не занимаем. */
    private const HISTORY_DAYS = 350;

    /** Посетителей на проект: события переиспользуют этот пул субъектов и сессий. */
    private const VISITORS = 500;

    /** Материализованные представления хранят данные сами: чистятся отдельно. */
    private const AGGREGATE_TABLES = ['daily_events', 'daily_revenue', 'top_pages'];

    private const PATHS = [
        '/', '/blog', '/blog/kak-vybrat', '/pricing', '/contacts', '/about',
        '/catalog', '/catalog/dostavka', '/catalog/remont', '/faq',
    ];

    private const DEVICES = ['desktop', 'mobile', 'tablet'];

    private const BROWSERS = ['Chrome', 'Safari', 'Firefox', 'Edge'];

    private const OPERATING_SYSTEMS = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];

    private const UTM_SOURCES = ['yandex', 'google', 'telegram', 'direct', ''];

    /** @var array<string, int> */
    private array $counters = [];

    public function run(Connection $clickhouse): void
    {
        $this->guardProduction();

        // Пачка в 50 тыс. строк не помещается в дефолтные 128M CLI-процесса
        ini_set('memory_limit', '512M');

        $owned = $this->ownedProjectIds();
        $this->purge($clickhouse, $owned);

        foreach (array_slice($owned, 0, $this->projectCount()) as $projectId) {
            mt_srand(crc32($projectId));

            $this->seedSettings($projectId);
            $this->seedEvents($clickhouse, $projectId);
        }

        $this->report();
    }

    /** Сидер наполняет стенд разработчика и в production не выполняется никогда. */
    private function guardProduction(): void
    {
        if (app()->environment('production')) {
            throw new RuntimeException('LoadSeeder не выполняется в production: это dev-инструмент нагруженного стенда.');
        }
    }

    /** @return list<string> */
    private function ownedProjectIds(): array
    {
        $value = $_SERVER['LOAD_PROJECT_IDS'] ?? null;

        if (! is_string($value)) {
            throw new RuntimeException(
                'Не задан LOAD_PROJECT_IDS. Запускайте сидер через `./tools/cms seed-load` — '
                .'список проектов приходит из auth-сеялки.',
            );
        }

        return array_values(array_filter(array_map('trim', explode(',', $value))));
    }

    private function projectCount(): int
    {
        $value = $_SERVER['LOAD_PROJECTS'] ?? null;

        return is_string($value) && $value !== '' ? max(0, (int) $value) : 0;
    }

    /** @param  list<string>  $projectIds */
    private function purge(Connection $clickhouse, array $projectIds): void
    {
        if ($projectIds === []) {
            return;
        }

        DB::table('settings')->whereIn('project_id', $projectIds)->delete();

        $params = [];
        $placeholders = [];

        foreach ($projectIds as $index => $projectId) {
            $params["project_{$index}"] = $projectId;
            $placeholders[] = ":project_{$index}";
        }

        $condition = 'project_id IN ('.implode(', ', $placeholders).') SETTINGS mutations_sync = 1';

        foreach (array_merge(['events'], self::AGGREGATE_TABLES) as $table) {
            $clickhouse->statement("ALTER TABLE {$table} DELETE WHERE {$condition}", $params);
        }
    }

    private function seedSettings(string $projectId): void
    {
        $rows = [];

        foreach (AnalyticsSettings::defaults() as $name => $value) {
            $rows[] = [
                'project_id' => $projectId,
                'group' => AnalyticsSettings::group(),
                'name' => $name,
                'locked' => false,
                'payload' => json_encode($value),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('settings')->insert($rows);
        $this->count('настроек аналитики', count($rows));
    }

    private function seedEvents(Connection $clickhouse, string $projectId): void
    {
        $visitors = $this->buildVisitors($projectId);
        $inserted = 0;

        foreach (array_chunk(range(1, self::EVENTS_PER_PROJECT), self::CHUNK) as $chunk) {
            $rows = [];

            foreach ($chunk as $number) {
                $rows[] = $this->buildEvent($projectId, $number, $visitors[$number % self::VISITORS]);
            }

            $clickhouse->insertBatch('events', $rows);
            $inserted += count($rows);
        }

        $this->count('событий', $inserted);
    }

    /**
     * Пул посетителей: субъект, сессия, хэш адреса и профиль клиента считаются
     * один раз на проект — иначе на каждое из ста тысяч событий пришлось бы
     * по хэшированию.
     *
     * @return list<array{subject_key: string, session_id: string, ip_hash: string, device: string, os: string, browser: string}>
     */
    private function buildVisitors(string $projectId): array
    {
        $visitors = [];

        for ($number = 0; $number < self::VISITORS; $number++) {
            $visitors[] = [
                'subject_key' => $number % 3 === 0 ? "anon:load-{$number}" : "user:{$projectId}:{$number}",
                'session_id' => "load-session-{$projectId}-{$number}",
                'ip_hash' => hash('sha256', "{$projectId}:{$number}"),
                'device' => self::DEVICES[$number % count(self::DEVICES)],
                'os' => self::OPERATING_SYSTEMS[$number % count(self::OPERATING_SYSTEMS)],
                'browser' => self::BROWSERS[$number % count(self::BROWSERS)],
            ];
        }

        return $visitors;
    }

    /**
     * @param  array{subject_key: string, session_id: string, ip_hash: string, device: string, os: string, browser: string}  $visitor
     * @return array<string, mixed>
     */
    private function buildEvent(string $projectId, int $number, array $visitor): array
    {
        $type = $this->eventType($number);
        $isPageView = $type === EventType::PageView;
        $revenue = $this->revenueMinor($type, $number);

        return [
            'project_id' => $projectId,
            'event_id' => $this->eventId($projectId, $number),
            'occurred_at' => date('Y-m-d H:i:s', time() - mt_rand(0, self::HISTORY_DAYS * 86400)),
            'name' => $type->value,
            'source' => $isPageView ? 'site' : 'platform',
            'subject_key' => $visitor['subject_key'],
            'session_id' => $visitor['session_id'],
            'path' => $isPageView ? self::PATHS[$number % count(self::PATHS)] : '',
            'referrer' => $isPageView && $number % 4 === 0 ? 'https://yandex.ru/' : '',
            'utm_source' => self::UTM_SOURCES[$number % count(self::UTM_SOURCES)],
            'utm_medium' => $number % 3 === 0 ? 'cpc' : '',
            'utm_campaign' => $number % 5 === 0 ? 'load-campaign' : '',
            'device' => $visitor['device'],
            'os' => $visitor['os'],
            'browser' => $visitor['browser'],
            'ip_hash' => $visitor['ip_hash'],
            'value_minor' => $revenue,
            'currency' => $revenue === 0 ? '' : 'RUB',
            'props' => '{}',
        ];
    }

    private function eventType(int $number): EventType
    {
        return match ($number % 20) {
            0, 1 => EventType::PaymentSucceeded,
            2 => EventType::PaymentInitiated,
            3 => EventType::PaymentFailed,
            4 => EventType::UserRegistered,
            5, 6 => EventType::UserLogin,
            7 => EventType::ContentPostPublished,
            default => EventType::PageView,
        };
    }

    private function revenueMinor(EventType $type, int $number): int
    {
        return $type === EventType::PaymentSucceeded ? (($number % 40) + 1) * 10000 : 0;
    }

    /** UUID выводится из проекта и номера: ReplacingMergeTree дедуплицирует по ключу. */
    private function eventId(string $projectId, int $number): string
    {
        $digest = md5("{$projectId}:{$number}");

        return substr($digest, 0, 8).'-'.substr($digest, 8, 4).'-'.substr($digest, 12, 4)
            .'-'.substr($digest, 16, 4).'-'.substr($digest, 20, 12);
    }

    private function report(): void
    {
        foreach ($this->counters as $what => $value) {
            $this->command->info("analytics: {$what} — {$value}");
        }

        $parts = [];

        foreach ($this->counters as $what => $value) {
            $parts[] = "{$what} {$value}";
        }

        $this->command->getOutput()->writeln('LOAD_STATS=analytics: '.($parts === [] ? 'ничего не создано' : implode(', ', $parts)));
    }

    private function count(string $what, int $by = 1): void
    {
        $this->counters[$what] = ($this->counters[$what] ?? 0) + $by;
    }
}
