/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { NotImplementedFn } from "../NotImplementedFn";
import { Ticker } from "../Ticker";


/**
 * Implements the exchange according to API specifications:
 * https://www.aax.com/apidoc/index.html#websocket *
 */
export class AaxClient extends BasicClient {
    public _pingInterval: NodeJS.Timeout;

    constructor({ wssPath = "wss://realtime.aax.com/marketdata/v2/tickers", watcherMs, retryTimeoutMs }: ClientOptions = {}) {
        super(wssPath, "AAX", undefined, watcherMs, retryTimeoutMs);
        this.hasTickers = true;
        this.hasTrades = false;
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

    /**
     * This exchange sends all tickers everytime they're updated, there's no sub/unsub model
     **/
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected _sendSubTicker(remote_id) {
        //
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected _sendUnsubTicker(remote_id) {
        //
    }

    protected _sendSubTrades = NotImplementedFn;
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
        // handle parse error
        let msg;
        try {
            msg = JSON.parse(raw.toString("utf8"));
        } catch (err) {
            this.emit("error", err, raw);
            return;
        }


        // handle ping response
        if (msg.pong) {
            //this._sendPing();
            return;
        }

        // handle ticker
        if (msg.e === "tickers") {
            for (const datum of msg.tickers) {
                const remote_id = datum.s;
                const market = this._tickerSubs.get(remote_id.toUpperCase()) ||
                    this._tickerSubs.get(remote_id.toLowerCase());
                if (!market) return;

                const trade = this._constructTicker({ ...datum, timestamp: msg.t }, market);
                this.emit("ticker", trade, market);
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
        const { c, d, h, l, o, q, v, timestamp } = data;

        const change = Number(c) - Number(o);

        return new Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: timestamp,
            last: c?.toString(),
            open: o?.toString(),
            high: h?.toString(),
            low: l?.toString(),
            volume: q?.toString(),
            quoteVolume: v?.toString(),
            change: change?.toString(8),
            changePercent: d?.toString(2),
            ask: c?.toString(),
            askVolume: undefined,
            bid: c?.toString(),
            bidVolume: undefined,
            sequenceId: undefined
        });;
    }

}
