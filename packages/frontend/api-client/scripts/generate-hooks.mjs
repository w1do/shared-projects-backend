// Генерация TanStack Query-хуков из единого swagger.
// Каждый path+verb превращается в useXxxQuery / useXxxMutation.
import { readFileSync, writeFileSync } from 'node:fs';

const spec = JSON.parse(readFileSync(new URL('../../../../openapi/openapi.json', import.meta.url), 'utf8'));

const lines = [
  "// АВТОГЕНЕРАЦИЯ из openapi/openapi.json — не редактировать руками.",
  "import { useMutation, useQuery } from '@tanstack/react-query';",
  "import { apiFetch } from './client';",
  '',
];

const toName = (operationId, method, path) =>
  (operationId ?? `${method}_${path}`).replace(/[^a-zA-Z0-9]+/g, '_')
    .split('_').filter(Boolean).map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join('');

for (const [path, ops] of Object.entries(spec.paths)) {
  for (const [method, op] of Object.entries(ops)) {
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
    const name = toName(op.operationId, method, path);
    const hook = name[0].toUpperCase() + name.slice(1);
    const params = [...path.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
    const args = params.map((p) => `${p}: string | number`).join(', ');
    const url = '`' + path.replace(/\{(\w+)\}/g, '${$1}') + '`';

    if (method === 'get') {
      lines.push(
        `export function use${hook}Query(${args}${args ? ', ' : ''}options: Record<string, unknown> = {}) {`,
        `  return useQuery({ queryKey: ['${name}'${params.length ? ', ' + params.join(', ') : ''}], queryFn: () => apiFetch(${url}), ...options });`,
        `}`,
        '',
      );
    } else {
      lines.push(
        `export function use${hook}Mutation(${args}) {`,
        `  return useMutation({ mutationFn: (body?: unknown) => apiFetch(${url}, { method: '${method.toUpperCase()}', body }) });`,
        `}`,
        '',
      );
    }
  }
}

writeFileSync(new URL('../src/hooks.ts', import.meta.url), lines.join('\n'));
console.log('generated src/hooks.ts');
