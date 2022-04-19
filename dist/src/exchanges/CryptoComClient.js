"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoComClient = void 0;
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const BasicClient_1 = require("../BasicClient");
const NotImplementedFn_1 = require("../NotImplementedFn");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
const Throttle_1 = require("../flowcontrol/Throttle");
/**
 * Implements the exchange according to API specifications:
 * https://bybit-exchange.github.io/docs/spot/#t-websocket
 *
 */
class CryptoComClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://stream.crypto.com/v2/market", watcherMs, retryTimeoutMs, sendThrottleMs = 100, } = {}) {
        super(wssPath, "CryptoCom", undefined, watcherMs, retryTimeoutMs);
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
        this._sendMessage = (0, Throttle_1.throttle)(this.__sendMessage.bind(this), sendThrottleMs);
    }
    _beforeClose() {
        this._sendMessage.cancel();
    }
    _beforeConnect() {
        return;
    }
    __sendMessage(msg) {
        this._wss.send(msg);
    }
    _sendPing(id) {
        if (this._wss) {
            this._sendMessage(JSON.stringify({
                "id": id,
                "method": "public/respond-heartbeat"
            }));
        }
    }
    _sendSubTicker(remote_id) {
        this._sendMessage(JSON.stringify({
            method: "subscribe",
            params: {
                channels: [`ticker.${remote_id}`]
            }
        }));
    }
    _sendUnsubTicker(remote_id) {
        this._sendMessage(JSON.stringify({
            method: "unsubscribe",
            params: {
                channels: [`ticker.${remote_id}`]
            }
        }));
    }
    _sendSubTrades(remote_id) {
        this._sendMessage(JSON.stringify({
            method: "subscribe",
            params: {
                channels: [`trade.${remote_id}`]
            }
        }));
    }
    _sendUnsubTrades(remote_id) {
        this._wss.send(JSON.stringify({
            method: "unsubscribe",
            params: {
                channels: [`trade.${remote_id}`]
            }
        }));
    }
    _onMessage(raw) {
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
        if (msg.code) {
            this.emit("error", msg.code, JSON.stringify(msg));
            return;
        }
        // handle ping response
        if (msg.method === "public/hearbeat") {
            this._sendPing(msg.id);
            return;
        }
        const { result } = msg;
        if (!result)
            return;
        // handle ticker
        if (msg.result.channel === "ticker") {
            const remote_id = msg.result.instrument_name;
            const market = this._tickerSubs.get(remote_id.toUpperCase()) ||
                this._tickerSubs.get(remote_id.toLowerCase());
            if (!market)
                return;
            for (const datum of msg.result.data.reverse()) {
                const ticker = this._constructTicker({ ...datum }, market);
                this.emit("ticker", ticker, market);
            }
            return;
        }
        // handle trades
        if (msg.result.channel === "trade") {
            const remote_id = msg.result.instrument_name;
            const market = this._tradeSubs.get(remote_id.toUpperCase()) ||
                this._tradeSubs.get(remote_id.toLowerCase());
            if (!market)
                return;
            for (const datum of msg.result.data.reverse()) {
                const trade = this._constructTrade({ ...datum }, market);
                this.emit("trade", trade, market);
            }
            return;
        }
    }
    /**
    {
        "i": "ETH_CRO",
        "b": 7481.63,
        "k": 7492.85,
        "a": 7481.63,
        "t": 1650387225593,
        "v": 140.54313,
        "h": 7510,
        "l": 7310,
        "c": 137.44
    }
*/
    _constructTicker(data, market) {
        const { b: bestBid, k: bestAsk, a: last, t: timestamp, v: volume, h: high, l: low, c: change } = data;
        const changePercent = (Number(change) / (Number(last) + Number(change))) * 100;
        return new Ticker_1.Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: timestamp,
            last: last.toString(),
            open: (Number(last) + Number(change)).toString(),
            high: high.toString(),
            low: low.toString(),
            volume: volume.toString(),
            quoteVolume: undefined,
            change: change.toString(8),
            changePercent: changePercent.toFixed(2),
            ask: bestAsk.toString(),
            askVolume: undefined,
            bid: bestBid.toString(),
            bidVolume: undefined,
            sequenceId: undefined
        });
    }
    /**
    {
        "dataTime": 1650387889146,
        "d": 2434410587257426000,
        "s": "SELL",
        "p": 7488.69,
        "q": 0.00003,
        "t": 1650387889145,
        "i": "ETH_CRO"
    }
   */
    _constructTrade(datum, market) {
        const { d: tradeId, s: side, p: price, q: quantity, t: timestamp, i: remote_id } = datum;
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            symbol: remote_id,
            tradeId: tradeId.toString(),
            side: side.toLowerCase(),
            unix: timestamp,
            price: price?.toString(),
            amount: quantity?.toString(),
        });
    }
}
exports.CryptoComClient = CryptoComClient;
//# sourceMappingURL=CryptoComClient.js.map