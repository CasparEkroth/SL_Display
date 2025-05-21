#!/usr/bin/env bash
# sl-deps.sh — show next SL departures for a given stop, non-interactive

API="https://transport.integration.sl.se/v1/sites"
LIMIT=5

# 1) Load station list once (CSV → JSON via jq)
fetch_stations(){
  curl -s 'https://raw.githubusercontent.com/thuma/StorstockholmsLokaltrafikAPI/master/sl.csv' \
    | jq -R -s '
        split("\n")
        | map(select(length > 0))
        | map(split(";"))
        | map({ name: .[0], id: .[4] })
    '
}

# 2) Pick the first station whose name contains the query (case-insensitive)
pick_station(){
  local q="$1"
  echo "$STATIONS" \
    | jq -r --arg q "$q" '
        [ .[]
          | select((.name | ascii_downcase)
                   | contains($q | ascii_downcase))
        ]
        | if length > 0
          then .[0].id + "|" + .[0].name
          else ""
          end
    '
}

# 3) Fetch departures for a station ID
fetch_deps(){
  local id="$1"
  curl -s "$API/$id/departures" \
    | jq -r '
        .departures[]
        | "\(.line.id) → \(.destination) in \(.display)"
    '
}

# —— main ——
if [ -z "$1" ]; then
  echo "Usage: $0 <station-name-fragment>"
  exit 1
fi

# load & cache stations
STATIONS=$(fetch_stations)

# pick the best match
IFS="|" read SITE_ID SITE_NAME <<< "$(pick_station "$1")"
if [ -z "$SITE_ID" ]; then
  echo "No matching station found for '$1'." >&2
  exit 1
fi

echo "Next $LIMIT departures for $SITE_NAME (ID $SITE_ID):"
fetch_deps "$SITE_ID" | head -n $LIMIT
