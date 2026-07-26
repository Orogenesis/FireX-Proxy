UNAME_S := $(shell uname -s)
UNAME_M := $(shell uname -m)
PACKAGE_OS := $(if $(filter Darwin,$(UNAME_S)),macos,$(if $(filter Linux,$(UNAME_S)),linux,unsupported))
PACKAGE_ARCH := $(if $(filter x86_64 amd64,$(UNAME_M)),x64,$(if $(filter arm64 aarch64,$(UNAME_M)),arm64,$(UNAME_M)))
CHECKER_BINARY := native/firex-checker/target/release/firex-checker

.PHONY: dev dev-firefox build build-chrome build-firefox rust-deps checker-build checker-manifest checker-release checker-uninstall checker-check-file checker-package update-proxies zip zip-chrome zip-firefox clean

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

checker-build: rust-deps
	npm run checker:build

checker-manifest:
	npm run checker:manifest

checker-release: rust-deps
	npm run checker:release -- $(VERSION)

checker-uninstall:
	npm run checker:uninstall -- --system

checker-check-file: rust-deps
	npm run checker:check-file

checker-package: checker-build
	npm run checker:package -- --os $(PACKAGE_OS) --arch $(PACKAGE_ARCH) --binary $(CHECKER_BINARY)

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
