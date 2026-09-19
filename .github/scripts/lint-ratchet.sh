#!/usr/bin/env bash
# Lint as a regression gate rather than a pass/fail wall.
#
# The tree carries a backlog of pre-existing eslint errors. Making lint a
# required check outright would fail every pull request from day one whatever
# its diff, which just teaches everyone to ignore a red mark. Letting it always
# pass is no better. So this fails only when a change pushes the error count
# ABOVE the recorded baseline, and tells you to lower the baseline whenever the
# count drops -- the number can only ratchet downward.
#
# eslint's json formatter crashes on this tree (a plugin fault inside
# eslint-plugin-react's Components.js), so the count is read from the summary
# line of the default formatter instead.
set -uo pipefail

BASELINE=7

output=$(npm run lint 2>&1)
status=$?
printf '%s\n' "$output"
echo

if [ "$status" -eq 0 ]; then
  errors=0
else
  # Matches the tail of: "✖ 21 problems (8 errors, 13 warnings)"
  errors=$(printf '%s\n' "$output" | sed -n 's/.*(\([0-9][0-9]*\) error[s]*,.*/\1/p' | tail -1)
  if [ -z "$errors" ]; then
    echo "::error::eslint exited $status without a parsable summary line. Treating as a failure."
    exit 1
  fi
fi

echo "eslint errors: ${errors} (baseline: ${BASELINE})"

if [ "$errors" -gt "$BASELINE" ]; then
  echo "::error::This branch adds $((errors - BASELINE)) eslint error(s) on top of the baseline of ${BASELINE}. Fix them before merging."
  exit 1
fi

if [ "$errors" -lt "$BASELINE" ]; then
  echo "::notice::eslint errors are down to ${errors}. Lower BASELINE in .github/scripts/lint-ratchet.sh to ${errors} so the gain is locked in."
fi

echo "No new eslint errors."
