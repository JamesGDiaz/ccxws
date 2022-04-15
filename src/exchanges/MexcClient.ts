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
 *
 */
export class MexcClient extends BasicClient {
    public id: number;
    public _pingInterval: NodeJS.Timeout;

    constructor({
        wssPath = "wss://wbs.mexc.com/raw/ws",
        watcherMs,
        retryTimeoutMs,
    }: ClientOptions = {}) {
        super(wssPath, "Mexc", undefined, watcherMs, retryTimeoutMs);
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
        this._pingInterval = setInterval(this._sendPing, 8000);
    }

    protected _stopPing() {
        clearInterval(this._pingInterval);
    }

    protected _sendPing() {
        if (this._wss) {
            this._wss.send("ping");
        }
    }

    protected _sendSubTicker(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                op: "sub.deal.aggregate",
                symbol: remote_id,
            }),
        );
    }

    protected _sendSubTrades(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                op: "sub.deal.aggregate",
                symbol: remote_id,
            }),
        );
    }

    protected _sendUnsubTicker = NotImplementedFn;
    protected _sendUnsubTrades = NotImplementedFn;

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
        // handle ping
        if (raw === "pong") {
            return;
        }

        // handle parse error
        let msg;
        try {
            msg = JSON.parse(raw.toString("utf8"));
        } catch (err) {
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
            const market =
                this._tradeSubs.get(remote_id.toUpperCase()) ||
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
            const market =
                this._tickerSubs.get(remote_id.toUpperCase()) ||
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
    protected _constructTicker(data, market) {
        const { t: ts, p: price } = data;
        return new Ticker({
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
    protected _constructTrade(datum, market) {
        const { t: ts, p: price, q: quantity, T: side } = datum;
        return new Trade({
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
