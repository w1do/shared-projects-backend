#!/usr/bin/env bash
# mirror-own-files — список собственных файлов консоли: тех, которых нет в складе.
#
# Перенесённая вёрстка не форматируется — иначе рушится сверка со складом
# (`tools/mirror-check.sh`). Линт консоли работает по выводу этого скрипта.
# Пути печатаются относительно `frontends/admin`.
#
#   ./tools/mirror-own-files.sh
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SOURCE="frontends/source-admin"
ADMIN="frontends/admin"

while IFS= read -r file; do
    rel="${file#"$ADMIN"/}"
    [ -f "$SOURCE/$rel" ] || printf '%s\n' "$rel"
done < <(find "$ADMIN/src" -type f \( -name '*.ts' -o -name '*.tsx' \) | sort)
