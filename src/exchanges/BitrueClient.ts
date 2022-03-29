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
import * as zlib from "zlib";

/**
 * Implements the exchange according to API specifications:
 *
 */
export class BitrueClient extends BasicClient {
    public id: number;
    public _pingInterval: NodeJS.Timeout;

    constructor({ wssPath = "wss://ws.bitrue.com/kline-api/ws", watcherMs, retryTimeoutMs }: ClientOptions = {}) {
        super(wssPath, "Bitrue", undefined, watcherMs, retryTimeoutMs);
        this.hasTickers = true;
        this.hasTrades = true;
        this.id = 0;
        this._onMessageInf = this._onMessageInf.bind(this);
        this._sendPing = this._sendPing.bind(this);
    }

    protected _beforeConnect() {
        this._wss.on("connected", this._startPing.bind(this));
        this._wss.on("disconnected", this._stopPing.bind(this));
        this._wss.on("closed", this._stopPing.bind(this));
    }

    protected _startPing() {
        clearInterval(this._pingInterval);
        this._pingInterval = setInterval(this._sendPing, 60000);
    }

    protected _stopPing() {
        clearInterval(this._pingInterval);
    }

    protected _sendPing() {
        if (this._wss) {
            this._wss.send(
                JSON.stringify({
                    "pong": Date.now()
                })
            );
        }
    }

    protected _sendSubTicker(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                event: "sub",
                params: {
                    cb_id: `${remote_id.toLowerCase()}`,
                    channel: `market_${remote_id.toLowerCase()}_ticker`
                },
                id: ++this.id,
            }),
        );
    }

    protected _sendUnsubTicker(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                event: "unsub",
                params: {
                    cb_id: `${remote_id.toLowerCase()}`,
                    channel: `market_${remote_id.toLowerCase()}_ticker`
                },
                id: ++this.id,
            }),
        );
    }

    protected _sendSubTrades(remote_id: string) {
        this._wss.send(
            JSON.stringify({
                event: "sub",
                params: {
                    cb_id: `${remote_id.toLowerCase()}`,
                    channel: `market_${remote_id.toLowerCase()}_trade_ticker`
                },
                id: ++this.id,
            }),
        );
    }

    protected _sendUnsubTrades(remote_id) {
        this._wss.send(
            JSON.stringify({
                method: "unsub",
                params: `market_${remote_id.toLowerCase()}_trade_ticker`,
                id: ++this.id,
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
        zlib.gunzip(raw, this._onMessageInf);
    }

    protected _onMessageInf(err, raw) {
        // handle inflate error
        if (err) {
            this.emit("error", err);
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
            const market =
                this._tradeSubs.get(remote_id.toUpperCase()) ||
                this._tradeSubs.get(remote_id.toLowerCase());

            if (!market) return;

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
            const market =
                this._tickerSubs.get(remote_id.toUpperCase()) ||
                this._tickerSubs.get(remote_id.toLowerCase());

            if (!market) return;

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
    protected _constructTicker(data, market) {
        const change = Number(data.close) - Number(data.open);
        const changePercent = (change / Number(data.open)) * 100;
        return new Ticker({
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
            ask: undefined,
            askVolume: undefined,
            bid: undefined,
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
    protected _constructTrade(datum, market) {
        const { id, ts, price, amount, side } = datum;
        return new Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId: id.toString(),
            side: side?.toLowerCase(),
            unix: ts,
            price: price?.toString(),
            amount: amount?.toString(),
        });
    }

}
