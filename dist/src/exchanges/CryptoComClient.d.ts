/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Trade } from "../Trade";
import { CancelableFn } from "../flowcontrol/Fn";
export declare type CryptoComClientOptions = ClientOptions & {
    sendThrottleMs?: number;
    restThrottleMs?: number;
};
/**
 * Implements the exchange according to API specifications:
 * https://bybit-exchange.github.io/docs/spot/#t-websocket
 *
 */
export declare class CryptoComClient extends BasicClient {
    _pingInterval: NodeJS.Timeout;
    readonly sendThrottleMs: number;
    readonly restThrottleMs: number;
    private _tickerCache;
    protected _sendMessage: CancelableFn;
    constructor({ wssPath, watcherMs, retryTimeoutMs, sendThrottleMs, }?: CryptoComClientOptions);
    protected _beforeClose(): void;
    protected _beforeConnect(): void;
    protected __sendMessage(msg: any): void;
    protected _sendPing(id: any): void;
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
    protected _constructTicker(data: any, market: any): void;
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
    protected _constructTrade(datum: any, market: any): Trade;
}
