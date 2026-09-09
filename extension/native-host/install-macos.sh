#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: native-host/install-macos.sh EXTENSION_ID" >&2
  exit 1
fi

HOST_NAME="com.browser_companion.codex_bridge"
EXTENSION_ID="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE_PATH="$SCRIPT_DIR/bridge.js"
MANIFEST_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
MANIFEST_PATH="$MANIFEST_DIR/$HOST_NAME.json"
LAUNCHER_PATH="$SCRIPT_DIR/bridge-launcher-macos.sh"
NODE_PATH="$(command -v node || true)"
CODEX_PATH="$(command -v codex || true)"

if [[ -z "$NODE_PATH" ]]; then
  echo "node was not found on PATH." >&2
  exit 1
fi

if [[ -z "$CODEX_PATH" ]]; then
  CODEX_PATH="codex"
  echo "Warning: codex was not found on PATH. The bridge was registered, but Codex calls may fail." >&2
fi

cat > "$LAUNCHER_PATH" <<EOF
#!/usr/bin/env bash
export CODEX_BIN="$CODEX_PATH"
exec "$NODE_PATH" "$BRIDGE_PATH"
EOF
chmod +x "$LAUNCHER_PATH"

mkdir -p "$MANIFEST_DIR"
cat > "$MANIFEST_PATH" <<EOF
{
  "name": "$HOST_NAME",
  "description": "Browser Companion local Codex bridge",
  "path": "$LAUNCHER_PATH",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://$EXTENSION_ID/"
  ]
}
EOF

echo "WalletOS native host registered for Chrome extension $EXTENSION_ID"
echo "Manifest: $MANIFEST_PATH"
echo "Launcher: $LAUNCHER_PATH"
echo "Node: $NODE_PATH"
echo "Codex: $CODEX_PATH"
