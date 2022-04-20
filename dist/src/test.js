"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
// FTX
const market = {
    id: "BTC/USD",
    base: "BTC",
    quote: "USD",
};
const client = new index_1.default.Ftx();
//////////////////////////////////
let counter = 0;
client.subscribeTicker(market);
client.on("ticker", () => console.log(counter++));
// client.subscribeTrades(market);
// client.on("trade", t => console.log(t));
// client.subscribeLevel2Snapshots(market);
// client.on("l2snapshot", console.log);
// client.subscribeLevel2Updates(market);
// client.on("l2update", console.log)
//# sourceMappingURL=test.js.map