<?php

declare(strict_types=1);

namespace Cms\Instructs\Domain\Policies;

use Cms\Instructs\Domain\Models\Instruct;
use Illuminate\Auth\Access\Response;

/**
 * Правка и удаление — только своей инструкции проекта. Предустановленные
 * инструкции платформы доступны всем на чтение и не редактируются: их состав
 * пере-раскрывается сидером при каждом деплое, ручная правка была бы затёрта.
 *
 * Policy вызывается handler'ом напрямую: сообщение отказа — часть контракта
 * ответа, а не результат `Gate::before` супер-админа.
 */
final class InstructPolicy
{
    public function view(Instruct $instruct, string $projectId): Response
    {
        return $instruct->is_system || $instruct->project_id === $projectId
            ? Response::allow()
            : Response::deny('Instruct belongs to another project.');
    }

    public function update(Instruct $instruct, string $projectId): Response
    {
        if ($instruct->is_system) {
            return Response::deny('System instructs cannot be modified.');
        }

        return $instruct->project_id === $projectId
            ? Response::allow()
            : Response::deny('Instruct belongs to another project.');
    }

    public function delete(Instruct $instruct, string $projectId): Response
    {
        if ($instruct->is_system) {
            return Response::deny('System instructs cannot be deleted.');
        }

        return $instruct->project_id === $projectId
            ? Response::allow()
            : Response::deny('Instruct belongs to another project.');
    }
}
