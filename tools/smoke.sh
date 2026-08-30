#!/usr/bin/env bash
# Сквозной прогон через gateway: auth → project → keys → services → manifests →
# content (пост+sitemap) → analytics (collect+история) → pay (план→подписка→оплата→отмена→возобновление).
set -euo pipefail

BASE="${BASE:-http://localhost:8080}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker compose -f $ROOT/infra/compose/compose.yaml"

jqr() { python3 -c "import json,sys; d=json.load(sys.stdin); print(d$1)"; }
RUN=$(date +%s)   # уникальный суффикс: smoke можно гонять повторно

echo "== health"
for s in auth content analytics pay; do
    curl -fsS "$BASE/health/$s" | jqr "['service']"
done

echo "== seed operator"
$COMPOSE exec -T -w /var/www/apps/auth-service auth-service php artisan tinker --execute="
\$a = Cms\Auth\Domain\Models\Admin::query()->firstOrCreate(['email' => 'root@example.com'], ['name' => 'Root', 'password' => 'secret-123']);
Cms\Auth\Infrastructure\Persistence\PermissionSyncer::grantSuperAdmin(\$a);
echo 'operator ready';" >/dev/null

echo "== publish manifests"
$COMPOSE exec -T -w /var/www/apps/auth-service auth-service php artisan manifest:publish
$COMPOSE exec -T -w /var/www/apps/content-service content-service php artisan manifest:publish
$COMPOSE exec -T -w /var/www/apps/analytics-service analytics-service php artisan manifest:publish
$COMPOSE exec -T -w /var/www/apps/pay-service pay-service php artisan manifest:publish
# licensing живёт в pay-service; сигнатура отдельная — manifest:publish занят PayManifest
$COMPOSE exec -T -w /var/www/apps/pay-service pay-service php artisan manifest:publish-licensing

echo "== sync permissions"
$COMPOSE exec -T -w /var/www/apps/auth-service auth-service php artisan permissions:sync

echo "== login"
TOKEN=$(curl -fsS -X POST "$BASE/api/admin/v1/auth/login" -H 'Content-Type: application/json' \
    -d '{"email":"root@example.com","password":"secret-123"}' | jqr "['data']['token']")
AUTH="Authorization: Bearer $TOKEN"

echo "== project"
curl -fsS -X POST "$BASE/api/admin/v1/projects" -H "$AUTH" -H 'Content-Type: application/json' \
    -d '{"key":"demo","name":"Demo Site"}' >/dev/null || true
for svc in content analytics pay; do
    curl -fsS -X PUT "$BASE/api/admin/v1/projects/demo/services/$svc" -H "$AUTH" \
        -H 'Content-Type: application/json' -d '{"enabled":true}' >/dev/null
done
# свежий стек: дефолтный провайдер оплат — platega (требует аккаунт);
# smoke идёт по manual-циклу (subscribe → confirm оператором)
curl -fsS -X PUT "$BASE/api/admin/v1/projects/demo/pay/settings" -H "$AUTH" \
    -H 'Content-Type: application/json' -d '{"provider":"manual"}' >/dev/null

PK=$(curl -fsS -X POST "$BASE/api/admin/v1/projects/demo/api-keys" -H "$AUTH" \
    -H 'Content-Type: application/json' -d '{"type":"public"}' | jqr "['data']['key']")
SK=$(curl -fsS -X POST "$BASE/api/admin/v1/projects/demo/api-keys" -H "$AUTH" \
    -H 'Content-Type: application/json' -d '{"type":"secret"}' | jqr "['data']['key']")
echo "keys: ${PK:0:12}… ${SK:0:12}…"

echo "== bootstrap"
curl -fsS "$BASE/api/admin/v1/bootstrap?project=demo" -H "$AUTH" \
    | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print('services:', [s['key'] for s in d['services']])"

