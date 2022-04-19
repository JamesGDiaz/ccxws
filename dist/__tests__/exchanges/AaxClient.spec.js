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
const AaxClient_1 = require("../../src/exchanges/AaxClient");
const https = __importStar(require("../../src/Https"));
(0, TestRunner_1.testClient)({
    clientFactory: () => new AaxClient_1.AaxClient(),
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
        const res = await https.get("https://api.aax.com/v2/instruments");
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
//# sourceMappingURL=AaxClient.spec.js.map