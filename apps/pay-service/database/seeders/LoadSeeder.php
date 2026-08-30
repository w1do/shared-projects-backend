<?php

declare(strict_types=1);

namespace Database\Seeders;

use Cms\Licensing\Domain\Models\License;
use Cms\Licensing\Domain\Models\LicenseInstallation;
use Cms\Licensing\Domain\Models\Organization;
use Cms\Licensing\Domain\Models\Plan as LicensePlan;
use Cms\Licensing\Domain\Models\PlanFeature;
use Cms\Licensing\Domain\Models\Release;
use Cms\Licensing\Domain\ValueObjects\LicenseKey;
use Cms\Pay\Domain\Enums\PaymentStatus;
use Cms\Pay\Domain\Enums\ProviderStatus;
use Cms\Pay\Domain\Enums\SubscriptionStatus;
use Cms\Pay\Domain\Enums\TransactionType;
use Cms\Pay\Domain\Models\Feature;
use Cms\Pay\Domain\Models\Plan;
use Cms\Pay\Domain\Models\PlanOption;
use Cms\Pay\Domain\Models\ProviderAccount;
use Cms\Pay\Domain\Settings\PaymentsSettings;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Нагруженный dev-стенд, pay-сервис: тарифы, подписки, история платежей
 * с транзакциями и данные лицензирования (оно живёт в этом же сервисе).
 *
 * Проекты приходят из auth-сеялки: `LOAD_PROJECT_IDS` — все проекты сидера
 * (их данные удаляются), `LOAD_PROJECTS` — сколько первых из списка засеять.
 *
 * Плательщик платежа — существующий пользователь сайта: auth-сеялка выдаёт им
 * идентификаторы по правилу «позиция проекта × USER_ID_BASE + номер», поэтому
 * ссылки строятся здесь без обращения к auth-сервису.
 *
 * Запуск: ./tools/cms seed-load [N]
 */
class LoadSeeder extends Seeder
{
    private const PAYMENTS_PER_PROJECT = 20000;

    private const SUBSCRIPTIONS_PER_PROJECT = 300;

    private const CHUNK = 2000;

    /** Должно совпадать с auth-сеялкой: пользователи сайта проекта. */
    private const USER_ID_BASE = 1000000;

    private const USERS_PER_PROJECT = 2000;

    private const CURRENCY = 'RUB';

    private const PLANS = [
        ['start', 'Старт', 49000, 'month'],
        ['pro', 'Профи', 149000, 'month'],
        ['business', 'Бизнес', 349000, 'month'],
        ['enterprise', 'Корпоративный', 2990000, 'year'],
    ];

    private const PLAN_FEATURES = ['api', 'analytics', 'support', 'export', 'sso', 'audit'];

    private const LICENSE_PLANS = [
        ['self-hosted-basic', 'Self-hosted Basic', 'basic'],
        ['self-hosted-pro', 'Self-hosted Pro', 'pro'],
        ['self-hosted-enterprise', 'Self-hosted Enterprise', 'enterprise'],
    ];

    private const ORGANIZATIONS_PER_PROJECT = 10;

    private const RELEASES_PER_PROJECT = 8;

    private const LICENSES_PER_PROJECT = 50;

    /** @var array<string, int> */
    private array $counters = [];

