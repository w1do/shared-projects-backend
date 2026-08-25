<?php

declare(strict_types=1);

namespace Cms\Analytics\Infrastructure\Persistence\ClickHouse;

use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;

/** Низкоуровневый клиент ClickHouse поверх HTTP-интерфейса (:8123). */
class Connection
{
    public function __construct(private readonly HttpFactory $http) {}

    /** SELECT: возвращает строки как массивы (FORMAT JSON). */
    public function select(string $sql, array $params = []): array
    {
        $response = $this->request($params)->withBody($sql.' FORMAT JSON', 'text/plain')->post('');
        $this->throwOnError($response, $sql);

        return $response->json('data') ?? [];
    }

    /** DDL/DML без результата. */
    public function statement(string $sql, array $params = []): void
    {
        $this->throwOnError($this->request($params)->withBody($sql, 'text/plain')->post(''), $sql);
    }

    /** Батч-вставка строк FORMAT JSONEachRow. Одиночные INSERT запрещены by design. */
    public function insertBatch(string $table, array $rows): void
    {
        if ($rows === []) {
            return;
        }

        $body = implode("\n", array_map(fn (array $row) => json_encode($row, JSON_UNESCAPED_UNICODE), $rows));
        $sql = "INSERT INTO {$table} FORMAT JSONEachRow";

        $this->throwOnError($this->request(['query' => $sql])->withBody($body, 'application/x-ndjson')->post(''), $sql);
    }

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
