#!/usr/bin/env bash
set -euo pipefail

HOST_NAME="com.firexproxy.checker"
REMOVE_SYSTEM="false"
REMOVE_BUILD="true"
FOUND_SYSTEM_FILES="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --system)
      REMOVE_SYSTEM="true"
      shift
      ;;
    --keep-build)
      REMOVE_BUILD="false"
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ "$REMOVE_SYSTEM" == "true" ]] && [[ "${EUID:-$(id -u)}" -ne 0 ]] && ! sudo -n true 2>/dev/null; then
  echo "System uninstall needs sudo access." >&2
  echo "Run this from an interactive terminal:" >&2
  echo "  make checker-uninstall" >&2
  exit 1
fi

remove_file() {
  local path="$1"

  if [[ -e "$path" ]]; then
    rm -f "$path"
    echo "Removed $path"
  fi
}

remove_system_file() {
  local path="$1"

  if [[ -e "$path" ]]; then
    sudo rm -f "$path"
    echo "Removed $path"
  fi
}

forget_macos_package() {
  if pkgutil --pkg-info "$HOST_NAME" >/dev/null 2>&1; then
    sudo pkgutil --forget "$HOST_NAME" >/dev/null
    echo "Forgot macOS package receipt $HOST_NAME"
  fi
}

warn_if_present() {
  local path="$1"

  if [[ -e "$path" ]]; then
    echo "Still present: $path" >&2
    FOUND_SYSTEM_FILES="true"
  fi
}

case "$(uname -s)" in
  Darwin)
    remove_file "$HOME/Library/Application Support/Mozilla/NativeMessagingHosts/$HOST_NAME.json"
    remove_file "$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts/$HOST_NAME.json"
    remove_file "$HOME/Library/Application Support/Chromium/NativeMessagingHosts/$HOST_NAME.json"

    if [[ "$REMOVE_SYSTEM" == "true" ]]; then
      remove_system_file "/usr/local/bin/firex-checker"
      remove_system_file "/Library/Application Support/Mozilla/NativeMessagingHosts/$HOST_NAME.json"
      remove_system_file "/Library/Google/Chrome/NativeMessagingHosts/$HOST_NAME.json"
      remove_system_file "/Library/Application Support/Chromium/NativeMessagingHosts/$HOST_NAME.json"
      remove_system_file "/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts/$HOST_NAME.json"
      remove_system_file "/Library/Application Support/Microsoft Edge/NativeMessagingHosts/$HOST_NAME.json"
      remove_system_file "/Library/Application Support/Vivaldi/NativeMessagingHosts/$HOST_NAME.json"
      remove_system_file "/Library/Application Support/com.operasoftware.Opera/NativeMessagingHosts/$HOST_NAME.json"
      remove_system_file "/Library/Application Support/Arc/User Data/NativeMessagingHosts/$HOST_NAME.json"
      forget_macos_package
    else
      warn_if_present "/usr/local/bin/firex-checker"
      warn_if_present "/Library/Application Support/Mozilla/NativeMessagingHosts/$HOST_NAME.json"
      warn_if_present "/Library/Google/Chrome/NativeMessagingHosts/$HOST_NAME.json"
      warn_if_present "/Library/Application Support/Chromium/NativeMessagingHosts/$HOST_NAME.json"
      warn_if_present "/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts/$HOST_NAME.json"
      warn_if_present "/Library/Application Support/Microsoft Edge/NativeMessagingHosts/$HOST_NAME.json"
      warn_if_present "/Library/Application Support/Vivaldi/NativeMessagingHosts/$HOST_NAME.json"
      warn_if_present "/Library/Application Support/com.operasoftware.Opera/NativeMessagingHosts/$HOST_NAME.json"
      warn_if_present "/Library/Application Support/Arc/User Data/NativeMessagingHosts/$HOST_NAME.json"
    fi
    ;;
  Linux)
    remove_file "$HOME/.mozilla/native-messaging-hosts/$HOST_NAME.json"
    remove_file "$HOME/.config/google-chrome/NativeMessagingHosts/$HOST_NAME.json"
    remove_file "$HOME/.config/chromium/NativeMessagingHosts/$HOST_NAME.json"

    if [[ "$REMOVE_SYSTEM" == "true" ]]; then
      remove_system_file "/usr/bin/firex-checker"
      remove_system_file "/usr/lib/mozilla/native-messaging-hosts/$HOST_NAME.json"
      remove_system_file "/etc/opt/chrome/native-messaging-hosts/$HOST_NAME.json"
      remove_system_file "/etc/chromium/native-messaging-hosts/$HOST_NAME.json"
    else
      warn_if_present "/usr/bin/firex-checker"
      warn_if_present "/usr/lib/mozilla/native-messaging-hosts/$HOST_NAME.json"
      warn_if_present "/etc/opt/chrome/native-messaging-hosts/$HOST_NAME.json"
      warn_if_present "/etc/chromium/native-messaging-hosts/$HOST_NAME.json"
    fi
    ;;
  *)
    echo "This uninstaller supports macOS and Linux. Windows release zips include uninstall.ps1." >&2
    exit 1
    ;;
esac

if [[ "$REMOVE_BUILD" == "true" ]]; then
  remove_file "$ROOT_DIR/native/firex-checker/target/release/firex-checker"
fi

if [[ "$FOUND_SYSTEM_FILES" == "true" ]]; then
  echo "Per-user native checker files were removed, but system files are still installed." >&2
  echo "Run this from an interactive terminal to remove them:" >&2
  echo "  make checker-uninstall" >&2
  exit 1
fi

echo "Native checker uninstalled. Restart the browser or reload the extension."
