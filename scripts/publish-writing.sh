#!/usr/bin/env bash
# Commit and push a writing post to sumitridhal.github.io.
#
# Usage:
#   ./scripts/publish-writing.sh <slug> [--message "Custom commit message"]
#
# Stages all writing-related changes (MDX + media) and pushes to origin.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

SLUG=""
MESSAGE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --message) MESSAGE="$2"; shift 2 ;;
    --*) echo "Unknown flag: $1" >&2; exit 1 ;;
    *) SLUG="$1"; shift ;;
  esac
done

if [[ -z "$SLUG" ]]; then
  echo "Usage: ./scripts/publish-writing.sh <slug> [--message \"...\"]" >&2
  exit 1
fi

MDX_FILE="src/content/writings/${SLUG}.mdx"
if [[ ! -f "$MDX_FILE" ]]; then
  echo "Error: MDX file not found: $MDX_FILE" >&2
  exit 1
fi

if [[ -z "$MESSAGE" ]]; then
  MESSAGE="publish: add writing post '${SLUG}'"
fi

git add "$MDX_FILE"

MEDIA_DIR="public/media/writings"
if [[ -d "$MEDIA_DIR" ]]; then
  git add "$MEDIA_DIR/${SLUG}"* 2>/dev/null || true
  git add "$MEDIA_DIR/${SLUG}"/ 2>/dev/null || true
fi

if git diff --cached --quiet; then
  echo "Nothing staged — post may already be committed."
  exit 0
fi

git commit -m "${MESSAGE}

Co-Authored-By: Paperclip <noreply@paperclip.ing>"

git push origin HEAD

echo "Published: ${SLUG}"
echo "Deploy will trigger on push to $(git branch --show-current)."
