#!/usr/bin/env bash
# Veröffentlicht den Ordner (Standard: ausgabe) als einzigen Commit im Zweig "data" des Repos (Force-Push, keine wachsende Historie).
# Läuft in GitHub Actions (GH_TOKEN und GITHUB_REPOSITORY gesetzt). Lokal NIE ohne ausdrückliches OK ausführen.
set -euo pipefail
dir="${1:-ausgabe}"
: "${GH_TOKEN:?GH_TOKEN fehlt}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY fehlt}"
cd "$dir"
stand="$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync("status.json","utf8")).stand)')"
rm -rf .git
git init -q -b data
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -A
git commit -q -m "Daten, Stand ${stand}"
basic="$(printf 'x-access-token:%s' "$GH_TOKEN" | base64 | tr -d '\n')"
git -c http.extraheader="AUTHORIZATION: basic ${basic}" push -q --force "https://github.com/${GITHUB_REPOSITORY}.git" data
echo "Veröffentlicht: Zweig data, Stand ${stand}"
