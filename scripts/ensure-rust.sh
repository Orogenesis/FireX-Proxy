#!/usr/bin/env bash
set -euo pipefail

if command -v cargo >/dev/null 2>&1 && command -v rustc >/dev/null 2>&1; then
  echo "Rust toolchain found: $(rustc --version)"
  if command -v rustup >/dev/null 2>&1 && ! cargo fmt --version >/dev/null 2>&1; then
    echo "Installing rustfmt..."
    rustup component add rustfmt
  fi
  exit 0
fi

if command -v rustup >/dev/null 2>&1; then
  echo "Rustup found. Installing the stable Rust toolchain..."
  rustup toolchain install stable --profile minimal
  rustup default stable
  rustup component add rustfmt
  exit 0
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "Rust is not installed and curl is not available." >&2
  echo "Install Rust manually from https://rustup.rs/ and rerun this command." >&2
  exit 1
fi

echo "Rust is not installed. Installing Rust with rustup..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable

if [[ -f "$HOME/.cargo/env" ]]; then
  # shellcheck disable=SC1091
  source "$HOME/.cargo/env"
fi

cargo --version
rustc --version
rustup component add rustfmt
