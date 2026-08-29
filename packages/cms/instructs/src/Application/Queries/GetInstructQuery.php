<?php

declare(strict_types=1);

namespace Cms\Instructs\Application\Queries;

use Cms\Instructs\Domain\Models\Instruct;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/** Чтение одной инструкции: чужая неотличима от несуществующей. */
final readonly class GetInstructQuery
{
    public function handle(int $instructId): Instruct
    {
        $instruct = Instruct::query()->whereKey($instructId)->first();

        if ($instruct === null) {
            throw (new ModelNotFoundException)->setModel(Instruct::class, [$instructId]);
        }

        return $instruct;
    }
}
