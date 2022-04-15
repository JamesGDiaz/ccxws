"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MexcClient = void 0;
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const BasicClient_1 = require("../BasicClient");
const NotImplementedFn_1 = require("../NotImplementedFn");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
/**
 * Implements the exchange according to API specifications:
 *
 */
class MexcClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://wbs.mexc.com/raw/ws", watcherMs, retryTimeoutMs, } = {}) {
        super(wssPath, "Mexc", undefined, watcherMs, retryTimeoutMs);
        this._sendUnsubTicker = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubTrades = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel2Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel2Updates = NotImplementedFn_1.NotImplementedFn;
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
        this._onMessage = this._onMessage.bind(this);
        this._sendPing = this._sendPing.bind(this);
    }
    _beforeConnect() {
        this._wss.on("connected", this._startPing.bind(this));
        this._wss.on("disconnected", this._stopPing.bind(this));
        this._wss.on("closed", this._stopPing.bind(this));
    }
    _startPing() {
        clearInterval(this._pingInterval);
        this._pingInterval = setInterval(this._sendPing, 8000);
    }
    _stopPing() {
        clearInterval(this._pingInterval);
    }
    _sendPing() {
        if (this._wss) {
            this._wss.send("ping");
        }
    }
    _sendSubTicker(remote_id) {
        this._wss.send(JSON.stringify({
            op: "sub.deal.aggregate",
            symbol: remote_id,
        }));
    }
    _sendSubTrades(remote_id) {
        this._wss.send(JSON.stringify({
            op: "sub.deal.aggregate",
            symbol: remote_id,
        }));
    }
    _onMessage(raw) {
        // handle ping
        if (raw === "ping") {
            return;
        }
        // handle parse error
        let msg;
        try {
            msg = JSON.parse(raw.toString("utf8"));
        }
        catch (err) {
            this.emit("error", err, raw);
            return;
        }
        // handle errors
        if (msg.error) {
            this.emit("error", msg.error);
            return;
        }
        // handle trades
        if (msg.channel === "push.deal.aggregate") {
            const remote_id = msg.symbol;
            const market = this._tradeSubs.get(remote_id.toUpperCase()) ||
                this._tradeSubs.get(remote_id.toLowerCase());
            if (market) {
                // trades arrive newest first
                for (const datum of msg.data.deals.reverse()) {
                    const trade = this._constructTrade(datum, market);
                    this.emit("trade", trade, market);
                }
            }
        }
        // handle ticker
        if (msg.channel === "push.deal.aggregate") {
            const remote_id = msg.symbol;
            const market = this._tickerSubs.get(remote_id.toUpperCase()) ||
                this._tickerSubs.get(remote_id.toLowerCase());
            if (market) {
                // trades arrive newest first
                for (const datum of msg.data.deals.reverse()) {
                    const ticker = this._constructTicker(datum, market);
                    this.emit("ticker", ticker, market);
                }
            }
        }
    }
    /**
    {
      "t": 1649990370496,
      "p": "0.06241",
      "q": "114.68",
      "T": 2
    }
  */
    _constructTicker(data, market) {
        const { t: ts, p: price } = data;
        return new Ticker_1.Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: ts,
            last: price.toString(),
            open: undefined,
            high: undefined,
            low: undefined,
            volume: undefined,
            quoteVolume: undefined,
            change: undefined,
            changePercent: undefined,
            ask: price.toString(),
            askVolume: undefined,
            bid: price.toString(),
            bidVolume: undefined,
        });
    }
    /**
    {
      "t": 1649990370496,
      "p": "0.06241",
      "q": "114.68",
      "T": 2
    }
   */
    _constructTrade(datum, market) {
        const { t: ts, p: price, q: quantity, T: side } = datum;
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId: undefined,
            side: side == 2 ? "sell" : "buy",
            unix: ts,
            price: price?.toString(),
            amount: quantity?.toString(),
        });
    }
}
exports.MexcClient = MexcClient;
//# sourceMappingURL=MexcClient.js.map