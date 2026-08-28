#!/usr/bin/env bash
# refactor-inventory — исполняемый инвентарь целей change `refactor-ddd-cqrs-packages`.
#
# Каждая метрика — количество отклонений от канона (CLAUDE.md / STRUCTURE.md).
# Пока рефакторинг не завершён, счётчики положительные; цель change — все нули.
#
#   ./tools/refactor-inventory.sh            показать текущее состояние
#   ./tools/refactor-inventory.sh --strict   выйти с кодом 1, если хоть одна метрика не ноль
#
# Скрипт — гейт задачи 0.2, он же используется в финальной верификации (9.1).
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

STRICT=0
[ "${1:-}" = "--strict" ] && STRICT=1

MODULES="auth content pay analytics localization ai licensing"
FAILED=0
TOTAL=0

# report <текущее> <цель> <имя метрики>
report() {
    local current="$1" target="$2" name="$3"
    TOTAL=$((TOTAL + current))
    if [ "$current" -eq "$target" ]; then
        printf '  \033[32m✓\033[0m %4s  %s\n' "$current" "$name"
    else
        printf '  \033[31m✗\033[0m \033[31m%4s\033[0m  %s (цель %s)\n' "$current" "$name" "$target"
        FAILED=$((FAILED + 1))
    fi
}

echo ""
echo "Инвентарь отклонений от канона — change refactor-ddd-cqrs-packages"
echo "───────────────────────────────────────────────────────────────────────"
echo ""
echo "Конвейер FormRequest → DTO → Handler → JsonResource:"

report "$(grep -rl 'public static function rules' packages/cms/*/src/Application/DTOs --include=*.php 2>/dev/null | wc -l | tr -d ' ')" 0 \
    "DTO с rules() — валидация вне FormRequest"
report "$(grep -rn '\$request->validate(' packages/cms/*/src --include=*.php 2>/dev/null | wc -l | tr -d ' ')" 0 \
    "\$request->validate() в пакетах"
report "$(grep -rn 'Validator::make' packages/cms/*/src/Application --include=*.php 2>/dev/null | wc -l | tr -d ' ')" 0 \
    "Validator::make() в Application"
report "$(grep -rn 'throw ValidationException\|ValidationException::withMessages' packages/cms/*/src/Application/Handlers --include=*.php 2>/dev/null | wc -l | tr -d ' ')" 0 \
    "ValidationException, брошенный из Handlers"

missing_requests=0
missing_resources=0
for m in $MODULES; do
    [ -d "packages/cms/$m/src/Presentation/Http" ] || continue
    [ -d "packages/cms/$m/src/Presentation/Http/Api/V1/Requests" ] || missing_requests=$((missing_requests + 1))
    [ -d "packages/cms/$m/src/Presentation/Http/Api/V1/Resources" ] || missing_resources=$((missing_resources + 1))
done
report "$missing_requests" 0 "модуль-пакеты с HTTP, но без каталога Requests/"
report "$missing_resources" 0 "модуль-пакеты с HTTP, но без каталога Resources/"

echo ""
echo "Структура и нейминг:"

report "$(ls packages/cms/*/src/Application/Queries/*.php 2>/dev/null | grep -vc 'Query\.php$' || true)" 0 \
    "Query-классы без суффикса *Query"
# Канон применяется к модуль-пакетам; провайдеры библиотек (shared, contracts,
# generators) остаются в корне src/ by design (Decision 11 / задача 1.7).
module_root_providers=0
for m in $MODULES; do
    ls packages/cms/$m/src/*ServiceProvider.php >/dev/null 2>&1 && module_root_providers=$((module_root_providers + 1))
done
report "$module_root_providers" 0 \
    "сервис-провайдеры модуль-пакетов в корне src/ вместо Infrastructure/Providers/"
report "$(find packages/cms/*/src -type d -empty 2>/dev/null | wc -l | tr -d ' ')" 0 \
    "пустые каталоги-огрызки в пакетах"

echo ""
echo "Направление зависимостей между слоями:"

report "$(grep -rn 'use Cms\\[A-Za-z]*\\Application' packages/cms/*/src/Domain --include=*.php 2>/dev/null | wc -l | tr -d ' ')" 0 \
    "импорты Application внутри Domain"
report "$(grep -rn 'use Illuminate\\Http\\Request\|use Illuminate\\Foundation\\Http\\FormRequest' packages/cms/*/src/Application --include=*.php 2>/dev/null | wc -l | tr -d ' ')" 0 \
    "импорты HTTP-классов внутри Application"
report "$(grep -rn '\bapp(\|\bresolve(' packages/cms/*/src/Domain packages/cms/*/src/Application packages/cms/*/src/Presentation --include=*.php 2>/dev/null | wc -l | tr -d ' ')" 0 \
    "app()/resolve() в Domain/Application/Presentation"

echo ""
echo "Дублирование и инварианты:"

# ProviderWebhookController — согласованное отступление 7.4: маршрут /webhooks/*
# не под api/*, конверт 404-рендера там не сработал бы (Б-список design.md).
report "$(grep -rn 'ErrorEnvelope::notFound' packages/cms/*/src/Presentation --include=*.php 2>/dev/null | grep -v 'ProviderWebhookController.php' | wc -l | tr -d ' ')" 0 \
    "ErrorEnvelope::notFound() в контроллерах вместо общего приёма"
report "$(grep -rn 'setPermissionsTeamId' packages/cms/*/src --include=*.php 2>/dev/null | grep -v 'AdminPermissionResolver.php' | wc -l | tr -d ' ')" 0 \
    "setPermissionsTeamId вне общего резолвера прав"
report "$(grep -rn 'use Cms\\Content\\Domain\\Models' packages/cms/localization/src --include=*.php 2>/dev/null | wc -l | tr -d ' ')" 0 \
    "импорты моделей content внутри localization (нарушение границ)"
# Policies вводятся точечно (Decision 5): только там, где есть per-record проверки.
report "$(for m in auth pay; do [ -d "packages/cms/$m/src/Domain/Policies" ] || echo x; done | wc -l | tr -d ' ')" 0 \
    "пакеты с per-record проверками (auth, pay) без Domain/Policies/"

echo ""
echo "───────────────────────────────────────────────────────────────────────"
if [ "$FAILED" -eq 0 ]; then
    printf '\033[32mВсе метрики достигли цели.\033[0m\n\n'
    exit 0
fi

printf 'Метрик не достигло цели: \033[31m%s\033[0m. Суммарно отклонений: %s\n\n' "$FAILED" "$TOTAL"
[ "$STRICT" -eq 1 ] && exit 1
exit 0
