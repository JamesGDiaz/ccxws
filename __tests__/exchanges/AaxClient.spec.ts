import { testClient } from "../TestRunner";
import { AaxClient } from "../../src/exchanges/AaxClient";
import * as https from "../../src/Https";

testClient({
    clientFactory: () => new AaxClient(),
    clientName: "AaxClient",
    exchangeName: "AAX",
    markets: [
        {
            id: "BTCUSDT",
            base: "BTC",
            quote: "USDT",
        },
        {
            id: "ETHUSDT",
            base: "ETH",
            quote: "USDT",
        },
        {
            id: "BTCUSDC",
            base: "BTC",
            quote: "USDC",
        },
        {
            id: "ETHUSDC",
            base: "ETH",
            quote: "USDC",
        },
    ],

    async fetchAllMarkets() {
        const res: any = await https.get("https://api.aax.com/v2/instruments");
        return res.data.map(p => ({
            id: p.symbol,
            base: p.base,
            quote: p.quote,
        }));
    },

    testConnectEvents: false,
    testDisconnectEvents: false,
    testReconnectionEvents: false,
    testCloseEvents: false,

    testAllMarketsTrades: false,

    hasTickers: true,
    hasTrades: false,
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
    },
});
