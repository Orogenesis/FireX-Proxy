.PHONY: dev dev-firefox build build-chrome build-firefox update-proxies zip zip-chrome zip-firefox clean

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
