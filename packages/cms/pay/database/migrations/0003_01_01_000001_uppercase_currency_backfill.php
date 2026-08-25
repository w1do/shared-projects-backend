<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Бэкфилл Д11: валюта приводится к верхнему регистру во всех денежных
 * таблицах. Выполняется ДО возврата строгой типизации Money на путях
 * чтения (`Plan::price()` / `Payment::amount()`): VO `Currency` принимает
 * только `^[A-Z]{3}$`, и исторический нижний регистр ронял бы чтение.
 * `UPPER()` одинаково работает на pgsql и sqlite (тестовая БД).
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach (['plans', 'payments', 'payment_transactions'] as $table) {
            DB::table($table)->update(['currency' => DB::raw('UPPER(currency)')]);
        }
    }

    public function down(): void
    {
        // One-way: исходный регистр после UPPER() не восстановим, да и не нужен —
        // нижний регистр был дефектом, а не состоянием, к которому есть смысл
        // откатываться. Откат кода безопасен и без отката данных.
    }
};
