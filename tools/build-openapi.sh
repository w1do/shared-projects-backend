#!/usr/bin/env bash
# Сборка единого swagger: аннотации swagger-php каждого сервиса → openapi/<service>.json → openapi/openapi.json
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "$ROOT/openapi"

SERVICES=(auth content analytics pay)
for s in "${SERVICES[@]}"; do
    app="$ROOT/apps/${s}-service"
    extra=""
    # словарь переводов живёт в content-service отдельным пакетом
    [ "$s" = "content" ] && extra="$ROOT/packages/cms/localization/src"
    # платформенные internal-маршруты (cache-bust) живут в shared; документируем через auth
    [ "$s" = "auth" ] && extra="$ROOT/packages/cms/shared/src"
    "$app/vendor/bin/openapi" --format json --output "$ROOT/openapi/${s}.json" "$ROOT/packages/cms/${s}/src" $extra 2>/dev/null
    echo "built openapi/${s}.json"
done

# merge: общий info + объединение paths/components всех сервисов
php -r '
$root = $argv[1];
$merged = [
    "openapi" => "3.0.0",
    "info" => ["title" => "Platform API", "version" => "0.1.0",
        "description" => "Единый контракт всех сервисов платформы (auth, content, analytics, pay)"],
    "paths" => [], "components" => ["securitySchemes" => []], "tags" => [],
];
foreach (["auth", "content", "analytics", "pay"] as $s) {
    $doc = json_decode(file_get_contents("$root/openapi/$s.json"), true);
    foreach ($doc["paths"] ?? [] as $path => $ops) {
        $merged["paths"][$path] = array_merge($merged["paths"][$path] ?? [], $ops);
    }
    foreach ($doc["components"]["securitySchemes"] ?? [] as $k => $v) {
        $merged["components"]["securitySchemes"][$k] = $v;
    }
    foreach ($doc["components"]["schemas"] ?? [] as $k => $v) {
        $merged["components"]["schemas"][$k] = $v;
    }
    $merged["tags"][] = ["name" => $s];
}
ksort($merged["paths"]);
file_put_contents("$root/openapi/openapi.json", json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)."\n");
echo "merged openapi/openapi.json: ".count($merged["paths"])." paths\n";
' "$ROOT"
