import { testClient } from "../TestRunner";
import { CryptoComClient } from "../../src/exchanges/CryptoComClient";
import * as https from "../../src/Https";

testClient({
    clientFactory: () => new CryptoComClient(),
    clientName: "CryptoComClient",
    exchangeName: "CryptoCom",
    markets: [
        {
            id: "ETH_USDT",
            base: "ETH",
            quote: "USDT",
        },
        {
            id: "BTC_USDT",
            base: "ETH",
            quote: "USDT",
        },
    ],

    async fetchAllMarkets() {
        const res: any = await https.get("https://api.crypto.com/v2/public/get-instruments");
        return res.result.instruments.map(p => ({
            id: p.instrument_name,
            base: p.base_currency,
            quote: p.quote_currency,
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
        hasQuoteVolume: false,
        hasChange: true,
        hasChangePercent: true,
        hasAsk: true,
        hasBid: true,
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
