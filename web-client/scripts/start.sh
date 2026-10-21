#!/usr/bin/env bash
set -ex

MODE=${1:---dev}

if [ "$MODE" == "--dev" ]; then
    deno run -A npm:vite dev
else
    deno run -A npm:vite build
    deno run -A npm:vite preview --host
fi
