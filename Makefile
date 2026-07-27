UNAME_S := $(shell uname -s)
UNAME_M := $(shell uname -m)
PACKAGE_OS := $(if $(filter Darwin,$(UNAME_S)),macos,$(if $(filter Linux,$(UNAME_S)),linux,unsupported))
PACKAGE_ARCH := $(if $(filter x86_64 amd64,$(UNAME_M)),x64,$(if $(filter arm64 aarch64,$(UNAME_M)),arm64,$(UNAME_M)))
NATIVE_BINARY := native/firex-native/target/release/firex-native

.PHONY: dev dev-firefox build build-chrome build-firefox rust-deps native-build native-manifest native-release native-uninstall native-check-file native-package update-proxies zip zip-chrome zip-firefox clean

dev:
	npm run dev

dev-firefox:
	npm run dev:firefox

build:
	npm run build

build-chrome:
	npm run build:chrome

build-firefox:
	npm run build:firefox

rust-deps:
	scripts/ensure-rust.sh

native-build: rust-deps
	npm run native:build

native-manifest:
	npm run native:manifest

native-release: rust-deps
	npm run native:release -- $(VERSION)

native-uninstall:
	npm run native:uninstall -- --system

native-check-file: rust-deps
	npm run native:check-file

native-package: native-build
	npm run native:package -- --os $(PACKAGE_OS) --arch $(PACKAGE_ARCH) --binary $(NATIVE_BINARY)

update-proxies:
	npm run update:proxies

zip:
	npm run zip

zip-chrome:
	npm run zip:chrome

zip-firefox:
	npm run zip:firefox

clean:
	npm run clean
