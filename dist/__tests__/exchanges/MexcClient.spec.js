"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../TestRunner");
const src_1 = require("../../src");
const https = __importStar(require("../../src/Https"));
TestRunner_1.testClient({
    clientFactory: () => new src_1.MexcClient(),
    clientName: "MexcClient",
    exchangeName: "Mexc",
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
        const res = await https.get("https://www.mexc.com/open/api/v2/market/symbols");
        return res.data.map(p => ({
            id: p.symbol,
            base: p.vcoinName,
            quote: p.symbol.split("_")[1],
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
        hasOpen: false,
        hasHigh: false,
        hasLow: false,
        hasVolume: false,
        hasQuoteVolume: false,
        hasChange: false,
        hasChangePercent: false,
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
//# sourceMappingURL=MexcClient.spec.js.map