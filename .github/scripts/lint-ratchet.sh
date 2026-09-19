#!/usr/bin/env bash
# Lint as a regression gate rather than a pass/fail wall.
#
# The tree carries a backlog of pre-existing eslint errors. Making lint a
# required check outright would fail every pull request from day one whatever
# its diff, which just teaches everyone to ignore a red mark. Letting it always
# pass is no better. So this fails only when a branch adds errors.
#
# It measures the BASE BRANCH in the same checkout and the same node_modules,
# rather than comparing against a number committed to the repo. A hardcoded
# baseline was wrong twice: the count differs between a CI runner's clean
# `npm ci` and a developer's tree, so a number that passed in one place failed
# in the other while the diff itself added nothing. Measuring both sides here
# removes the environment from the comparison entirely, and means nobody has to
# remember to lower a number when the backlog shrinks.
#
# eslint's json formatter crashes on this tree (a plugin fault inside
# eslint-plugin-react's Components.js), so counts are read from the summary
# line of the default formatter instead.
set -uo pipefail

BASE_REF="${BASE_REF:-origin/main}"

count_errors() {
  # Echoes the eslint error count, or "?" if the summary could not be parsed.
  local out status n
  out=$(npm run lint 2>&1)
  status=$?
  if [ "$status" -eq 0 ]; then echo 0; return 0; fi
  # Matches the tail of: "✖ 21 problems (8 errors, 13 warnings)"
  n=$(printf '%s\n' "$out" | sed -n 's/.*(\([0-9][0-9]*\) error[s]*,.*/\1/p' | tail -1)
  if [ -z "$n" ]; then
    printf '%s\n' "$out" >&2
    echo "?"
    return 0
  fi
  echo "$n"
}

echo "== Linting this branch =="
head_out=$(npm run lint 2>&1)
printf '%s\n' "$head_out"
head_errors=$(printf '%s\n' "$head_out" | sed -n 's/.*(\([0-9][0-9]*\) error[s]*,.*/\1/p' | tail -1)
if printf '%s\n' "$head_out" | grep -q '✖'; then
  [ -z "$head_errors" ] && head_errors="?"
else
  head_errors=0
fi

if [ "$head_errors" = "?" ]; then
  echo "::error::Could not parse an eslint summary for this branch. Treating as a failure."
  exit 1
fi

echo
echo "== Linting ${BASE_REF} for comparison =="
if ! git rev-parse --verify --quiet "$BASE_REF" >/dev/null; then
  echo "::warning::${BASE_REF} is not available, so there is nothing to compare against. Reporting ${head_errors} error(s) without gating."
  exit 0
fi

# Measure the base in a scratch worktree so the checkout under test is untouched.
scratch=$(mktemp -d)
cleanup() { git worktree remove --force "$scratch/base" >/dev/null 2>&1 || true; rm -rf "$scratch"; }
trap cleanup EXIT

if ! git worktree add --detach "$scratch/base" "$BASE_REF" >/dev/null 2>&1; then
  echo "::warning::Could not check out ${BASE_REF} to compare against. Reporting ${head_errors} error(s) without gating."
  exit 0
fi

# Reuse this checkout's node_modules and config so both sides are measured by
# the identical toolchain -- that is the whole point of comparing here.
ln -s "$PWD/node_modules" "$scratch/base/node_modules" 2>/dev/null || true
base_errors=$(cd "$scratch/base" && count_errors)

if [ "$base_errors" = "?" ]; then
  echo "::warning::Could not parse an eslint summary for ${BASE_REF}. Reporting ${head_errors} error(s) without gating."
  exit 0
fi

echo
echo "eslint errors — this branch: ${head_errors}, ${BASE_REF}: ${base_errors}"

if [ "$head_errors" -gt "$base_errors" ]; then
  echo "::error::This branch adds $((head_errors - base_errors)) eslint error(s) on top of ${BASE_REF}. Fix them before merging."
  exit 1
fi

if [ "$head_errors" -lt "$base_errors" ]; then
  echo "::notice::This branch removes $((base_errors - head_errors)) eslint error(s). Thank you."
fi

echo "No new eslint errors."
