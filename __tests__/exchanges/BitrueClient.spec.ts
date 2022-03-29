import { testClient } from "../TestRunner";
import { BitrueClient } from "../../src/exchanges/BitrueClient";
import * as https from "../../src/Https";

testClient({
    clientFactory: () => new BitrueClient(),
    clientName: "BitrueClient",
    exchangeName: "Bitrue",
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
        const res: any = await https.get("https://openapi.bitrue.com/api/v1/exchangeInfo");
        return res.symbols.map(p => ({
            id: p.symbol,
            base: p.baseAsset,
            quote: p.quoteAsset,
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
        hasAsk: false,
        hasBid: false,
        hasAskVolume: false,
        hasBidVolume: false,
    },

    trade: {
        hasTradeId: true,
        tradeIdPattern: /[0-9]+/,
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
