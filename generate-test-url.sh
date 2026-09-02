#!/usr/bin/env bash

set -euo pipefail

# Generate a signed local URL for the /target/ route.
# Requirements: curl, jq, sha256sum
# Usage:
#   ./scripts/generate-test-url.sh [system_id] [target_id] [form_id] [user] [name]

API_BASE="${API_BASE:-http://localhost}"
APP_BASE="${APP_BASE:-http://localhost}"
AUTH_TOKEN="${AUTH_TOKEN:-devApiToken}"

SYSTEM_ID="${1:-}"
TARGET_ID="${2:-}"
FORM_ID="${3:-}"
USER_VALUE="${4:-test@example.com}"
NAME_VALUE="${5:-Local test place}"

for command_name in curl jq sha256sum; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
done

AUTH="$(printf '%s' "$AUTH_TOKEN" | sha256sum | cut -d' ' -f1)"

api_get() {
  curl --fail --silent --show-error \
    -H "Authorization: $AUTH" \
    "$API_BASE$1"
}

# Select an existing external service point from the database when no IDs were
# supplied. If only one ID was supplied, use it to find the other one.
target_path="/api/ArExternalServicepoint/?format=json"
if [ -n "$SYSTEM_ID" ]; then
  target_path="$target_path&system=$SYSTEM_ID"
fi
if [ -n "$TARGET_ID" ]; then
  target_path="$target_path&external_servicepoint_id=$TARGET_ID"
fi

target_json="$(api_get "$target_path")"
target_count="$(printf '%s' "$target_json" | jq 'length')"
if [ "$target_count" -eq 0 ]; then
  echo "No matching external servicepoint found in the local database." >&2
  exit 1
fi

if [ -z "$TARGET_ID" ]; then
  TARGET_ID="$(printf '%s' "$target_json" | jq -er '.[0].external_servicepoint_id')"
fi
if [ -z "$SYSTEM_ID" ]; then
  SYSTEM_ID="$(printf '%s' "$target_json" | jq -er '.[0].system')"
fi

system_json="$(api_get "/api/ArSystems/?format=json&system_id=$SYSTEM_ID")"
system_count="$(printf '%s' "$system_json" | jq 'length')"
if [ "$system_count" -eq 0 ]; then
  echo "System not found: $SYSTEM_ID" >&2
  exit 1
fi

checksum_secret="$(printf '%s' "$system_json" | jq -er '.[0].checksum_secret')"

forms_json="$(api_get "/api/ArSystemForms/?format=json&system=$SYSTEM_ID")"
if [ -z "$FORM_ID" ]; then
  # Prefer form 1, otherwise use form 0 or the first enabled form.
  FORM_ID="$(printf '%s' "$forms_json" | jq -er 'map(.form | tostring) | if index("1") then "1" elif index("0") then "0" elif length > 0 then .[0] else empty end')" || true
  if [ -z "$FORM_ID" ]; then
    echo "No enabled form found for system $SYSTEM_ID." >&2
    exit 1
  fi
elif ! printf '%s' "$forms_json" | jq -e --arg form "$FORM_ID" 'any(.[]; (.form | tostring) == $form)' >/dev/null; then
  echo "Form $FORM_ID is not enabled for system $SYSTEM_ID." >&2
  echo "Enabled forms:" >&2
  printf '%s' "$forms_json" | jq -r '.[].form' >&2
  exit 1
fi

VALID_UNTIL="${VALID_UNTIL:-$(date -u -d '+1 day' '+%Y-%m-%dT%H:%M:%SZ')}"

checksum_input="$checksum_secret$SYSTEM_ID$TARGET_ID$USER_VALUE$NAME_VALUE$FORM_ID$VALID_UNTIL"
CHECKSUM="$(printf '%s' "$checksum_input" | sha256sum | cut -d' ' -f1)"

# jq performs URL encoding, including for spaces, @, and colons.
url="$(jq -rn \
  --arg base "$APP_BASE/target/" \
  --arg systemId "$SYSTEM_ID" \
  --arg targetId "$TARGET_ID" \
  --arg user "$USER_VALUE" \
  --arg validUntil "$VALID_UNTIL" \
  --arg name "$NAME_VALUE" \
  --arg formId "$FORM_ID" \
  --arg checksum "$CHECKSUM" \
  '$base + "?systemId=" + ($systemId|@uri) + "&targetId=" + ($targetId|@uri) + "&user=" + ($user|@uri) + "&validUntil=" + ($validUntil|@uri) + "&name=" + ($name|@uri) + "&formId=" + ($formId|@uri) + "&checksum=" + ($checksum|@uri)')"

printf '%s\n' "$url"
