#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <YYYY-MM>" >&2
  exit 1
fi

YEAR_MONTH="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
OUTPUT_DIR="${PROJECT_ROOT}/.cache/statements/Consolidated"
mkdir -p "${OUTPUT_DIR}"

URL="https://finance.home.handy-david.dev/statements/${YEAR_MONTH}"

exec docker run --rm \
  --network host \
  --ipc=host \
  -u "$(id -u):$(id -g)" \
  -v "${OUTPUT_DIR}:/output" \
  mcr.microsoft.com/playwright:latest \
  bash -c '
    CHROME_BIN=$(find /ms-playwright/ -name "chrome" -type f -perm /111 | head -n 1)
    "$CHROME_BIN" \
      --headless=new \
      --no-sandbox \
      --disable-gpu \
      --ignore-certificate-errors \
      --run-all-compositor-stages-before-draw \
      --virtual-time-budget=5000 \
      --print-to-pdf="/output/'"${YEAR_MONTH}"'.pdf" \
      "'"${URL}"'" 2>/dev/null
  '
