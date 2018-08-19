import { versionCompare } from "../addon/helpers";
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
});
