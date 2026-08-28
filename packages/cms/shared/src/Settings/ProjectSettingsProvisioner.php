<?php

declare(strict_types=1);

namespace Cms\Shared\Settings;

use Spatie\LaravelSettings\SettingsRepositories\SettingsRepository;

/**
 * Достройка недостающих свойств группы настроек для текущего проекта.
 *
 * Per-project строки нельзя засеять миграцией — проекты создаются динамически,
 * поэтому значения по умолчанию материализуются при первом обращении
 * (handlers вызывают ensure() перед чтением/записью группы).
 */
final class ProjectSettingsProvisioner
{
    public function __construct(private readonly SettingsRepository $repository) {}

    /** @param array<string, mixed> $defaults свойство → значение по умолчанию */
    public function ensure(string $group, array $defaults): void
    {
        $existing = $this->repository->getPropertiesInGroup($group);

        foreach ($defaults as $name => $value) {
            if (! array_key_exists($name, $existing)) {
                $this->repository->createProperty($group, $name, $value);
            }
        }
    }
}
