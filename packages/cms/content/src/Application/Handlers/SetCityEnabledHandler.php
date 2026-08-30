<?php

declare(strict_types=1);

namespace Cms\Content\Application\Handlers;

use Cms\Content\Application\Commands\SetCityEnabledCommand;
use Cms\Content\Domain\Models\City;
use Cms\Content\Domain\Models\ProjectCity;

final class SetCityEnabledHandler
{
    public function handle(SetCityEnabledCommand $command): ProjectCity
    {
        $city = City::query()->findOrFail($command->cityId);

        /** @var ProjectCity $enrollment */
        $enrollment = ProjectCity::query()->updateOrCreate(
            ['city_id' => $city->id],
            ['enabled' => $command->enabled],
        );

        return $enrollment;
    }
}
