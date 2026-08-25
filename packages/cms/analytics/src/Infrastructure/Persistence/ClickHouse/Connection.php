<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Persistence\ClickHouse;

use Cms\Analytics\Domain\Contracts\AnalyticsStore;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;

/** Низкоуровневый клиент ClickHouse поверх HTTP-интерфейса (:8123). */
class Connection implements AnalyticsStore
{
    public function __construct(private readonly HttpFactory $http) {}

    /**
     * SELECT: возвращает строки как массивы (FORMAT JSON).
     *
     * @param  array<string, scalar>  $params  именованные параметры (`:name`)
     * @return list<array<string, mixed>>
     */
    public function select(string $sql, array $params = []): array
    {
        $response = $this->request()->withBody($this->bind($sql, $params).' FORMAT JSON', 'text/plain')->post('');
        $this->throwOnError($response, $sql);

        return $response->json('data') ?? [];
    }

    /**
     * DDL/DML без результата.
     *
     * @param  array<string, scalar>  $params
     */
    public function statement(string $sql, array $params = []): void
    {
        $this->throwOnError($this->request()->withBody($this->bind($sql, $params), 'text/plain')->post(''), $sql);
    }

    /**
     * Батч-вставка строк FORMAT JSONEachRow. Одиночные INSERT запрещены by design.
     *
     * @param  list<array<string, mixed>>  $rows
     */
    public function insertBatch(string $table, array $rows): void
    {
        if ($rows === []) {
            return;
        }

        $body = implode("\n", array_map(fn (array $row) => json_encode($row, JSON_UNESCAPED_UNICODE), $rows));
        $sql = "INSERT INTO {$table} FORMAT JSONEachRow";

        $this->throwOnError($this->request(['query' => $sql])->withBody($body, 'application/x-ndjson')->post(''), $sql);
    }

    /**
     * Подстановка именованных параметров `:name`.
     *
     * Экранирование выполняется здесь и только здесь — вызывающий код не собирает SQL
     * конкатенацией и не экранирует значения сам. Подстановка клиентская: текст запроса,
     * уходящий в ClickHouse, остаётся ровно прежним, поэтому переход на параметры не
     * меняет ни один выполняемый запрос.
     *
     * Следующий шаг (требует согласования, см. отчёт по задаче 2.7) — серверные
     * параметры ClickHouse (`{name:Type}` + `param_name` в query-string): они убирают
     * экранирование целиком, но меняют текст запроса, на который сейчас опираются
     * guard-тесты источника дат.
     *
     * @param  array<string, scalar>  $params
     */
    private function bind(string $sql, array $params): string
    {
        if ($params === []) {
            return $sql;
        }

        $replacements = [];
        foreach ($params as $name => $value) {
            $replacements[':'.$name] = $this->quote($value);
        }

        // Длинные имена подставляются первыми: `:from` не должен съесть `:from_date`.
        uksort($replacements, static fn (string $a, string $b): int => strlen($b) <=> strlen($a));

        return strtr($sql, $replacements);
    }

    /** Литерал ClickHouse: числа — как есть, строки — в кавычках с экранированием. */
    private function quote(bool|int|float|string $value): string
    {
        return match (true) {
            is_bool($value) => $value ? '1' : '0',
            is_int($value) => (string) $value,
            is_float($value) => var_export($value, true),
            default => "'".addslashes($value)."'",
        };
    }

    /** @param  array<string, scalar>  $params */
    private function request(array $params = []): PendingRequest
    {
        $config = config('cms-analytics.clickhouse');

        return $this->http
            ->baseUrl(sprintf('http://%s:%d', $config['host'], $config['port']))
            ->timeout((int) ($config['timeout'] ?? 10))
            ->withQueryParameters($params + ['database' => $config['database']])
            ->withHeaders([
                'X-ClickHouse-User' => $config['username'],
                'X-ClickHouse-Key' => $config['password'],
            ]);
    }

    private function throwOnError(Response $response, string $sql): void
    {
        if ($response->failed()) {
            throw new ClickHouseException("ClickHouse query failed: {$response->body()} (SQL: ".substr($sql, 0, 200).')');
        }
    }
}
