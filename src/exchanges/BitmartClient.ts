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
import zlib from "zlib";

/**
 * Implements the exchange according to API specifications:
 *
 */
export class BitmartClient extends BasicClient {
    public id: number;
    public _pingTimer: NodeJS.Timeout;
    public _pingTimerTimestamp: number;

    constructor({
        wssPath = "wss://ws-manager-compress.bitmart.com/api?protocol=1.1",
        watcherMs,
        retryTimeoutMs,
    }: ClientOptions = {}) {
        super(wssPath, "Bitmart", undefined, watcherMs, retryTimeoutMs);
        this.hasTickers = true;
        this.hasTrades = true;
        this.id = 0;
        this._onMessage = this._onMessage.bind(this);
        this._processMessage = this._processMessage.bind(this);
        this._sendPing = this._sendPing.bind(this);
    }

    protected _beforeConnect() {
        this._wss.on("connected", this._startPing.bind(this));
        this._wss.on("disconnected", this._stopPing.bind(this));
        this._wss.on("closed", this._stopPing.bind(this));
    }

    protected _startPing() {
        clearInterval(this._pingTimer);
        this._pingTimer = setTimeout(this._sendPing, 10000);
    }

    protected _stopPing() {
        clearInterval(this._pingTimer);
    }

    protected _sendPing() {
        if (this._wss) {
            this._pingTimerTimestamp = Date.now();
            this._wss.send("ping");
            setTimeout(() => {
                if (this._pingTimerTimestamp) {
                    this.reconnect();
                }
            }, 10000);
        }
    }

    protected _sendSubTicker(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                op: "subscribe",
                args: [`spot/ticker:${remote_id}`],
            }),
        );
    }

    protected _sendUnsubTicker(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                op: "unsubscribe",
                args: [`spot/ticker:${remote_id}`],
            }),
        );
    }

    protected _sendSubTrades(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                op: "subscribe",
                args: [`spot/trade:${remote_id}`],
            }),
        );
    }

    protected _sendUnsubTrades(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                op: "unsubscribe",
                args: [`spot/trade:${remote_id}`],
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
        // set timer to send ping frame
        this._startPing();

        // handle ping
        if (raw === "pong") {
            this._pingTimerTimestamp = null;
            return;
        }

        // handle parse error
        let msg;
        try {
            msg = JSON.parse(raw.toString("utf8"));
            this._processMessage(msg);
        } catch (err) {
            // try inflating with zlib
            try {
                const raw_msg = zlib.inflateRawSync(raw).toString();
                msg = JSON.parse(raw_msg);
                this._processMessage(msg);
                return;
            } catch {
                this.emit("error", err, raw);
            }
            this.emit("error", err, raw);
            return;
        }
    }

    protected _processMessage(msg) {
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
        if (msg.table === "spot/trade") {
            for (const datum of msg.data.reverse()) {
                const remote_id = datum.symbol;

                const market =
                    this._tradeSubs.get(remote_id.toUpperCase()) ||
                    this._tradeSubs.get(remote_id.toLowerCase());

                if (!market) continue;

                const trade = this._constructTrade(datum, market);
                this.emit("trade", trade, market);
            }
            return;
        }

        // handle ticker
        if (msg.table === "spot/ticker") {
            for (const datum of msg.data.reverse()) {
                const remote_id = datum.symbol;

                const market =
                    this._tickerSubs.get(remote_id.toUpperCase()) ||
                    this._tickerSubs.get(remote_id.toLowerCase());

                if (!market) continue;

                const ticker = this._constructTicker(datum, market);
                this.emit("ticker", ticker, market);
            }

            return;
        }
    }

    /**
    {
        "symbol":"BTC_USDT",
        "last_price":"146.24",
        "open_24h":"147.17",
        "high_24h":"147.48",
        "low_24h":"143.88",
        "base_volume_24h":"117387.58",
        "s_t": 1610936002
    }
  */
    protected _constructTicker(data, market) {
        const { last_price, open_24h, high_24h, low_24h, base_volume_24h, s_t } = data;

        const change = Number(last_price) - Number(open_24h);
        const changePercent = (change / Number(open_24h)) * 100;

        return new Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: Date.now(),
            last: last_price,
            open: open_24h,
            high: high_24h,
            low: low_24h,
            volume: undefined,
            quoteVolume: base_volume_24h,
            change: change.toFixed(8),
            changePercent: changePercent.toFixed(2),
            ask: last_price,
            askVolume: undefined,
            bid: last_price,
            bidVolume: undefined,
        });
    }

    /**
    {
      "price": "40313.34",
      "s_t": 1650052935,
      "side": "sell",
      "size": "0.13710",
      "symbol": "BTC_USDT"
    }
   */
    protected _constructTrade(datum, market) {
        const { side, size, symbol, price } = datum;
        return new Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            symbol: symbol,
            side,
            unix: Date.now(),
            price: price,
            amount: size,
        });
    }
}
