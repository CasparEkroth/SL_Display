#!/usr/bin/env bash
# sl-deps.sh — show next SL departures for a given stop, non-interactive

set -euo pipefail
IFS=$'\n\t'

API="https://transport.integration.sl.se/v1/sites"
LIMIT=5

# 1) Pick the first station whose name contains the query (case-insensitive),
#    using the live SL Sites API with expand=true to get correct IDs.
pick_station(){
  local q="$1"
  curl -s "${API}?expand=true" \
    | jq -r --arg q "$q" '
        .[]
        | select(.name
                 | ascii_downcase
                 | contains($q | ascii_downcase))
        | "\(.id)|\(.name)"
    ' \
    | head -n1
}

# 2) Fetch departures for a station ID
fetch_deps(){
  local id="$1"
  curl -s "$API/$id/departures" \
    | jq -r '
        .departures[]
        | "\(.line.id) → \(.destination) in \(.display)"
    '
}

# —— main ——
if [ $# -lt 1 ]; then
  echo "Usage: $0 <station-name-fragment>" >&2
  exit 1
fi

QUERY="$1"

# Lookup the ID|Name
IFS="|" read -r SITE_ID SITE_NAME <<< "$(pick_station "$QUERY")"
if [ -z "$SITE_ID" ]; then
  echo "No matching station found for '$QUERY'." >&2
  exit 1
fi

echo "Next $LIMIT departures for $SITE_NAME (ID $SITE_ID):"
fetch_deps "$SITE_ID" | head -n $LIMIT
