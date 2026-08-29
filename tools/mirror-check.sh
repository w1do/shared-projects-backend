#!/usr/bin/env bash
# mirror-check — сверка перенесённой вёрстки со складом `frontends/source-admin`.
#
# Сверяется только пересечение: файл, который есть и в складе, и в консоли,
# обязан совпадать побайтово. Файл, которого нет в консоли (не перенесли), и
# файл, которого нет в складе (собственный код консоли), — норма.
#
#   ./tools/mirror-check.sh   код 1, если хоть один общий файл разошёлся
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SOURCE="frontends/source-admin"
ADMIN="frontends/admin"
PATHS="src/components src/app src/styles.css src/theme.css public"

shared=0
diverged=0

check_file() {
    local rel="$1"
    [ -f "$ADMIN/$rel" ] || return 0
    shared=$((shared + 1))
    cmp -s "$SOURCE/$rel" "$ADMIN/$rel" && return 0
    printf '  \033[31m✗\033[0m %s\n' "$rel"
    diverged=$((diverged + 1))
}

echo ""
echo "Сверка консоли со складом вёрстки"
echo "───────────────────────────────────────────────────────────────────────"

for path in $PATHS; do
    if [ -f "$SOURCE/$path" ]; then
        check_file "$path"
        continue
    fi
    [ -d "$SOURCE/$path" ] || continue
    while IFS= read -r file; do
        check_file "${file#"$SOURCE"/}"
    done < <(find "$SOURCE/$path" -type f | sort)
done

echo ""
if [ "$diverged" -eq 0 ]; then
    printf '\033[32m✓\033[0m Общих файлов: %s, расхождений нет.\n\n' "$shared"
    exit 0
fi

printf 'Общих файлов: %s, разошлось: \033[31m%s\033[0m.\n' "$shared" "$diverged"
printf 'Правка перенесённого файла переносится в склад тем же изменением.\n\n'
exit 1