echo "== content: post + publish + public + sitemap"
POST_ID=$(curl -fsS -X POST "$BASE/api/admin/v1/projects/demo/content/posts" -H "$AUTH" \
    -H 'Content-Type: application/json' -d "{\"title\":\"Hello Platform $RUN\",\"body\":\"First post\"}" | jqr "['data']['id']")
curl -fsS -X POST "$BASE/api/admin/v1/projects/demo/content/posts/$POST_ID/status" -H "$AUTH" \
    -H 'Content-Type: application/json' -d '{"status":"published"}' >/dev/null
curl -fsS "$BASE/api/v1/content/posts" -H "X-Api-Key: $SK" | jqr "['data'][0]['title']"
sleep 2 # sitemap регенерируется асинхронно
curl -fsS "$BASE/sitemap.xml" -H "X-Api-Key: $SK" | head -3
curl -fsS "$BASE/robots.txt" -H "X-Api-Key: $SK" | head -2

echo "== site user register/login"
curl -fsS -X POST "$BASE/api/v1/auth/register" -H "X-Api-Key: $SK" -H 'Content-Type: application/json' \
    -d "{\"email\":\"user-$RUN@example.com\",\"password\":\"secret-123\"}" >/dev/null || true
USER_TOKEN=$(curl -fsS -X POST "$BASE/api/v1/auth/login" -H "X-Api-Key: $SK" -H 'Content-Type: application/json' \
    -d "{\"email\":\"user-$RUN@example.com\",\"password\":\"secret-123\"}" | jqr "['data']['token']")

echo "== analytics: collect + flush + history"
curl -fsS -X POST "$BASE/api/v1/collect" -H "X-Api-Key: $PK" \
    -H 'User-Agent: Mozilla/5.0 (X11; Linux) Chrome/126.0' -H 'Content-Type: application/json' \
    -d '{"events":[{"name":"page_view","path":"/","session_id":"s1","anon_id":"a1"}]}' | jqr "['data']['accepted']"
$COMPOSE exec -T -w /var/www/apps/analytics-service analytics-service php artisan clickhouse:migrate
$COMPOSE exec -T -w /var/www/apps/analytics-service analytics-service php artisan analytics:flush --once

echo "== pay: plan → subscribe → manual confirm → cancel → resume"
curl -fsS -X POST "$BASE/api/admin/v1/projects/demo/pay/plans" -H "$AUTH" -H 'Content-Type: application/json' \
    -d "{\"code\":\"pro-$RUN\",\"name\":\"Pro\",\"price_minor\":19900,\"features\":[\"api-access\"]}" >/dev/null || true
SUB=$(curl -fsS -X POST "$BASE/api/v1/pay/subscriptions" -H "X-Api-Key: $SK" -H "X-User-Token: $USER_TOKEN" \
    -H 'Content-Type: application/json' -d "{\"plan_code\":\"pro-$RUN\"}")
SUB_ID=$(echo "$SUB" | jqr "['data']['subscription']['id']")
PAY_ID=$(echo "$SUB" | jqr "['data']['payment']['id']")
curl -fsS -X POST "$BASE/api/admin/v1/projects/demo/pay/payments/$PAY_ID/confirm" -H "$AUTH" | jqr "['data']['status']"
curl -fsS -X POST "$BASE/api/v1/pay/subscriptions/$SUB_ID/cancel" -H "X-Api-Key: $SK" -H "X-User-Token: $USER_TOKEN" | jqr "['data']['status']"
curl -fsS -X POST "$BASE/api/v1/pay/subscriptions/$SUB_ID/resume" -H "X-Api-Key: $SK" -H "X-User-Token: $USER_TOKEN" | jqr "['data']['status']"

