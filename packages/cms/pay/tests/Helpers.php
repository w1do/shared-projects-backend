<?php

declare(strict_types=1);

use Cms\Contracts\Introspection\IntrospectionResult;
use Cms\Contracts\Introspection\Subject;
use Cms\Pay\Domain\Models\Plan;
use Cms\Shared\AuthClient\Introspector;
use Cms\Shared\Tenant\ProjectContext;
use Illuminate\Support\Facades\DB;

class FakePayIntrospector implements Introspector
{
    public function __construct(
        private readonly IntrospectionResult $tokenResult,
        private readonly IntrospectionResult $keyResult,
    ) {}

    public function token(string $bearerToken, ?string $project = null): IntrospectionResult
    {
        return $this->tokenResult;
    }

    public function apiKey(string $apiKey): IntrospectionResult
    {
        return $this->keyResult;
    }
}

function actingAsPayOperator(string $projectId = 'proj-1', array $permissions = [
    'pay.plans.view', 'pay.plans.manage', 'pay.payments.view', 'pay.payments.confirm',
    'pay.payments.refund', 'pay.subscriptions.view', 'pay.subscriptions.manage',
], array $services = ['pay', 'licensing']): array
{
    // токен guard web для сайтовых сценариев: user 7 проекта
    $token = new IntrospectionResult(subject: Subject::ProjectUser, active: true, projectId: $projectId, userId: '7',
        enabledServices: $services);
    // но admin-маршруты используют тот же introspector: подменяем на admin, когда нужны operator-права
    $admin = new IntrospectionResult(subject: Subject::Admin, active: true, projectId: $projectId,
        userId: '1', permissions: $permissions, enabledServices: $services);
    $key = new IntrospectionResult(subject: Subject::ApiKey, active: true, projectId: $projectId,
        keyType: 'secret', scopes: ['*'], enabledServices: $services);
    app()->instance(Introspector::class, new FakePayIntrospector($admin, $key));

    return ['Authorization' => 'Bearer test-operator'];
}

/**
 * Сайт + пользователь: introspector отдаёт ProjectUser для X-User-Token.
 * Провайдер платежей проекта — manual: дефолт настроек (platega) без
 * настроенных credentials не даёт оформить подписку (Д7); тесты, которым
 * нужен platega, переопределяют выбор через paySelectProvider('platega').
 */
function actingAsSiteUser(string $projectId = 'proj-1', string $userId = '7', array $services = ['pay']): array
{
    paySelectProvider('manual', $projectId);

    $user = new IntrospectionResult(subject: Subject::ProjectUser, active: true, projectId: $projectId, userId: $userId,
        enabledServices: $services);
    $key = new IntrospectionResult(subject: Subject::ApiKey, active: true, projectId: $projectId,
        keyType: 'secret', scopes: ['*'], enabledServices: $services);
    app()->instance(Introspector::class, new FakePayIntrospector($user, $key));

    return ['X-Api-Key' => 'pk_live_test', 'X-User-Token' => 'user-token'];
}

function makePlan(array $attrs = []): Plan
{
    app(ProjectContext::class)->set('proj-1');

    return Plan::factory()->create($attrs);
}

/**
 * Выбранный провайдер платежей проекта (Д7): пишется прямо в settings-таблицу,
 * чтобы не зависеть от кэша инстанса spatie-settings внутри теста.
 */
function paySelectProvider(string $provider = 'manual', string $projectId = 'proj-1'): void
{
    DB::table('settings')->updateOrInsert(
        ['project_id' => $projectId, 'group' => 'payments', 'name' => 'provider'],
        ['payload' => json_encode($provider), 'locked' => false, 'created_at' => now(), 'updated_at' => now()],
    );
}
