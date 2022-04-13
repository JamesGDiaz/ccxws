/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { NotImplementedFn } from "../NotImplementedFn";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";


/**
 * Implements the exchange according to API specifications:
 * https://bybit-exchange.github.io/docs/spot/#t-websocket
 *
 */
export class ByBitClient extends BasicClient {
    public _pingInterval: NodeJS.Timeout;

    constructor({ wssPath = "wss://stream.bybit.com/spot/quote/ws/v1", watcherMs, retryTimeoutMs }: ClientOptions = {}) {
        super(wssPath, "Bybit", undefined, watcherMs, retryTimeoutMs);
        this.hasTickers = true;
        this.hasTrades = true;
        this._onMessage = this._onMessage.bind(this);
        this._sendPing = this._sendPing.bind(this);

    }

    protected _beforeConnect() {
        this._wss.on("connected", this._startPing.bind(this));
        this._wss.on("disconnected", this._stopPing.bind(this));
        this._wss.on("closed", this._stopPing.bind(this));
    }

    protected _startPing() {
        clearInterval(this._pingInterval);
        this._pingInterval = setInterval(this._sendPing, 30000);
    }

    protected _stopPing() {
        clearInterval(this._pingInterval);
    }

    protected _sendPing() {
        if (this._wss) {
            this._wss.send(
                JSON.stringify({ ping: Date.now() })
            );
        }
    }

    protected _sendSubTicker(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                topic: "realtimes",
                event: "sub",
                symbol: remote_id.toUpperCase(),
                params: {
                    binary: false
                }
            }),
        );
    }

    protected _sendUnsubTicker(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                topic: "realtimes",
                event: "cancel",
                symbol: remote_id.toUpperCase(),
                params: {
                    binary: false
                }
            }),
        );
    }

    protected _sendSubTrades(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                topic: "trade",
                event: "sub",
                symbol: remote_id.toUpperCase(),
                params: {
                    binary: false
                }
            }),
        );
    }

    protected _sendUnsubTrades(remote_id) {
        this._wss.send(
            JSON.stringify({
                topic: "trade",
                event: "cancel",
                symbol: remote_id.toUpperCase(),
                params: {
                    binary: false
                }
            }),
        );
    }

    protected _sendSubLevel2Updates = NotImplementedFn;
    protected _sendUnsubLevel2Updates = NotImplementedFn;
    protected _sendSubCandles = NotImplementedFn;
    protected _sendUnsubCandles = NotImplementedFn;
    protected _sendSubLevel2Snapshots = NotImplementedFn;
    protected _sendUnsubLevel2Snapshots = NotImplementedFn;
    protected _sendSubLevel3Snapshots = NotImplementedFn;
    protected _sendUnsubLevel3Snapshots = NotImplementedFn;
    protected _sendSubLevel3Updates = NotImplementedFn;
    protected _sendUnsubLevel3Updates = NotImplementedFn;

    protected _onMessage(raw) {
        // handle parse error
        let msg;
        try {
            msg = JSON.parse(raw.toString("utf8"));
        } catch (err) {
            this.emit("error", err, raw);
            return;
        }

        // handle errors
        if (msg.code) {
            this.emit("error", `${msg.code} ${msg.desc}`);
            return;
        }

        // handle ping response
        if (msg.pong) {
            //this._sendPing();
            return;
        }

        // handle ticker
        if (msg.topic === "realtimes") {
            const remote_id = msg.symbol;
            const market = this._tickerSubs.get(remote_id.toUpperCase()) ||
                this._tickerSubs.get(remote_id.toLowerCase());

            if (!market) return;

            for (const datum of msg.data.reverse()) {
                const trade = this._constructTicker({ ...datum }, market);
                this.emit("ticker", trade, market);
            }
            return;
        }

        // handle trades
        if (msg.topic === "trade") {
            const remote_id = msg.symbol;
            const market = this._tradeSubs.get(remote_id.toUpperCase()) ||
                this._tradeSubs.get(remote_id.toLowerCase());

            if (!market) return;

            for (const datum of msg.data.reverse()) {
                const trade = this._constructTrade({ ...datum }, market);
                this.emit("trade", trade, market);
            }
            return;
        }
    }

    /**
    {
      "t": 1649878708709,
      "s": "BTCUSDT",
      "sn": "BTCUSDT",
      "c": "41192.9",
      "h": "41544.57",
      "l": "39254.47",
      "o": "39592.39",
      "v": "2511.468477",
      "qv": "101621977.09086012",
      "m": "0.0404",
      "e": 301
    }
*/
    protected _constructTicker(data, market) {
        const { t, c, h, l, o, v, qv, m } = data;

        const changePercent = Number(m) * 100;
        return new Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: t,
            last:  c.toString(),
            open: o.toString(),
            high: h.toString(),
            low: l.toString(),
            volume: v.toString(),
            quoteVolume: qv.toString(),
            change: m.toString(8),
            changePercent: changePercent.toFixed(2),
            ask:  c.toString(),
            askVolume: undefined,
            bid:  c.toString(),
            bidVolume: undefined,
            sequenceId: undefined
        });
    }


    /**
    {
        "v":"929681067596857345",
        "t":1625562619577,
        "p":"34924.15",
        "q":"0.00027",
        "m":true
    }
   */
    protected _constructTrade(datum, market) {
        const { v, t, p, q, m } = datum;
        return new Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            symbol: `${market.base}${market.quote}`,
            tradeId: v.toString(),
            side: m ? "buy" : "sell",
            unix: t,
            price: p?.toString(),
            amount: q?.toString(),
        });
    }

}
