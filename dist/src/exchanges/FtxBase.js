"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FtxBaseClient = void 0;
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const decimal_js_1 = __importDefault(require("decimal.js"));
const moment = require("moment");
const BasicClient_1 = require("../BasicClient");
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Level2Update_1 = require("../Level2Update");
const NotImplementedFn_1 = require("../NotImplementedFn");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
const fast_deep_equal_1 = __importDefault(require("fast-deep-equal"));
class FtxBaseClient extends BasicClient_1.BasicClient {
    constructor({ name, wssPath, watcherMs }) {
        super(wssPath, name, undefined, watcherMs);
        this._tickerCache = new Map();
        this._sendSubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasLevel2Updates = true;
    }
    _sendSubTicker(market) {
        this._wss.send(JSON.stringify({
            op: "subscribe",
            channel: "ticker",
            market,
        }));
    }
    _sendUnsubTicker(market) {
        this._wss.send(JSON.stringify({
            op: "unsubscribe",
            channel: "ticker",
            market,
        }));
    }
    _sendSubTrades(market) {
        this._wss.send(JSON.stringify({
            op: "subscribe",
            channel: "trades",
            market,
        }));
    }
    _sendUnsubTrades(market) {
        this._wss.send(JSON.stringify({
            op: "unsubscribe",
            channel: "trades",
            market,
        }));
    }
    _sendSubLevel2Updates(market) {
        this._wss.send(JSON.stringify({
            op: "subscribe",
            channel: "orderbook",
            market,
        }));
    }
    _sendUnsubLevel2Updates(market) {
        this._wss.send(JSON.stringify({
            op: "subscribe",
            channel: "orderbook",
            market,
        }));
    }
    _onMessage(raw) {
        const { type, channel, market: symbol, data } = JSON.parse(raw);
        if (!data || !type || !channel || !symbol) {
            return;
        }
        switch (channel) {
            case "ticker": {
                const market = this._tickerSubs.get(symbol);
                if (!market || !market.base || !market.quote) {
                    return;
                }
                this._tickerMessageHandler(data, market);
                break;
            }
            case "trades": {
                const market = this._tradeSubs.get(symbol);
                if (!market || !market.base || !market.quote) {
                    return;
                }
                this._tradesMessageHandler(data, market);
                break;
            }
            case "orderbook": {
                const market = this._level2UpdateSubs.get(symbol);
                if (!market || !market.base || !market.quote || (!data.asks.length && !data.bids.length)) {
                    return;
                }
                this._orderbookMessageHandler(data, market, type);
                break;
            }
        }
    }
    _tickerMessageHandler(data, market) {
        const { last, bid, ask, bidSize: bidVolume, askSize: askVolume } = data;
        if (!this._tickerCache.has(market.id)) {
            this._tickerCache.set(market.id, { last, bid, ask });
        }
        const lastTicker = this._tickerCache.get(market.id);
        const thisTicker = { last, bid, ask };
        if (fast_deep_equal_1.default(lastTicker, thisTicker))
            return;
        this._tickerCache.set(market.id, thisTicker);
        const timestamp = this._timeToTimestampMs(data.time);
        const ticker = new Ticker_1.Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp,
            last: last !== undefined && last !== null ? last.toFixed(8) : undefined,
            bid: bid !== undefined && bid !== null ? bid.toFixed(8) : undefined,
            ask: ask !== undefined && ask !== null ? ask.toFixed(8) : undefined,
            bidVolume: bidVolume !== undefined && bidVolume !== null ? bidVolume.toFixed(8) : undefined,
            askVolume: askVolume !== undefined && askVolume !== null ? askVolume.toFixed(8) : undefined,
        });
        this.emit("ticker", ticker, market);
    }
    _tradesMessageHandler(data, market) {
        for (const entry of data) {
            const { id, price, size, side, time, liquidation } = entry;
            const unix = moment.utc(time).valueOf();
            const trade = new Trade_1.Trade({
                exchange: this.name,
                base: market.base,
                quote: market.quote,
                tradeId: id.toString(),
                side,
                unix,
                price: price.toFixed(8),
                amount: size.toFixed(8),
                liquidation,
            });
            this.emit("trade", trade, market);
        }
    }
    _orderbookMessageHandler(data, market, type) {
        switch (type) {
            case "partial":
                this._orderbookSnapshotEvent(data, market);
                break;
            case "update":
                this._orderbookUpdateEvent(data, market);
                break;
        }
    }
    _orderbookUpdateEvent(data, market) {
        const content = this._orderbookEventContent(data, market);
        const eventData = new Level2Update_1.Level2Update(content);
        this.emit("l2update", eventData, market);
    }
    _orderbookSnapshotEvent(data, market) {
        const content = this._orderbookEventContent(data, market);
        const eventData = new Level2Snapshots_1.Level2Snapshot(content);
        this.emit("l2snapshot", eventData, market);
    }
    _orderbookEventContent(data, market) {
        const { time, asks, bids, checksum } = data;
        const level2PointAsks = asks.map(p => new Level2Point_1.Level2Point(p[0].toFixed(8), p[1].toFixed(8)));
        const level2PointBids = bids.map(p => new Level2Point_1.Level2Point(p[0].toFixed(8), p[1].toFixed(8)));
        const timestampMs = this._timeToTimestampMs(time);
        return {
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestampMs,
            asks: level2PointAsks,
            bids: level2PointBids,
            checksum,
        };
    }
    _timeToTimestampMs(time) {
        return new decimal_js_1.default(time).mul(1000).toDecimalPlaces(0).toNumber();
    }
}
exports.FtxBaseClient = FtxBaseClient;
//# sourceMappingURL=FtxBase.js.map