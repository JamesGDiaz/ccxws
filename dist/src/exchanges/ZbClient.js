"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZbClient = void 0;
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const BasicClient_1 = require("../BasicClient");
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const NotImplementedFn_1 = require("../NotImplementedFn");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
const fast_deep_equal_1 = __importDefault(require("fast-deep-equal"));
class ZbClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://api.zb.com/websocket", watcherMs } = {}) {
        super(wssPath, "ZB", undefined, watcherMs);
        this._tickerCache = new Map();
        this._sendSubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel2Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel2Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasLevel2Snapshots = true;
        this.remoteIdMap = new Map();
    }
    _sendSubTicker(remote_id) {
        const wss_remote_id = remote_id.replace(/_/, "");
        this.remoteIdMap.set(wss_remote_id, remote_id);
        this._wss.send(JSON.stringify({
            event: "addChannel",
            channel: `${wss_remote_id}_ticker`,
        }));
    }
    _sendUnsubTicker(remote_id) {
        const wss_remote_id = remote_id.replace(/_/, "");
        this.remoteIdMap.set(wss_remote_id, remote_id);
        this._wss.send(JSON.stringify({
            event: "removeChannel",
            channel: `${wss_remote_id}_ticker`,
        }));
    }
    _sendSubTrades(remote_id) {
        const wss_remote_id = remote_id.replace(/_/, "");
        this.remoteIdMap.set(wss_remote_id, remote_id);
        this._wss.send(JSON.stringify({
            event: "addChannel",
            channel: `${wss_remote_id}_trades`,
        }));
    }
    _sendUnsubTrades(remote_id) {
        const wss_remote_id = remote_id.replace(/_/, "");
        this.remoteIdMap.set(wss_remote_id, remote_id);
        this._wss.send(JSON.stringify({
            event: "removeChannel",
            channel: `${wss_remote_id}_trades`,
        }));
    }
    _sendSubLevel2Snapshots(remote_id) {
        const wss_remote_id = remote_id.replace(/_/, "");
        this.remoteIdMap.set(wss_remote_id, remote_id);
        this._wss.send(JSON.stringify({
            event: "addChannel",
            channel: `${wss_remote_id}_depth`,
        }));
    }
    _sendUnsubLevel2Snapshots(remote_id) {
        const wss_remote_id = remote_id.replace(/_/, "");
        this.remoteIdMap.set(wss_remote_id, remote_id);
        this._wss.send(JSON.stringify({
            event: "removeChannel",
            channel: `${wss_remote_id}_depth`,
        }));
    }
    _onMessage(raw) {
        const msg = JSON.parse(raw);
        const [wssRemoteId, type] = msg.channel.split("_");
        const remoteId = this.remoteIdMap.get(wssRemoteId);
        // prevent errors from crashing the party
        if (msg.success === false) {
            return;
        }
        // tickers
        if (type === "ticker") {
            const market = this._tickerSubs.get(remoteId);
            if (!market)
                return;
            this._constructTicker(msg, market);
            return;
        }
        // trades
        if (type === "trades") {
            for (const datum of msg.data) {
                const market = this._tradeSubs.get(remoteId);
                if (!market)
                    continue;
                const trade = this._constructTradesFromMessage(datum, market);
                this.emit("trade", trade, market);
            }
            return;
        }
        // level2snapshots
        if (type === "depth") {
            const market = this._level2SnapshotSubs.get(remoteId);
            if (!market)
                return;
            const snapshot = this._constructLevel2Snapshot(msg, market);
            this.emit("l2snapshot", snapshot, market);
            return;
        }
    }
    _constructTicker(data, market) {
        const { last, high, low, vol, buy, sell } = data.ticker;
        if (!this._tickerCache.has(market.id)) {
            this._tickerCache.set(market.id, { last, buy, sell });
        }
        const lastTicker = this._tickerCache.get(market.id);
        const thisTicker = { last, buy, sell };
        if (fast_deep_equal_1.default(lastTicker, thisTicker))
            return;
        this._tickerCache.set(market.id, thisTicker);
        const timestamp = parseInt(data.date);
        const ticker = new Ticker_1.Ticker({
            exchange: "ZB",
            base: market.base,
            quote: market.quote,
            timestamp,
            last: last,
            open: undefined,
            high: high,
            low: low,
            volume: vol,
            quoteVolume: undefined,
            change: undefined,
            changePercent: undefined,
            bid: buy,
            ask: sell,
        });
        this.emit("ticker", ticker, market);
    }
    _constructTradesFromMessage(datum, market) {
        const { date, price, amount, tid, type } = datum;
        return new Trade_1.Trade({
            exchange: "ZB",
            base: market.base,
            quote: market.quote,
            tradeId: tid.toString(),
            side: type,
            unix: parseInt(date) * 1000,
            price,
            amount,
        });
    }
    _constructLevel2Snapshot(msg, market) {
        let { timestamp, asks, bids } = msg;
        asks = asks.map(p => new Level2Point_1.Level2Point(p[0].toFixed(8), p[1].toFixed(8))).reverse();
        bids = bids.map(p => new Level2Point_1.Level2Point(p[0].toFixed(8), p[1].toFixed(8)));
        return new Level2Snapshots_1.Level2Snapshot({
            exchange: "ZB",
            base: market.base,
            quote: market.quote,
            timestampMs: timestamp * 1000,
            asks,
            bids,
        });
    }
}
exports.ZbClient = ZbClient;
//# sourceMappingURL=ZbClient.js.map