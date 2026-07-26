# FireX Proxy

FireX Proxy is a Chrome and Firefox proxy switcher for HTTP and SOCKS endpoints. It keeps a local proxy list, can refresh that list from plain-text sources, applies browser-native bypass rules, and can filter dead proxies with the native `firex-checker` companion app. [Learn more about the checker](#native-proxy-checker).

FireX Proxy has been around for more than ten years and, at one point, reached millions of users. The original hosted infrastructure behind FireX Proxy is no longer running. The project has moved to a serverless, independent model. The extension does not depend on FireX Proxy servers, does not require an account and works with local data plus user-configured proxy sources.

What it does:

- add HTTP, HTTPS, SOCKS4, and SOCKS5 proxies manually
- sync proxies from one or more remote text files
- keep the repository proxy source fresh with a scheduled GitHub Actions updater
- determine which proxies are working and measure latency with the optional Rust `firex-checker` companion app
- keep native bypass rules for hosts that should not use the proxy
- build for Chrome/Chromium and Firefox from the same codebase

## Proxy Source Format

The default source file is [`proxies.txt`](./proxies.txt).

Each proxy is one line:

```txt
protocol://host:port # optional display name
```

Supported protocols:

```txt
http
https
socks4
socks5
```

Blank lines and lines starting with `#` are ignored.

Example:

```txt
http://198.51.100.10:8080 # Demo HTTP
socks5://198.51.100.13:1080 # Demo SOCKS5
```

## Development

Install dependencies:

```sh
npm install
```

Run the extension in development mode:

```sh
make dev
```

Run Firefox development mode:

```sh
make dev-firefox
```

Build production bundles:

```sh
make build-chrome
make build-firefox
```

Generated extensions are written to `dist/`.

## Updating `proxies.txt`

The proxy source file can be regenerated locally:

```sh
make update-proxies
```

For a quick preview without writing the file:

```sh
npm run update:proxies -- --dry-run --limit 20
```

The updater fetches public protocol-specific proxy feeds, normalizes them into FireX Proxy's source format, removes duplicates, and filters obvious non-routable/private addresses.

GitHub Actions runs the updater every six hours, at minute 17 UTC, and commits `proxies.txt` when the generated file changes.

## Native Proxy Checker

Public proxy lists age quickly. A list can contain thousands of endpoints, but many of them are already dead, blocked, overloaded, or too slow by the time the browser sees them. The browser extension itself cannot do a thorough check through every proxy: extension APIs are limited, and browser network requests are not a good place to run thousands of concurrent proxy probes.

FireX Proxy handles that with an optional Rust companion app called `firex-checker`. It runs on the user's computer, tests candidate proxies directly, measures response time, stops when it finds enough working proxies, and reports progress back to the extension UI.

When the checker is not installed, the extension still works as a normal proxy switcher. It can add proxies, sync sources, connect, disconnect, and apply bypass rules. The checker is recommended because most public proxies do not stay usable for long.

Checker release metadata lives in [`checker-manifest.json`](./checker-manifest.json). `latestVersion` tells the extension that an update is available. `minimumVersion` is the oldest checker version the current extension should still trust; raise it when compatibility actually changes.

To sync the manifest from the Rust crate version:

```sh
make checker-manifest
```

To release a new checker version:

```sh
make checker-release VERSION=0.1.2
```

That command updates the Rust crate version, refreshes `Cargo.lock`, syncs `checker-manifest.json`, commits those version files, creates a `checker-v0.1.2` tag, and pushes the branch and tag. Branch pushes only run the lightweight manifest sync job. The checker tag starts the installer builds and publishes the native checker release assets.

To uninstall the `firex-checker`:

```sh
sudo make checker-uninstall
```
