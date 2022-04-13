import { testClient } from "../TestRunner";
import { ByBitClient } from "../../src/exchanges/ByBitClient";
import * as https from "../../src/Https";

testClient({
    clientFactory: () => new ByBitClient(),
    clientName: "ByBitClient",
    exchangeName: "ByBit",
    markets: [
        {
            id: "btcusdt",
            base: "BTC",
            quote: "USDT",
        },
        {
            id: "ethusdt",
            base: "ETH",
            quote: "USDT",
        },
    ],

    async fetchAllMarkets() {
        const res: any = await https.get("https://api.bybit.com/spot/v1/symbols");
        return res.result.map(p => ({
            id: p.name,
            base: p.baseCurrency,
            quote: p.quoteCurrency,
        }));
    },

    testConnectEvents: true,
    testDisconnectEvents: true,
    testReconnectionEvents: true,
    testCloseEvents: true,

    testAllMarketsTrades: true,
    testAllMarketsTradesSuccess: 20,

    hasTickers: true,
    hasTrades: true,
    hasCandles: false,
    hasLevel2Snapshots: false,
    hasLevel2Updates: false,
    hasLevel3Snapshots: false,
    hasLevel3Updates: false,

    ticker: {
        hasTimestamp: true,
        hasLast: true,
        hasOpen: true,
        hasHigh: true,
        hasLow: true,
        hasVolume: true,
        hasQuoteVolume: true,
        hasChange: true,
        hasChangePercent: true,
        hasAsk: true,
        hasBid: true,
        hasAskVolume: false,
        hasBidVolume: false,
        hasSequenceId: false,
    },

    trade: {
        hasTradeId: true,
        tradeIdPattern: /[0-9]+/,
        hasSequenceId: false,
    },

    l2update: {
        hasSnapshot: true,
        hasTimestampMs: false,
        hasSequenceId: false,
        hasCount: false,
    },

    l2snapshot: {
        hasTimestampMs: false,
        hasSequenceId: false,
        hasCount: false,
    },
});
