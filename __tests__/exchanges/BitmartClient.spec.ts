import { testClient } from "../TestRunner";
import { BitmartClient } from "../../src/exchanges/BitmartClient";
import * as https from "../../src/Https";

testClient({
    clientFactory: () => new BitmartClient(),
    clientName: "BitmartClient",
    exchangeName: "Bitmart",
    markets: [
        {
            id: "BTC_USDT",
            base: "BTC",
            quote: "USDT",
        },
        {
            id: "ETH_USDT",
            base: "ETH",
            quote: "USDT",
        },
    ],

    async fetchAllMarkets() {
        const res: any = await https.get("https://api-cloud.bitmart.com/spot/v1/symbols");
        return res.data.symbols.map(p => ({
            id: p,
            base: p.split("_")[0],
            quote: p.split("_")[1],
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
        hasVolume: false,
        hasQuoteVolume: true,
        hasChange: true,
        hasChangePercent: true,
        hasAsk: true,
        hasBid: true,
        hasAskVolume: false,
        hasBidVolume: false,
    },

    trade: {
        hasTradeId: false,
        //tradeIdPattern: /[0-9]+/,
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
