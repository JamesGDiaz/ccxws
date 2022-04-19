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
const CryptoComClient_1 = require("../../src/exchanges/CryptoComClient");
const https = __importStar(require("../../src/Https"));
(0, TestRunner_1.testClient)({
    clientFactory: () => new CryptoComClient_1.CryptoComClient(),
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
        const res = await https.get("https://api.crypto.com/v2/public/get-instruments");
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
//# sourceMappingURL=CryptoComClient.spec.js.map