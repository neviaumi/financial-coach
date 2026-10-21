#!/usr/bin/env bash
set -ex

MODE=${1:---dev}

if [ "$MODE" == "--dev" ]; then
    node --watch ./main.ts
else
    node ./main.ts
fi
