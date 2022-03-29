"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const BitrueClient_1 = require("../../src/exchanges/BitrueClient");
const https = __importStar(require("../../src/Https"));
(0, TestRunner_1.testClient)({
    clientFactory: () => new BitrueClient_1.BitrueClient(),
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
        const res = await https.get("https://openapi.bitrue.com/api/v1/exchangeInfo");
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
//# sourceMappingURL=BitrueClient.spec.js.map