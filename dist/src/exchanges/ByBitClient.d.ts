/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
/**
 * Implements the exchange according to API specifications:
 * https://bybit-exchange.github.io/docs/spot/#t-websocket
 *
 */
export declare class ByBitClient extends BasicClient {
    id: number;
    _pingInterval: NodeJS.Timeout;
    constructor({ wssPath, watcherMs, retryTimeoutMs }?: ClientOptions);
    protected _beforeConnect(): void;
    protected _startPing(): void;
    protected _stopPing(): void;
    protected _sendPing(): void;
    protected _sendSubTicker(remote_id: string): void;
    protected _sendUnsubTicker(remote_id: string): void;
    protected _sendSubTrades(remote_id: string): void;
    protected _sendUnsubTrades(remote_id: any): void;
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
    /**
    {
        "v":"929681067596857345",
        "t":1625562619577,
        "p":"34924.15",
        "q":"0.00027",
        "m":true
    }
   */
    protected _constructTrade(datum: any, market: any): Trade;
}