echo "== licensing: issue → activate → refresh → updates/check"
# licensing отдельно не включается: модуль открывается вместе с pay (ServiceName::gate)
ORG_ID=$(curl -fsS -X POST "$BASE/api/admin/v1/projects/demo/pay/licensing/organizations" -H "$AUTH" \
    -H 'Content-Type: application/json' \
    -d "{\"name\":\"Smoke Org $RUN\",\"contact_first_name\":\"Ivan\",\"contact_last_name\":\"Petrov\",\"email\":\"org-$RUN@example.com\"}" \
    | jqr "['data']['id']")
LPLAN_ID=$(curl -fsS -X POST "$BASE/api/admin/v1/projects/demo/pay/licensing/plans" -H "$AUTH" \
    -H 'Content-Type: application/json' -d "{\"code\":\"box-$RUN\",\"name\":\"Box\"}" | jqr "['data']['id']")
curl -fsS -X POST "$BASE/api/admin/v1/projects/demo/pay/licensing/releases" -H "$AUTH" \
    -H 'Content-Type: application/json' \
    -d "{\"version\":\"1.0.$((RUN % 100000))\",\"train\":\"1.0\",\"repository\":\"crm/app-1.0\",\"released_at\":\"2026-01-10T00:00:00+00:00\"}" >/dev/null
LKEY=$(curl -fsS -X POST "$BASE/api/admin/v1/projects/demo/pay/licensing/licenses" -H "$AUTH" \
    -H 'Content-Type: application/json' \
    -d "{\"organization_id\":$ORG_ID,\"plan_id\":$LPLAN_ID,\"updates_until\":\"2030-01-01\"}" | jqr "['data']['key']")
INSTALL_ID=$(python3 -c "import secrets; print(secrets.token_hex(32))")
curl -fsS -X POST "$BASE/api/v1/pay/licensing/license/activate" -H 'Content-Type: application/json' \
    -d "{\"key\":\"$LKEY\",\"install_id\":\"$INSTALL_ID\",\"domain\":\"smoke.example\",\"app_version\":\"1.0.0\"}" \
    | jqr "['data']['state']"
curl -fsS -X POST "$BASE/api/v1/pay/licensing/license/refresh" -H 'Content-Type: application/json' \
    -d "{\"key\":\"$LKEY\",\"install_id\":\"$INSTALL_ID\",\"domain\":\"smoke.example\",\"app_version\":\"1.0.0\"}" \
    | jqr "['data']['state']"
curl -fsS -X POST "$BASE/api/v1/pay/licensing/updates/check" -H 'Content-Type: application/json' \
    -d "{\"key\":\"$LKEY\",\"install_id\":\"$INSTALL_ID\",\"app_version\":\"1.0.0\"}" \
    | python3 -c "import json,sys; d=json.load(sys.stdin)['data']; print('updates:', d['latest_entitled'], '/', d['latest_available'])"

echo "== analytics history of the user"
# события auth/pay лежат в очередях — прогоняем воркеры и flush
$COMPOSE exec -T -w /var/www/apps/auth-service auth-service php artisan queue:work --stop-when-empty --max-time=20 >/dev/null
$COMPOSE exec -T -w /var/www/apps/pay-service pay-service php artisan queue:work --stop-when-empty --max-time=20 >/dev/null
$COMPOSE exec -T -w /var/www/apps/content-service content-service php artisan queue:work --stop-when-empty --max-time=20 >/dev/null
$COMPOSE exec -T -w /var/www/apps/analytics-service analytics-service php artisan analytics:flush --once
USER_ID=$(curl -fsS "$BASE/api/v1/auth/me" -H "X-Api-Key: $SK" -H "Authorization: Bearer $USER_TOKEN" | jqr "['data']['id']")
PROJECT_ID=$(curl -fsS "$BASE/api/admin/v1/projects/demo" -H "$AUTH" | jqr "['data']['id']")
curl -fsS "$BASE/api/admin/v1/projects/demo/analytics/history/user:$PROJECT_ID:$USER_ID" -H "$AUTH" \
    | python3 -c "import json,sys; print('history:', [e['name'] for e in json.load(sys.stdin)['data']])"

echo "SMOKE OK"
