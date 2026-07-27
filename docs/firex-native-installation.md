# Installing firex-native

`firex-native` is the native companion app used by FireX Proxy to test proxy availability on your computer. The browser extension works without it, but proxy health checks and latency measurements require FireX Native.

Download the latest FireX Native package from the FireX Proxy releases page:

https://github.com/Orogenesis/FireX-Proxy/releases/latest

Choose the package for your operating system.

## macOS

Download the matching package:

- Apple Silicon Macs: `firex-native-*-macos-arm64.pkg`
- Intel Macs: `firex-native-*-macos-x64.pkg`

Open the `.pkg` file and follow the installer.

If macOS blocks the package or installed app:

1. Open **System Settings**.
2. Go to **Privacy & Security**.
3. Scroll to the **Security** section.
4. Click **Open Anyway** for `firex-native` or the downloaded package.
5. Confirm with Touch ID, password, or administrator approval.
6. Open the package again if macOS asks you to retry.

After installation, fully quit and reopen the browser. Reloading the extension is not always enough because browsers cache native host registrations.

## Windows

Download `firex-native-*-windows-x64.zip`.

Extract the archive, then run PowerShell from the extracted directory:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

If Windows SmartScreen blocks it, choose **More info**, then **Run anyway**.

After installation, fully close and reopen the browser.

## Linux

Download the package that matches your system.

For Debian or Ubuntu:

```sh
sudo apt install ./firex-native-*-linux-x64.deb
```

For other distributions, use the `.tar.gz` archive and install the binary and native host manifests manually.

After installation, fully close and reopen the browser.

## Updating

Install the newest package from the releases page over the existing installation:

https://github.com/Orogenesis/FireX-Proxy/releases/latest

Then restart the browser.

## Uninstalling

From this repository:

```sh
sudo make native-uninstall
```
