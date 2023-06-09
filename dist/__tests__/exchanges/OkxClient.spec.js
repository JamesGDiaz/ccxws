"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../TestRunner");
const OkxClient_1 = require("../../src/exchanges/OkxClient");
const Https_1 = require("../../src/Https");
const assertions = {
    hasTickers: true,
    hasTrades: true,
    hasCandles: true,
    hasLevel2Snapshots: true,
    hasLevel2Updates: true,
    hasLevel3Snapshots: false,
    hasLevel3Updates: false,
    ticker: {
        hasTimestamp: true,
        hasLast: true,
        hasOpen: true,
        hasHigh: true,
        hasLow: true,
        hasVolume: true,
        hasQuoteVolume: false,
        hasChange: true,
        hasChangePercent: true,
        hasAsk: true,
        hasBid: true,
        hasAskVolume: true,
        hasBidVolume: true,
    },
    trade: {
        hasTradeId: true,
    },
    candle: {},
    l2snapshot: {
        hasTimestampMs: true,
        hasSequenceId: false,
        hasCount: true,
        hasChecksum: true,
    },
    l2update: {
        hasSnapshot: true,
        hasTimestampMs: true,
        hasSequenceId: false,
        hasCount: true,
        hasChecksum: true,
    },
};
TestRunner_1.testClient({
    clientFactory: () => new OkxClient_1.OkxClient(),
    exchangeName: "OKX",
    clientName: "OKXClient - Spot",
    markets: [
        {
            id: "BTC-USDT",
            base: "BTC",
            quote: "USDT",
        },
        {
            id: "ETH-BTC",
            base: "ETH",
            quote: "BTC",
        },
    ],
    testConnectEvents: true,
    testDisconnectEvents: true,
    testReconnectionEvents: true,
    testCloseEvents: true,
    ...assertions,
});
TestRunner_1.testClient({
    clientFactory: () => new OkxClient_1.OkxClient(),
    exchangeName: "OKX",
    clientName: "OKXClient - Futures",
    fetchMarkets: async () => {
        const results = await Https_1.get("https://www.okx.com/api/futures/v3/instruments");
        return results
            .filter(p => p.base_currency === "BTC")
            .map(p => ({
            id: p.instrument_id,
            base: p.base_currency,
            quote: p.quote_currency,
            type: "futures",
        }));
    },
    ...assertions,
});
TestRunner_1.testClient({
    clientFactory: () => new OkxClient_1.OkxClient(),
    exchangeName: "OKX",
    clientName: "OKXClient - Swap",
    fetchMarkets: async () => {
        const results = await Https_1.get("https://www.okx.com/api/swap/v3/instruments");
        return results
            .filter(p => ["BTC", "ETH", "LTC"].includes(p.base_currency))
            .map(p => ({
            id: p.instrument_id,
            base: p.base_currency,
            quote: p.quote_currency,
            type: "swap",
        }));
    },
    ...assertions,
});
TestRunner_1.testClient({
    clientFactory: () => new OkxClient_1.OkxClient(),
    exchangeName: "OKX",
    clientName: "OKXClient - Options",
    fetchMarkets: async () => {
        const results = await Https_1.get("https://www.okx.com/api/option/v3/instruments/BTC-USD");
        return results
            .map(p => ({
            id: p.instrument_id,
            base: p.base_currency,
            quote: p.quote_currency,
            type: "option",
        }))
            .filter(p => p.id.endsWith("-C"))
            .slice(0, 20);
    },
    ...assertions,
});
//# sourceMappingURL=OkxClient.spec.js.map