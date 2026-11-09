#!/usr/bin/env bash
# Builds a static, click-through preview of the shop (no checkout, no API) into ./demo-out.
# Useful for showing the design to someone before the real shop is live.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
for f in "$ROOT"/* "$ROOT"/.[!.]*; do
  case "$(basename "$f")" in node_modules|.next|out|demo-out|test-output|.git) ;; *) cp -r "$f" "$TMP/" ;; esac
done
ln -s "$ROOT/node_modules" "$TMP/node_modules"
rm -rf "$TMP/app/api"
(cd "$TMP" && DEMO_EXPORT=1 NEXT_PUBLIC_DEMO=1 NEXT_TELEMETRY_DISABLED=1 npx next build)
rm -rf "$ROOT/demo-out" && cp -r "$TMP/out" "$ROOT/demo-out"
rm -rf "$TMP"
echo "Static preview written to demo-out/"
