#!/usr/bin/env bash

set -ex

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Run component test scripts in accordance with Agents.md
"$ROOT_DIR/bank-statement/scripts/test.sh"
"$ROOT_DIR/lib/scripts/test.sh"
"$ROOT_DIR/server/scripts/test.sh"
"$ROOT_DIR/web-client/scripts/test.sh"
