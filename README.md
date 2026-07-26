# FireX Proxy

FireX Proxy is a lightweight Chrome and Firefox proxy switcher for HTTP and SOCKS endpoints. It keeps manual proxies, refreshes lists from plain-text sources, and applies browser-native bypass rules when a proxy is active.

The current version is intentionally simple:

- add HTTP, HTTPS, SOCKS4, and SOCKS5 proxies manually
- sync proxies from one or more text files
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

GitHub Actions also runs the updater on a schedule and commits `proxies.txt` when the generated file changes.
