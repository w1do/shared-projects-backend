<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Resources\User;

use Cms\Auth\Application\DTOs\User\SiteUserDTO;
use Cms\Auth\Domain\Models\User;
use Cms\Shared\Http\Resources\ApiResource;
use Illuminate\Http\Request;

/**
 * Элемент списка пользователей: на вход приходит модель, а не DTO,
 * потому что коллекция строится поверх курсорного пагинатора Eloquent.
 *
 * @property User $resource
 */
final class SiteUserModelResource extends ApiResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return SiteUserDTO::fromModel($this->resource)->toArray();
    }
}
