<?php

declare(strict_types=1);

namespace Cms\Auth\Presentation\Http\Api\V1\Requests\Member;

use Cms\Auth\Application\Queries\ProjectRoleExistsQuery;
use Cms\Auth\Domain\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/** Смена роли участника: роль обязана быть объявлена в этом же проекте. */
final class AssignRoleRequest extends FormRequest
{
    public function __construct(private readonly ProjectRoleExistsQuery $roles)
    {
        parent::__construct();
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return ['role' => ['required', 'string', 'max:64']];
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
            }
        });
    }
}
