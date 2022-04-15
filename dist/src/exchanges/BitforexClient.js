"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitforexClient = void 0;
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
class BitforexClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://www.bitforex.com/mkapi/coinGroup1/ws", watcherMs, retryTimeoutMs, } = {}) {
        super(wssPath, "Bitforex", undefined, watcherMs, retryTimeoutMs);
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
        this.id = 0;
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
        this._pingInterval = setInterval(this._sendPing, 30000);
    }
    _stopPing() {
        clearInterval(this._pingInterval);
    }
    _sendPing() {
        if (this._wss) {
            this._wss.send("ping_p");
        }
    }
    _sendSubTicker(remote_id) {
        this._wss.send(JSON.stringify([
            {
                type: "subHq",
                event: "ticker",
                param: {
                    businessType: remote_id,
                },
            },
        ]));
    }
    _sendSubTrades(remote_id) {
        this._wss.send(JSON.stringify([
            {
                type: "subHq",
                event: "trade",
                param: {
                    businessType: remote_id,
                    size: 100,
                },
            },
        ]));
    }
    _onMessage(raw) {
        // handle ping
        if (raw === "pong_p") {
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
        // handle subscription success
        if (msg.event_rep === "subed" && msg.status === "ok") {
            return;
        }
        // handle errors
        if (msg.error) {
            this.emit("error", msg.error);
            return;
        }
        // handle trades
        if (msg.event === "trade") {
            const remote_id = msg.param.businessType;
            const market = this._tradeSubs.get(remote_id.toUpperCase()) ||
                this._tradeSubs.get(remote_id.toLowerCase());
            if (!market)
                return;
            // trades arrive newest first
            for (const datum of msg.data.reverse()) {
                const trade = this._constructTrade({ ...datum, ts: msg.time }, market);
                this.emit("trade", trade, market);
            }
            return;
        }
        // handle ticker
        if (msg.event === "ticker") {
            const remote_id = msg.param.businessType;
            const market = this._tickerSubs.get(remote_id.toUpperCase()) ||
                this._tickerSubs.get(remote_id.toLowerCase());
            if (!market)
                return;
            const ticker = this._constructTicker(msg.data, market);
            this.emit("ticker", ticker, market);
            return;
        }
    }
    /**
    {
      "data": {
        "startdate": 1649962809679,
        "enddate": 1650049209679,
        "type": "24H",
        "high": 40817.65,
        "low": 39394.6,
        "last": 40395.17,
        "open": 39667.91,
        "productvol": 1179.193,
        "currencyvol": 47337079.013194,
        "allVol": 0,
        "allCurrencyVol": 0,
        "rate": 0.0183
      },
      "event": "ticker",
      "param": {
        "businessType": "coin-usdc-btc"
      }
    }
  */
    _constructTicker(data, market) {
        const { high, low, last, open, productvol, currencyvol, rate: change } = data;
        const changePercent = change * 100;
        return new Ticker_1.Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: Date.now(),
            last: last.toString(),
            open: open.toString(),
            high: high.toString(),
            low: low.toString(),
            volume: productvol.toString(),
            quoteVolume: currencyvol.toString(),
            change: change.toFixed(8),
            changePercent: changePercent.toFixed(2),
            ask: last.toString(),
            askVolume: undefined,
            bid: last.toString(),
            bidVolume: undefined,
        });
    }
    /**
    {
      "price": 40368.27,
      "amount": 0.0146,
      "time": 1650049663495,
      "direction": 1,
      "tid": "1579765408"
    }
   */
    _constructTrade(datum, market) {
        const { tid, direction, time, amount, price } = datum;
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId: tid.toString(),
            side: direction === 1 ? "sell" : "buy",
            unix: time,
            price: price?.toString(),
            amount: amount?.toString(),
        });
    }
}
exports.BitforexClient = BitforexClient;
//# sourceMappingURL=BitforexClient.js.map