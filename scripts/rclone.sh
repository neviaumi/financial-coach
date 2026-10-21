#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

mkdir -p "${PROJECT_ROOT}/server/config" "${PROJECT_ROOT}/.cache/statements"

TTY_FLAG="-i"
if [ -t 0 ] && [ -t 1 ]; then
  TTY_FLAG="-it"
fi

exec docker run --rm ${TTY_FLAG} \
  --network host \
  -u "$(id -u):$(id -g)" \
  -v "${PROJECT_ROOT}/server/config:/config/rclone" \
  -v "${PROJECT_ROOT}/.cache/statements:/data/statements" \
  rclone/rclone:latest "$@"
