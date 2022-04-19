/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Ticker } from "../Ticker";
/**
 * Implements the exchange according to API specifications:
 * https://www.aax.com/apidoc/index.html#websocket *
 */
export declare class AaxClient extends BasicClient {
    _pingInterval: NodeJS.Timeout;
    constructor({ wssPath, watcherMs, retryTimeoutMs }?: ClientOptions);
    protected _beforeConnect(): void;
    protected _startPing(): void;
    protected _stopPing(): void;
    protected _sendPing(): void;
    /**
     * This exchange sends all tickers everytime they're updated, there's no sub/unsub model
     **/
    protected _sendSubTicker(remote_id: any): void;
    protected _sendUnsubTicker(remote_id: any): void;
    protected _sendSubTrades: (...args: any[]) => any;
    protected _sendUnsubTrades: (...args: any[]) => any;
    protected _sendSubLevel2Updates: (...args: any[]) => any;
    protected _sendUnsubLevel2Updates: (...args: any[]) => any;
    protected _sendSubCandles: (...args: any[]) => any;
    protected _sendUnsubCandles: (...args: any[]) => any;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    protected _onMessage(raw: any): void;
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
    protected _constructTicker(data: any, market: any): Ticker;
}
