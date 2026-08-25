<?php

declare(strict_types=1);

namespace Cms\Auth\Application\DTOs\Bootstrap;

use Spatie\LaravelData\Data;

/**
 * Полное описание консоли одним ответом: раньше — семиключевой ассоциативный
 * массив, собираемый в глубине query.
 *
 * Форма значения намеренно совпадает с тем, что сегодня лежит в кэше bootstrap
 * (инвариант И12): DTO собирается из закэшированного массива и разворачивается
 * обратно в него же. Поэтому прогретый после выката Redis читается корректно,
 * и префикс ключа менять не требуется.
 */
final class BootstrapDTO extends Data
{
    /**
     * @param  list<BootstrapProjectDTO>  $projects
     * @param  list<ServiceNavigationDTO>  $services
     * @param  list<string>  $permissions
     */
    public function __construct(
        public BootstrapUserDTO $user,
        public array $projects,
        public ?string $current_project,
        public array $services,
        public array $permissions,
        public string $translations_version,
        public string $server_time,
    ) {}

    /**
     * Разбор закэшированного значения. Приведение явное, а не через магию
     * `Data::from()`: значение может быть записано предыдущим выкатом, и молчаливое
     * «как-нибудь смапится» здесь недопустимо.
     *
     * @param  array<string, mixed>  $value
     */
    public static function fromCached(array $value): self
    {
        /** @var array<string, mixed> $user */
        $user = $value['user'];
        /** @var list<array<string, mixed>> $projects */
        $projects = array_values((array) $value['projects']);
        /** @var list<array<string, mixed>> $services */
        $services = array_values((array) $value['services']);
        /** @var list<string> $permissions */
        $permissions = array_values((array) $value['permissions']);

        return new self(
            user: BootstrapUserDTO::from($user),
            projects: array_map(BootstrapProjectDTO::from(...), $projects),
            current_project: $value['current_project'] === null ? null : (string) $value['current_project'],
            services: array_map(ServiceNavigationDTO::from(...), $services),
            permissions: $permissions,
            translations_version: (string) $value['translations_version'],
            server_time: (string) $value['server_time'],
        );
    }
}
