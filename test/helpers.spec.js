import { isMajorVersion, isMinorVersion, versionCompare } from "../addon/helpers";
import { assert } from "chai"

describe("helpers", () => {
    describe("versionCompare", () => {
        it('should return -1 when a < b', () => {
            assert.equal(versionCompare('4.3.2', '4.3.4'), -1);
        });

        it('should return 0 when a == b', () => {
            assert.equal(versionCompare('4.3.4', '4.3.4'), 0);
        });

        it('should return 1 when a > b', () => {
            assert.equal(versionCompare('4.3.5', '4.3.4'), 1);
        });
    });

    describe("isMajorVersion", () => {
        it('should return true when pass one digit', () => {
            assert.isTrue(isMajorVersion("1"));
        });

        it('should return true only when digits after major digit equal zero', () => {
            assert.isTrue(isMajorVersion("1.0"));
            assert.isFalse(isMajorVersion("1.1"));

            assert.isTrue(isMajorVersion("1.0.0"));
            assert.isFalse(isMajorVersion("1.0.1"));
            assert.isFalse(isMajorVersion("1.1.1"));
        });
    });

    describe("isMinorVersion", () => {
        it('should return false when pass one digit', () => {
            assert.isFalse(isMinorVersion("1"));
        });

        it('should return true only when digits after minor digit equal zero', () => {
            assert.isTrue(isMinorVersion("0.1"));
            assert.isFalse(isMinorVersion("1.0"));

            assert.isTrue(isMinorVersion("1.1.0"));
            assert.isFalse(isMinorVersion("1.0.0"));
            assert.isFalse(isMinorVersion("1.1.1"));
        });
    });
});
