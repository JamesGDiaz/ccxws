import { testClient } from "../TestRunner";
import { BitforexClient } from "../../src/exchanges/BitforexClient";
import * as https from "../../src/Https";

testClient({
    clientFactory: () => new BitforexClient(),
    clientName: "BitforexClient",
    exchangeName: "Bitforex",
    markets: [
        {
            id: "coin-usdc-btc",
            base: "ETH",
            quote: "USDC",
        },
        {
            id: "coin-usdc-eth",
            base: "ETH",
            quote: "USDC",
        },
    ],

    async fetchAllMarkets() {
        const res: any = await https.get("https://api.bitforex.com/api/v1/market/symbols");
        return res.data.map(p => ({
            id: p.symbol,
            base: p.symbol.split("-")[2].toUpperCase(),
            quote: p.symbol.split("-")[1].toUpperCase(),
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
