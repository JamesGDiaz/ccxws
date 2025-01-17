/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Level2Point } from "../Level2Point";
import { Level2Snapshot } from "../Level2Snapshots";
import { NotImplementedFn } from "../NotImplementedFn";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
import isEqual from "fast-deep-equal";

export class ZbClient extends BasicClient {
    public remoteIdMap: Map<string, string>;

    constructor({ wssPath = "wss://api.zb.com/websocket", watcherMs }: ClientOptions = {}) {
        super(wssPath, "ZB", undefined, watcherMs);
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasLevel2Snapshots = true;
        this.remoteIdMap = new Map();
    }

    private _tickerCache = new Map();

    protected _sendSubTicker(remote_id: string) {
        const wss_remote_id = remote_id.replace(/_/, "");
        this.remoteIdMap.set(wss_remote_id, remote_id);
        this._wss.send(
            JSON.stringify({
                event: "addChannel",
                channel: `${wss_remote_id}_ticker`,
            }),
        );
    }

    protected _sendUnsubTicker(remote_id: string) {
        const wss_remote_id = remote_id.replace(/_/, "");
        this.remoteIdMap.set(wss_remote_id, remote_id);
        this._wss.send(
            JSON.stringify({
                event: "removeChannel",
                channel: `${wss_remote_id}_ticker`,
            }),
        );
    }

    protected _sendSubTrades(remote_id: string) {
        const wss_remote_id = remote_id.replace(/_/, "");
        this.remoteIdMap.set(wss_remote_id, remote_id);
        this._wss.send(
            JSON.stringify({
                event: "addChannel",
                channel: `${wss_remote_id}_trades`,
            }),
        );
    }

    protected _sendUnsubTrades(remote_id: string) {
        const wss_remote_id = remote_id.replace(/_/, "");
        this.remoteIdMap.set(wss_remote_id, remote_id);
        this._wss.send(
            JSON.stringify({
                event: "removeChannel",
                channel: `${wss_remote_id}_trades`,
            }),
        );
    }

    protected _sendSubLevel2Snapshots(remote_id: string) {
        const wss_remote_id = remote_id.replace(/_/, "");
        this.remoteIdMap.set(wss_remote_id, remote_id);
        this._wss.send(
            JSON.stringify({
                event: "addChannel",
                channel: `${wss_remote_id}_depth`,
            }),
        );
    }

    protected _sendUnsubLevel2Snapshots(remote_id: string) {
        const wss_remote_id = remote_id.replace(/_/, "");
        this.remoteIdMap.set(wss_remote_id, remote_id);
        this._wss.send(
            JSON.stringify({
                event: "removeChannel",
                channel: `${wss_remote_id}_depth`,
            }),
        );
    }

    protected _sendSubCandles = NotImplementedFn;
    protected _sendUnsubCandles = NotImplementedFn;
    protected _sendSubLevel2Updates = NotImplementedFn;
    protected _sendUnsubLevel2Updates = NotImplementedFn;
    protected _sendSubLevel3Snapshots = NotImplementedFn;
    protected _sendUnsubLevel3Snapshots = NotImplementedFn;
    protected _sendSubLevel3Updates = NotImplementedFn;
    protected _sendUnsubLevel3Updates = NotImplementedFn;

    protected _onMessage(raw: any) {
        const msg = JSON.parse(raw);
        const [wssRemoteId, type] = msg.channel.split("_");
        const remoteId = this.remoteIdMap.get(wssRemoteId);

        // prevent errors from crashing the party
        if (msg.success === false) {
            return;
        }

        // tickers
        if (type === "ticker") {
            const market = this._tickerSubs.get(remoteId);
            if (!market) return;

            this._constructTicker(msg, market);
            return;
        }

        // trades
        if (type === "trades") {
            for (const datum of msg.data) {
                const market = this._tradeSubs.get(remoteId);
                if (!market) continue;

                const trade = this._constructTradesFromMessage(datum, market);
                this.emit("trade", trade, market);
            }
            return;
        }

        // level2snapshots
        if (type === "depth") {
            const market = this._level2SnapshotSubs.get(remoteId);
            if (!market) return;

            const snapshot = this._constructLevel2Snapshot(msg, market);
            this.emit("l2snapshot", snapshot, market);
            return;
        }
    }

    protected _constructTicker(data, market) {
        const { last, high, low, vol, buy, sell } = data.ticker;

        if (!this._tickerCache.has(market.id)) {
            this._tickerCache.set(market.id, { last, buy, sell });
        }
        const lastTicker = this._tickerCache.get(market.id);
        const thisTicker = { last, buy, sell };
        if (isEqual(lastTicker, thisTicker)) return;
        this._tickerCache.set(market.id, thisTicker);

        const timestamp = parseInt(data.date);

        const ticker = new Ticker({
            exchange: "ZB",
            base: market.base,
            quote: market.quote,
            timestamp,
            last: last,
            open: undefined,
            high: high,
            low: low,
            volume: vol,
            quoteVolume: undefined,
            change: undefined,
            changePercent: undefined,
            bid: buy,
            ask: sell,
        });
        this.emit("ticker", ticker, market);
    }

    protected _constructTradesFromMessage(datum, market) {
        const { date, price, amount, tid, type } = datum;
        return new Trade({
            exchange: "ZB",
            base: market.base,
            quote: market.quote,
            tradeId: tid.toString(),
            side: type,
            unix: parseInt(date) * 1000,
            price,
            amount,
        });
    }

    protected _constructLevel2Snapshot(msg, market) {
        let { timestamp, asks, bids } = msg;
        asks = asks.map(p => new Level2Point(p[0].toFixed(8), p[1].toFixed(8))).reverse();
        bids = bids.map(p => new Level2Point(p[0].toFixed(8), p[1].toFixed(8)));
        return new Level2Snapshot({
            exchange: "ZB",
            base: market.base,
            quote: market.quote,
            timestampMs: timestamp * 1000,
            asks,
            bids,
        });
    }
}
