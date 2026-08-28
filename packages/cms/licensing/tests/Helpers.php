<?php

declare(strict_types=1);

/*
 * Общие помощники тестов licensing. Оператор — через FakePayIntrospector
 * из pay/tests/Helpers.php (пакеты живут в одном pay-service).
 */

function licensingOperator(array $permissions = ['pay.licensing.view', 'pay.licensing.manage']): array
{
    return actingAsPayOperator(permissions: $permissions);
}

function licensingUrl(string $path): string
{
    return "/api/admin/v1/projects/proj-1/pay/licensing/{$path}";
}
