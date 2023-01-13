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
exports.BitrueClient = void 0;
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const BasicClient_1 = require("../BasicClient");
const NotImplementedFn_1 = require("../NotImplementedFn");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
const zlib = __importStar(require("zlib"));
/**
 * Implements the exchange according to API specifications:
 *
 */
class BitrueClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://ws.bitrue.com/kline-api/ws", watcherMs, retryTimeoutMs } = {}) {
        super(wssPath, "Bitrue", undefined, watcherMs, retryTimeoutMs);
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
        this._onMessageInf = this._onMessageInf.bind(this);
        this._sendPing = this._sendPing.bind(this);
    }
    _beforeConnect() {
        this._wss.on("connected", this._startPing.bind(this));
        this._wss.on("disconnected", this._stopPing.bind(this));
        this._wss.on("closed", this._stopPing.bind(this));
    }
    _startPing() {
        clearInterval(this._pingInterval);
        this._pingInterval = setInterval(this._sendPing, 60000);
    }
    _stopPing() {
        clearInterval(this._pingInterval);
    }
    _sendPing() {
        if (this._wss) {
            this._wss.send(JSON.stringify({
                "pong": Date.now()
            }));
        }
    }
    _sendSubTicker(remote_id) {
        this._wss.send(JSON.stringify({
            event: "sub",
            params: {
                cb_id: `${remote_id.toLowerCase()}`,
                channel: `market_${remote_id.toLowerCase()}_ticker`
            },
            id: ++this.id,
        }));
    }
    _sendUnsubTicker(remote_id) {
        this._wss.send(JSON.stringify({
            event: "unsub",
            params: {
                cb_id: `${remote_id.toLowerCase()}`,
                channel: `market_${remote_id.toLowerCase()}_ticker`
            },
            id: ++this.id,
        }));
    }
    _sendSubTrades(remote_id) {
        this._wss.send(JSON.stringify({
            event: "sub",
            params: {
                cb_id: `${remote_id.toLowerCase()}`,
                channel: `market_${remote_id.toLowerCase()}_trade_ticker`
            },
            id: ++this.id,
        }));
    }
    _sendUnsubTrades(remote_id) {
        this._wss.send(JSON.stringify({
            method: "unsub",
            params: `market_${remote_id.toLowerCase()}_trade_ticker`,
            id: ++this.id,
        }));
    }
    _onMessage(raw) {
        zlib.gunzip(raw, this._onMessageInf);
    }
    _onMessageInf(err, raw) {
        // handle inflate error
        if (err) {
            this.emit("error", err);
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
        // handle ping
        if (msg.ping) {
            this._sendPing();
            return;
        }
        // handle trades
        if (msg.channel.includes("_trade_ticker")) {
            const remote_id = msg.channel.replace("market_", "").replace("_trade_ticker", "");
            const market = this._tradeSubs.get(remote_id.toUpperCase()) ||
                this._tradeSubs.get(remote_id.toLowerCase());
            if (!market)
                return;
            if (!Array.isArray(msg.tick.data))
                return;
            // trades arrive newest first
            for (const datum of msg.tick.data.reverse()) {
                const trade = this._constructTrade({ ...datum, ts: msg.ts }, market);
                this.emit("trade", trade, market);
            }
            return;
        }
        // handle ticker
        if (msg.channel.includes("_ticker") && !msg.channel.includes("_trade_ticker")) {
            const data = { ...msg.tick, ts: msg.ts };
            const remote_id = msg.channel.replace("market_", "").replace("_ticker", "");
            const market = this._tickerSubs.get(remote_id.toUpperCase()) ||
                this._tickerSubs.get(remote_id.toLowerCase());
            if (!market)
                return;
            const ticker = this._constructTicker(data, market);
            this.emit("ticker", ticker, market);
            return;
        }
    }
    /**
    {
      tick: {
        amount: 375936776.909343,
        rose: 0.015,
        close: 47495.02,
        vol: 7942.2064,
        high: 48189.84,
        low: 46741.86,
        open: 46790.69
      },
      channel: 'market_btcusdt_ticker',
      ts: 1648518029349
    }
  */
    _constructTicker(data, market) {
        const change = Number(data.close) - Number(data.open);
        const changePercent = (change / Number(data.open)) * 100;
        return new Ticker_1.Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: data.ts,
            last: data.close.toString(),
            open: data.open.toString(),
            high: data.high.toString(),
            low: data.low.toString(),
            volume: data.vol.toString(),
            quoteVolume: data.amount.toString(),
            change: change.toFixed(8),
            changePercent: changePercent.toFixed(2),
            ask: data.close.toString(),
            askVolume: undefined,
            bid: data.close.toString(),
            bidVolume: undefined,
        });
    }
    /**
    {
      "method": "trades.update",
      "params":
      [
        true,
        [
          {
            id: 3282939928,
            time: 1597419159,
            amount: '0.1',
            price: '11687.04',
            type: 'sell'
          }
        ],
        "ETH_USDT"
      ],
      "id": null
    }
   */
    _constructTrade(datum, market) {
        const { id, ts, price, amount, side } = datum;
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId: id.toString(),
            side: side?.toLowerCase(),
            unix: ts,
            price: price?.toString(),
            amount: (Number(amount) / Number(price))?.toString(),
        });
    }
}
exports.BitrueClient = BitrueClient;
//# sourceMappingURL=BitrueClient.js.map