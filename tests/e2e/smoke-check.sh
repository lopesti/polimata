#!/usr/bin/env bash
# Smoke HTTP checks against running server (default localhost:3000)
BASE="${1:-http://localhost:3000}"
set -e
echo "Health..."
curl -sf "$BASE/api/health" | head -c 200
echo
echo "Busca..."
curl -sf "$BASE/api/busca?q=sistema" | head -c 200
echo
echo "Stats FSRS..."
curl -sf "$BASE/api/revisao/stats" | head -c 200
echo
echo "OK smoke"
