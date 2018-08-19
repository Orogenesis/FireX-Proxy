import { Addresses } from "../addon/addresses";
import { Address } from "../addon/address";
import { expect } from "chai"

describe("addresses", () => {
    describe("unique", () => {
        it('should return unique proxies', () => {
            let addresses = (new Addresses())
                .create([
                    (new Address())
                        .setIPAddress('127.0.0.1')
                        .setPort(8080),
                    (new Address())
                        .setIPAddress('127.0.0.1')
                        .setPort(7070),
                    (new Address())
                        .setIPAddress('127.0.0.1')
                        .setPort(8080)
                ])
                .unique();

            let expected = (new Addresses())
                .create([
                    (new Address())
                        .setIPAddress('127.0.0.1')
                        .setPort(8080),
                    (new Address())
                        .setIPAddress('127.0.0.1')
                        .setPort(7070)
                ]);

            expect(expected).to.deep.equal(addresses);
        });
    });

    describe("union", () => {
        it('should return union proxies', () => {
            let addresses = (new Addresses())
                .create([
                    (new Address())
                        .setIPAddress('127.0.0.1')
                        .setPort(8080),
                    (new Address())
                        .setIPAddress('127.0.0.1')
                        .setPort(9090),
                    (new Address())
                        .setIPAddress('127.0.0.1')
                        .setPort(1010)
                        .setActiveState(false)
                ])
                .union(
                    (new Addresses())
                        .create([
                            (new Address())
                                .setIPAddress('127.0.0.1')
                                .setPort(6060),
                            (new Address())
                                .setIPAddress('127.0.0.1')
                                .setPort(9090),
                            (new Address())
                                .setIPAddress('127.0.0.1')
                                .setPort(1010)
                                .setActiveState(true)
                        ])
                );

            let expected = [];

            expect(expected).to.deep.equal(addresses);
        });
    });
});
