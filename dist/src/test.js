"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const index_1 = __importDefault(require("./index"));
// crypto.com
const market = {
    id: "sgb_usdt",
    base: "SGB",
    quote: "USDT",
};
const client = new index_1.default.Zb();
//////////////////////////////////
let counter = 0;
client.subscribeTicker(market);
client.on("ticker", ({ last, ask, bid }) => console.log({ last, ask, bid }, counter++));
// client.subscribeTrades(market);
// client.on("trade", t => console.log(t));
// client.subscribeLevel2Snapshots(market);
// client.on("l2snapshot", console.log);
// client.subscribeLevel2Updates(market);
// client.on("l2update", console.log)
//# sourceMappingURL=test.js.map