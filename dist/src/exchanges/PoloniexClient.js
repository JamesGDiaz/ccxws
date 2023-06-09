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
exports.PoloniexClient = void 0;
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const BasicClient_1 = require("../BasicClient");
const https = __importStar(require("../Https"));
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Level2Update_1 = require("../Level2Update");
const NotImplementedFn_1 = require("../NotImplementedFn");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
class PoloniexClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://api2.poloniex.com/", autoloadSymbolMaps = true, watcherMs, } = {}) {
        super(wssPath, "Poloniex", undefined, watcherMs);
        this._sendSubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._idMap = new Map();
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasLevel2Updates = true;
        this._subbedToTickers = false;
        this.on("connected", this._resetSubCount.bind(this));
        this.TICKERS_ID = 1002;
        this.MARKET_IDS = new Map();
        if (autoloadSymbolMaps) {
            this.loadSymbolMaps().catch(err => this.emit("error", err));
        }
    }
    /**
    Poloniex uses numeric identifiers for its markets.
    A static map of these markets can be obtained from:
    https://docs.poloniex.com/#currency-pair-ids

    We can use the ticker REST API as a mechanism to obtain
    the identifiers and create an index of id to symbol.
   */
    async loadSymbolMaps() {
        const uri = "https://poloniex.com/public?command=returnTicker";
        const result = await https.get(uri);
        for (const symbol in result) {
            const id = result[symbol].id;
            this.MARKET_IDS.set(id, symbol);
        }
    }
    _resetSubCount() {
        this._subCount = {};
        this._subbedToTickers = false;
    }
    _sendSubTicker() {
        if (this._subbedToTickers)
            return; // send for first request
        this._subbedToTickers = true;
        this._wss.send(JSON.stringify({
            command: "subscribe",
            channel: this.TICKERS_ID,
        }));
    }
    _sendUnsubTicker() {
        if (this._tickerSubs.size)
            return; // send when no more
        this._subbedToTickers = false;
        this._wss.send(JSON.stringify({
            command: "unsubscribe",
            channel: this.TICKERS_ID,
        }));
    }
    _sendSubTrades(remote_id) {
        this._sendSubscribe(remote_id);
    }
    _sendUnsubTrades(remote_id) {
        this._sendUnsubscribe(remote_id);
    }
    _sendSubLevel2Updates(remote_id) {
        this._sendSubscribe(remote_id);
    }
    _sendUnsubLevel2Updates(remote_id) {
        this._sendUnsubscribe(remote_id);
    }
    _sendSubscribe(remote_id) {
        this._subCount[remote_id] = (this._subCount[remote_id] || 0) + 1; // increment market counter
        // if we have more than one sub, ignore the request as we're already subbed
        if (this._subCount[remote_id] > 1)
            return;
        this._wss.send(JSON.stringify({
            command: "subscribe",
            channel: remote_id,
        }));
    }
    _sendUnsubscribe(remote_id) {
        this._subCount[remote_id] -= 1; // decrement market count
        // if we still have subs, then leave channel open
        if (this._subCount[remote_id])
            return;
        this._wss.send(JSON.stringify({
            command: "unsubscribe",
            channel: remote_id,
        }));
    }
    _onMessage(raw) {
        // different because messages are broadcast as joined updates
        // [148,540672082,[["o",1,"0.07313000","7.21110596"],["t","43781170",0,"0.07313000","0.00199702",1528900825]]]
        // we need to pick apart these messages and broadcast them accordingly
        const msg = JSON.parse(raw);
        const id = msg[0];
        const seq = msg[1];
        const updates = msg[2];
        // tickers
        if (id === this.TICKERS_ID && updates) {
            const remoteId = this.MARKET_IDS.get(updates[0]);
            const market = this._tickerSubs.get(remoteId);
            if (!market)
                return;
            const ticker = this._createTicker(updates, market);
            this.emit("ticker", ticker, market);
            return;
        }
        if (!updates)
            return;
        const bids = [];
        const asks = [];
        for (const update of updates) {
            switch (update[0]) {
                // when connection is first established it will send an 'info' packet
                // that can be used to map the "id" to the market_symbol
                case "i": {
                    const remote_id = update[1].currencyPair;
                    this._idMap.set(id, remote_id);
                    // capture snapshot if we're subscribed to l2updates
                    const market = this._level2UpdateSubs.get(remote_id);
                    if (!market)
                        continue;
                    const snapshot = this._constructoLevel2Snapshot(seq, update[1], market);
                    this.emit("l2snapshot", snapshot, market);
                    break;
                }
                // trade events will stream-in after we are subscribed to the channel
                // and hopefully after the info packet has been sent
                case "t": {
                    const market = this._tradeSubs.get(this._idMap.get(id));
                    if (!market)
                        continue;
                    const trade = this._constructTradeFromMessage(update, market);
                    this.emit("trade", trade, market);
                    break;
                }
                case "o": {
                    // only include updates if we are subscribed to the market
                    const market = this._level2UpdateSubs.get(this._idMap.get(id));
                    if (!market)
                        continue;
                    //[171, 280657226, [["o", 0, "0.00225182", "0.00000000"], ["o", 0, "0.00225179", "860.66363984"]]]
                    //[171, 280657227, [["o", 1, "0.00220001", "0.00000000"], ["o", 1, "0.00222288", "208.47334089"]]]
                    const point = new Level2Point_1.Level2Point(update[2], update[3]);
                    if (update[1] === 0)
                        asks.push(point);
                    if (update[1] === 1)
                        bids.push(point);
                    break;
                }
            }
        }
        // check if we have bids/asks and construct order update message
        if (bids.length || asks.length) {
            const market = this._level2UpdateSubs.get(this._idMap.get(id));
            if (!market)
                return;
            const l2update = new Level2Update_1.Level2Update({
                exchange: this.name,
                base: market.base,
                quote: market.quote,
                sequenceId: seq,
                asks,
                bids,
            });
            this.emit("l2update", l2update, market);
        }
    }
    _createTicker(update, market) {
        const [, last, ask, bid, percent, quoteVol, baseVol, , high, low] = update;
        const open = parseFloat(last) / (1 + parseFloat(percent));
        const dayChange = parseFloat(last) - open;
        return new Ticker_1.Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: Date.now(),
            last,
            open: open.toFixed(8),
            high,
            low,
            volume: baseVol,
            quoteVolume: quoteVol,
            change: dayChange.toFixed(8),
            changePercent: percent,
            ask,
            bid,
        });
    }
    _constructTradeFromMessage(update, market) {
        let [, trade_id, side, price, size, unix] = update;
        side = side === 1 ? "buy" : "sell";
        unix = unix * 1000;
        trade_id = parseInt(trade_id);
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId: trade_id.toFixed(),
            side,
            unix,
            price,
            amount: size,
        });
    }
    _constructoLevel2Snapshot(seq, update, market) {
        const [asksObj, bidsObj] = update.orderBook;
        const asks = [];
        const bids = [];
        for (const price in asksObj) {
            asks.push(new Level2Point_1.Level2Point(price, asksObj[price]));
        }
        for (const price in bidsObj) {
            bids.push(new Level2Point_1.Level2Point(price, bidsObj[price]));
        }
        return new Level2Snapshots_1.Level2Snapshot({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            sequenceId: seq,
            asks,
            bids,
        });
    }
}
exports.PoloniexClient = PoloniexClient;
//# sourceMappingURL=PoloniexClient.js.map