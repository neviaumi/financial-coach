#!/usr/bin/env bash
set -ex

MODE=${1:---dev}

if [ "$MODE" == "--dev" ]; then
    npx vp dev --host
else
    npx vp build
    npx vp preview --host
fi
