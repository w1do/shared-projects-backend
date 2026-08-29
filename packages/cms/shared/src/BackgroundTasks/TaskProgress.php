<?php

declare(strict_types=1);

namespace Cms\Shared\BackgroundTasks;

use Throwable;

/**
 * Порт записи хода фоновой задачи.
 *
 * Обработчик очереди не знает про модель реестра: он только заводит запись,
 * отмечает этапы и сообщает исход.
 */
interface TaskProgress
{
    /** Ставит задачу в реестр в состоянии «принята» и отдаёт её идентификатор. */
    public function queue(
        BackgroundTaskKind $kind,
        ?string $subjectType = null,
        ?string $subjectId = null,
        ?string $initiatedBy = null,
    ): int;

    /** Задача взята обработчиком: состояние «выполняется». */
    public function start(int $taskId, ?string $stage = null): void;

    /** Обработчик перешёл к следующему этапу работы. */
    public function stage(int $taskId, string $stage): void;

    /** Работа завершена; `$subjectId` заполняется, когда предмет создан самой задачей. */
    public function succeed(int $taskId, ?string $subjectId = null): void;

    /** Задача отклонена: наружу уходит причина, технический след — только в лог. */
    public function fail(int $taskId, Throwable $error): void;
}