    public function run(): void
    {
        $this->guardProduction();

        $owned = $this->ownedProjectIds();
        $this->purge($owned);

        foreach (array_slice($owned, 0, $this->projectCount()) as $offset => $projectId) {
            mt_srand(crc32($projectId));

            $position = $offset + 1;
            $plans = $this->seedPlans($projectId);
            $subscriptions = $this->seedSubscriptions($projectId, $position, $plans);

            $this->seedPayments($projectId, $subscriptions);
            $this->seedProviderAccount($projectId);
            $this->seedLicensing($projectId);
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
    private function purge(array $projectIds): void
    {
        if ($projectIds === []) {
            return;
        }

        // Порядок — от зависимых таблиц к справочникам: остальное снимает каскад
        $tables = [
            'payment_transactions', 'payments', 'subscriptions', 'plan_options', 'features', 'plans',
            'provider_accounts', 'settings',
            'licenses', 'license_plan_features', 'license_plans', 'licensing_organizations', 'releases',
        ];

        foreach ($tables as $table) {
            DB::table($table)->whereIn('project_id', $projectIds)->delete();
        }
    }

    /** @return list<int> идентификаторы тарифов проекта */
    private function seedPlans(string $projectId): array
    {
        $features = [];

        foreach (self::PLAN_FEATURES as $code) {
            $features[$code] = Feature::create([
                'project_id' => $projectId,
                'code' => $code,
                'name' => 'Возможность '.$code,
            ]);
            $this->count('возможностей');
        }

        $ids = [];

        foreach (self::PLANS as $level => [$code, $name, $price, $interval]) {
            $plan = Plan::create([
                'project_id' => $projectId,
                'code' => $code,
                'name' => $name,
                'price_minor' => $price,
                'currency' => self::CURRENCY,
                'interval' => $interval,
            ]);

            PlanOption::create([
                'project_id' => $projectId,
                'plan_id' => $plan->id,
                'key' => 'projects_limit',
                'value' => (string) (($level + 1) * 5),
            ]);
            PlanOption::create([
                'project_id' => $projectId,
                'plan_id' => $plan->id,
                'key' => 'storage_gb',
                'value' => (string) (($level + 1) * 50),
            ]);

            $plan->features()->attach(
                collect($features)->take($level + 2)->map(fn (Feature $feature) => $feature->id)->all(),
            );

            $ids[] = $plan->id;
            $this->count('тарифов');
        }

        return $ids;
    }

    /**
     * @param  list<int>  $plans
     * @return list<array{id: string, subject_key: string}>
     */
    private function seedSubscriptions(string $projectId, int $position, array $plans): array
    {
        $rows = [];
        $summary = [];

        for ($number = 1; $number <= self::SUBSCRIPTIONS_PER_PROJECT; $number++) {
            $status = $this->subscriptionStatus($number);
            $userId = $position * self::USER_ID_BASE + (($number - 1) % self::USERS_PER_PROJECT) + 1;
            $startedAt = now()->subDays(mt_rand(30, 700));
            $id = (string) Str::ulid();

            $rows[] = [
                'id' => $id,
                'project_id' => $projectId,
                'subscriber_type' => 'site_user',
                'subscriber_id' => (string) $userId,
                'subject_type' => 'plan',
                'subject_id' => (string) $plans[$number % count($plans)],
                'status' => $status->value,
                'current_period_ends_at' => $startedAt->clone()->addMonths(mt_rand(1, 12)),
                'paused_at' => $status === SubscriptionStatus::Paused ? $startedAt->clone()->addDays(10) : null,
                'canceled_at' => $status === SubscriptionStatus::Canceled ? $startedAt->clone()->addDays(20) : null,
                'renewal_attempts' => $status === SubscriptionStatus::PastDue ? mt_rand(1, 3) : 0,
                'deleted_at' => null,
                'created_at' => $startedAt,
                'updated_at' => $startedAt,
            ];

            $summary[] = ['id' => $id, 'subject_key' => "user:{$projectId}:{$userId}"];
        }

        foreach (array_chunk($rows, self::CHUNK) as $chunk) {
            DB::table('subscriptions')->insert($chunk);
        }

        $this->count('подписок', count($rows));

        return $summary;
    }

    private function subscriptionStatus(int $number): SubscriptionStatus
    {
        return match ($number % 10) {
            0 => SubscriptionStatus::Canceled,
            1 => SubscriptionStatus::Paused,
            2 => SubscriptionStatus::PastDue,
            default => SubscriptionStatus::Active,
        };
    }

    /**
     * История платежей — самая объёмная таблица стенда: батч-вставка чанками,
     * транзакции леджера собираются той же пачкой.
     *
     * @param  list<array{id: string, subject_key: string}>  $subscriptions
     */
    private function seedPayments(string $projectId, array $subscriptions): void
    {
        $payments = 0;
        $transactions = 0;

        foreach (array_chunk(range(1, self::PAYMENTS_PER_PROJECT), self::CHUNK) as $chunk) {
            $paymentRows = [];
            $transactionRows = [];

            foreach ($chunk as $number) {
                $subscription = $subscriptions[$number % count($subscriptions)];
                $status = $this->paymentStatus($number);
                $amount = mt_rand(1, 40) * 10000;
                $refunded = $this->refundedMinor($status, $amount);
                $createdAt = now()->subMinutes(mt_rand(0, 60 * 24 * 365));
                $id = (string) Str::ulid();

                $paymentRows[] = [
                    'id' => $id,
                    'project_id' => $projectId,
                    'subject_key' => $subscription['subject_key'],
                    'amount_minor' => $amount,
                    'refunded_minor' => $refunded,
                    'currency' => self::CURRENCY,
                    'status' => $status->value,
                    'provider' => 'manual',
                    'provider_ref' => 'load-'.$number,
                    'description' => "Оплата подписки №{$number}",
                    'idempotency_key' => "load-{$number}",
                    'subscription_id' => $subscription['id'],
                    'redirect_url' => null,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ];

                if ($status === PaymentStatus::Created || $status === PaymentStatus::Pending || $status === PaymentStatus::Failed || $status === PaymentStatus::Canceled) {
                    continue;
                }

                $transactionRows[] = [
                    'project_id' => $projectId,
                    'payment_id' => $id,
                    'type' => TransactionType::Charge->value,
                    'amount_minor' => $amount,
                    'currency' => self::CURRENCY,
                    'created_at' => $createdAt,
                ];

                if ($refunded > 0) {
                    $transactionRows[] = [
                        'project_id' => $projectId,
                        'payment_id' => $id,
                        'type' => TransactionType::Refund->value,
                        'amount_minor' => -$refunded,
                        'currency' => self::CURRENCY,
                        'created_at' => $createdAt->clone()->addDays(1),
                    ];
                }
            }

            DB::table('payments')->insert($paymentRows);
            $payments += count($paymentRows);

            foreach (array_chunk($transactionRows, self::CHUNK) as $transactionChunk) {
                DB::table('payment_transactions')->insert($transactionChunk);
                $transactions += count($transactionChunk);
            }
        }

        $this->count('платежей', $payments);
        $this->count('транзакций', $transactions);
    }

    private function paymentStatus(int $number): PaymentStatus
    {
        return match ($number % 20) {
            0 => PaymentStatus::Failed,
            1 => PaymentStatus::Canceled,
            2 => PaymentStatus::Pending,
            3 => PaymentStatus::Created,
            4 => PaymentStatus::RefundedPartial,
            5 => PaymentStatus::RefundedFull,
            default => PaymentStatus::Succeeded,
        };
    }

    private function refundedMinor(PaymentStatus $status, int $amount): int
    {
        return match ($status) {
            PaymentStatus::RefundedFull => $amount,
            PaymentStatus::RefundedPartial => intdiv($amount, 2),
            default => 0,
        };
    }

    private function seedProviderAccount(string $projectId): void
    {
        ProviderAccount::create([
            'project_id' => $projectId,
            'provider' => 'manual',
            'group' => 'payments',
            'label' => 'Ручное подтверждение',
            'name' => 'manual',
            'properties' => [],
            'status' => ProviderStatus::Active->value,
        ]);

        DB::table('settings')->insert([
            'project_id' => $projectId,
            'group' => PaymentsSettings::group(),
            'name' => 'provider',
            'locked' => false,
            'payload' => json_encode('manual'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->count('аккаунтов провайдера');
    }

    private function seedLicensing(string $projectId): void
    {
        $organizations = [];

        for ($number = 1; $number <= self::ORGANIZATIONS_PER_PROJECT; $number++) {
            $organizations[] = Organization::create([
                'project_id' => $projectId,
                'name' => "ООО «Клиент {$number}»",
                'contact_first_name' => 'Иван',
                'contact_last_name' => "Клиентов {$number}",
                'phone' => '+7900'.str_pad((string) $number, 7, '0', STR_PAD_LEFT),
                'email' => "org-{$number}@load.example.test",
                'telegram' => "@client{$number}",
                'activity' => 'Разработка программного обеспечения',
                'employees_count' => $number * 12,
                'usage_purpose' => 'Внутренний портал компании',
            ])->id;
            $this->count('организаций');
        }

        $plans = [];

        foreach (self::LICENSE_PLANS as [$code, $name, $edition]) {
            $plan = LicensePlan::create([
                'project_id' => $projectId,
                'code' => $code,
                'name' => $name,
                'price_minor' => 4900000,
                'currency' => self::CURRENCY,
                'interval' => 'year',
            ]);

            foreach (array_slice(self::PLAN_FEATURES, 0, 3) as $feature) {
                PlanFeature::create([
                    'project_id' => $projectId,
                    'plan_id' => $plan->id,
                    'organization_id' => null,
                    'code' => $feature,
                    'name' => 'Возможность '.$feature,
                ]);
                $this->count('фич лицензионных планов');
            }

            $plans[] = ['id' => $plan->id, 'edition' => $edition];
            $this->count('лицензионных планов');
        }

        for ($number = 1; $number <= self::RELEASES_PER_PROJECT; $number++) {
            Release::create([
                'project_id' => $projectId,
                'version' => "1.{$number}.0",
                'train' => 'stable',
                'repository' => 'registry.example.test/platform',
                'released_at' => now()->subDays((self::RELEASES_PER_PROJECT - $number) * 30),
                'is_security' => $number % 4 === 0,
                'min_upgrade_from' => '1.0.0',
                'changelog_url' => "https://example.test/changelog/1.{$number}.0",
            ]);
            $this->count('релизов');
        }

        $this->seedLicenses($projectId, $organizations, $plans);
    }

    /**
     * @param  list<int>  $organizations
     * @param  list<array{id: int, edition: string}>  $plans
     */
    private function seedLicenses(string $projectId, array $organizations, array $plans): void
    {
        for ($number = 1; $number <= self::LICENSES_PER_PROJECT; $number++) {
            $plan = $plans[$number % count($plans)];
            $key = LicenseKey::fromInput($this->licenseKey($projectId, $number));
            $issuedAt = now()->subDays(mt_rand(1, 700));

            $license = License::create([
                'project_id' => $projectId,
                'organization_id' => $organizations[$number % count($organizations)],
                'plan_id' => $plan['id'],
                'key_hash' => $key->hash(),
                'key_prefix' => $key->prefix(),
                'edition' => $plan['edition'],
                'features' => array_slice(self::PLAN_FEATURES, 0, 3),
                'entitled_version' => '1.'.mt_rand(1, self::RELEASES_PER_PROJECT).'.0',
                'updates_until' => $issuedAt->clone()->addYear(),
                'max_installations' => mt_rand(3, 8),
                'note' => null,
                'issued_at' => $issuedAt,
            ]);

            if ($number % 10 === 0) {
                $license->forceFill(['revoked_at' => now()->subDays(5)])->save();
            }

            $this->count('лицензий');

            foreach (range(1, ($number % 3) + 1) as $installation) {
                LicenseInstallation::create([
                    'license_id' => $license->id,
                    'install_id' => hash('sha256', "{$license->id}:{$installation}"),
                    'domain' => "client-{$number}-{$installation}.example.test",
                    'app_version' => '1.'.mt_rand(1, self::RELEASES_PER_PROJECT).'.0',
                    'last_ip' => '10.0.'.mt_rand(0, 255).'.'.mt_rand(1, 254),
                    'last_seen_at' => now()->subHours(mt_rand(1, 720)),
                ]);
                $this->count('установок');
            }
        }
    }

    /** Ключ выводится из проекта и номера: он же должен быть глобально уникален. */
    private function licenseKey(string $projectId, int $number): string
    {
        $digest = md5("{$projectId}:{$number}");
        $chars = '';

        for ($i = 0; $i < 16; $i++) {
            $chars .= LicenseKey::ALPHABET[hexdec(substr($digest, $i * 2, 2)) % strlen(LicenseKey::ALPHABET)];
        }

        return 'LIC-'.implode('-', str_split($chars, 4));
    }

    private function report(): void
    {
        foreach ($this->counters as $what => $value) {
            $this->command->info("pay: {$what} — {$value}");
        }

        $parts = [];

        foreach ($this->counters as $what => $value) {
            $parts[] = "{$what} {$value}";
        }

        $this->command->getOutput()->writeln('LOAD_STATS=pay: '.($parts === [] ? 'ничего не создано' : implode(', ', $parts)));
    }

    private function count(string $what, int $by = 1): void
    {
        $this->counters[$what] = ($this->counters[$what] ?? 0) + $by;
    }
}
