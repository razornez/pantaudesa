#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Sync code from this PRIVATE repo → the PUBLIC open-source repo (pantaudesa-app).
#
# Model: the public repo is a CODE MIRROR of this private repo's `main`.
#   - Everything is synced EXCEPT `docs/` and `.github/`, which are managed
#     directly in the public repo (so confidential docs never leak, and the
#     public CI/templates/CODEOWNERS aren't overwritten).
#   - `.env` / `.env.local` are never synced (not tracked by git).
#
# Contributor model: PRs on the public repo are reviewed, then the accepted
# change is applied HERE (private main). It reaches the public repo on the next
# sync. (Public main only ever receives sync commits — never merge PRs directly,
# or this sync will overwrite them.)
#
# Usage:
#   bash scripts/sync-public.sh            # dry run — show what would change
#   bash scripts/sync-public.sh --push     # sync + commit + push to public
#   bash scripts/sync-public.sh --push /path/to/pantaudesa-app
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PRIVATE="$(cd "$(dirname "$0")/.." && pwd)"
PUSH=0
PUBLIC=""
for arg in "$@"; do
  case "$arg" in
    --push) PUSH=1 ;;
    *) PUBLIC="$arg" ;;
  esac
done
PUBLIC="${PUBLIC:-$PRIVATE/../pantaudesa-app}"

[ -d "$PUBLIC/.git" ] || { echo "❌ Public repo not found at: $PUBLIC"; exit 1; }

# Always publish the canonical `main` of the private repo.
SRC_REF="main"
SRC_SHA="$(git -C "$PRIVATE" rev-parse --short "$SRC_REF")"
echo "→ Source: private $SRC_REF ($SRC_SHA)"
echo "→ Target: $PUBLIC"

# 1. Bring the public clone up to date.
git -C "$PUBLIC" checkout main >/dev/null 2>&1
git -C "$PUBLIC" pull --ff-only >/dev/null 2>&1 || true

# 2. Remove public CODE files (preserve docs/ and .github/ — managed in public).
( cd "$PUBLIC" && git ls-files | grep -vE '^docs/|^\.github/' | xargs -r rm -f )

# 3. Extract private main's tracked tree (minus docs/ and .github/) into public.
git -C "$PRIVATE" archive "$SRC_REF" \
  | tar -x -C "$PUBLIC" \
      --exclude='docs' --exclude='docs/*' \
      --exclude='.github' --exclude='.github/*' \
      --exclude='scripts/sync-public.sh'

# 4. Stage + show the diff.
git -C "$PUBLIC" add -A
echo ""
echo "=== Changes to publish ==="
git -C "$PUBLIC" status --short | head -40
CHANGED="$(git -C "$PUBLIC" status --porcelain | wc -l | tr -d ' ')"
echo "($CHANGED files changed)"

# 4b. Safety: confidential docs must never appear in the public tree.
if git -C "$PUBLIC" ls-files | grep -qiE '^docs/(business|company|cto|project-management|product|engineering|qa|data)/|^docs/bmad/(reports|plans|reviews|runbooks|samples|screenshots|stories|tasks|architecture|references)/'; then
  echo "❌ ABORT: confidential docs detected in public tree. Not committing."
  exit 1
fi

if [ "$PUSH" != "1" ]; then
  echo ""
  echo "Dry run. Re-run with --push to commit & push:"
  echo "  bash scripts/sync-public.sh --push"
  exit 0
fi

if [ "$CHANGED" = "0" ]; then
  echo "Nothing to sync — public is already up to date."
  exit 0
fi

# 5. Commit + push.
git -C "$PUBLIC" -c user.email="razornez@gmail.com" -c user.name="razornez" \
  commit -q -m "sync: code from private main ($SRC_SHA)"
git -C "$PUBLIC" push
echo "✅ Synced & pushed to public ($(git -C "$PUBLIC" rev-parse --short HEAD))."
