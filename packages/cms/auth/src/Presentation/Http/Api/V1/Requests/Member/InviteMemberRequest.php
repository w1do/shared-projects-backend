<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Member;

use Cms\Auth\Application\Queries\ProjectRoleExistsQuery;
use Cms\Auth\Domain\Models\Admin;
use Cms\Auth\Domain\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * Приглашение оператора в проект.
 *
 * Порядок проверок сохранён дословно: сначала формат, затем существование роли
 * в этом проекте, и только потом — повторное приглашение. Роль проверяется до
 * всего остального, потому что раньше неверная роль оставила бы аккаунт-сироту:
 * handler заводит оператора, если его ещё нет.
 */
final class InviteMemberRequest extends FormRequest
{
    public function __construct(private readonly ProjectRoleExistsQuery $roles)
    {
        parent::__construct();
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            // Оператора с таким email может ещё не быть — handler заведёт его.
            'email' => ['required', 'email', 'max:255'],
            'role' => ['required', 'string'],
            'name' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            /** @var Project $project */
            $project = $this->attributes->get('project');

            if (! $this->roles->handle($project, (string) $this->input('role'))) {
                $validator->errors()->add('role', 'Unknown role for this project.');

                return;
            }

            $member = Admin::query()->where('email', $this->input('email'))->first();

            if ($member instanceof Admin && $project->hasMember($member)) {
                $validator->errors()->add('email', 'Already a member of this project.');
            }
        });
    }
}
