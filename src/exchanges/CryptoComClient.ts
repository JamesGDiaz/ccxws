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
import { throttle } from "../flowcontrol/Throttle";
import { CancelableFn } from "../flowcontrol/Fn";
import isEqual from "fast-deep-equal";


export type CryptoComClientOptions = ClientOptions & {
    sendThrottleMs?: number;
    restThrottleMs?: number;
};

/**
 * Implements the exchange according to API specifications:
 * https://bybit-exchange.github.io/docs/spot/#t-websocket
 *
 */
export class CryptoComClient extends BasicClient {
    public _pingInterval: NodeJS.Timeout;
    public readonly sendThrottleMs: number;
    public readonly restThrottleMs: number;

    private _tickerCache = new Map()

    protected _sendMessage: CancelableFn;

    constructor({ wssPath = "wss://stream.crypto.com/v2/market", watcherMs, retryTimeoutMs, sendThrottleMs = 100, }: CryptoComClientOptions = {}) {
        super(wssPath, "CryptoCom", undefined, watcherMs, retryTimeoutMs);
        this.hasTickers = true;
        this.hasTrades = true;
        this._onMessage = this._onMessage.bind(this);
        this._sendPing = this._sendPing.bind(this);
        this._sendMessage = throttle(this.__sendMessage.bind(this), sendThrottleMs);

    }

    protected _beforeClose(): void {
        this._sendMessage.cancel();
    }

    protected _beforeConnect() {
        return;
    }

    protected __sendMessage(msg) {
        this._wss.send(msg);
    }

    protected _sendPing(id) {
        if (this._wss) {
            this._sendMessage(
                JSON.stringify({
                    "id": id,
                    "method": "public/respond-heartbeat"
                })
            );
        }
    }

    protected _sendSubTicker(remote_id: string) {
        this._sendMessage(
            JSON.stringify({
                method: "subscribe",
                params: {
                    channels: [`ticker.${remote_id}`]
                }
            }),
        );
    }

    protected _sendUnsubTicker(remote_id: string) {
        this._sendMessage(
            JSON.stringify({
                method: "unsubscribe",
                params: {
                    channels: [`ticker.${remote_id}`]
                }
            })
        );
    }

    protected _sendSubTrades(remote_id: string) {
        this._sendMessage(
            JSON.stringify({
                method: "subscribe",
                params: {
                    channels: [`trade.${remote_id}`]
                }
            })
        );
    }

    protected _sendUnsubTrades(remote_id) {
        this._wss.send(
            JSON.stringify({
                method: "unsubscribe",
                params: {
                    channels: [`trade.${remote_id}`]
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
            this.emit("error", msg.code, JSON.stringify(msg));
            return;
        }

        // handle ping response
        if (msg.method === "public/hearbeat") {
            this._sendPing(msg.id);
            return;
        }

        const { result } = msg;
        if (!result) return;

        // handle ticker
        if (msg.result.channel === "ticker") {
            const remote_id = msg.result.instrument_name;
            const market = this._tickerSubs.get(remote_id.toUpperCase()) ||
                this._tickerSubs.get(remote_id.toLowerCase());
            if (!market) return;

            for (const datum of msg.result.data.reverse()) {
                this._constructTicker({ ...datum }, market);
            }
            return;
        }

        // handle trades
        if (msg.result.channel === "trade") {
            const remote_id = msg.result.instrument_name;
            const market = this._tradeSubs.get(remote_id.toUpperCase()) ||
                this._tradeSubs.get(remote_id.toLowerCase());

            if (!market) return;

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
    protected _constructTicker(data, market) {
        const { b: bestBid, k: bestAsk, a: last, t: timestamp, v: volume, h: high, l: low, c: change } = data;

        if (!this._tickerCache.has(market.id)) {
            this._tickerCache.set(market.id, { bestBid, bestAsk, last });
        }
        const lastTicker = this._tickerCache.get(market.id);
        const thisTicker = { bestBid, bestAsk, last };
        if (isEqual(lastTicker, thisTicker)) return;
        this._tickerCache.set(market.id, thisTicker);

        const changePercent = (Number(change) / (Number(last) + Number(change))) * 100;
        const ticker = new Ticker({
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

        this.emit("ticker", ticker, market);
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
    protected _constructTrade(datum, market) {
        const { d: tradeId, s: side, p: price, q: quantity, t: timestamp, i: remote_id } = datum;
        return new Trade({
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
