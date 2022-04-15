/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
/**
 * Implements the exchange according to API specifications:
 *
 */
export declare class MexcClient extends BasicClient {
    id: number;
    _pingInterval: NodeJS.Timeout;
    constructor({ wssPath, watcherMs, retryTimeoutMs, }?: ClientOptions);
    protected _beforeConnect(): void;
    protected _startPing(): void;
    protected _stopPing(): void;
    protected _sendPing(): void;
    protected _sendSubTicker(remote_id: string): void;
    protected _sendSubTrades(remote_id: string): void;
    protected _sendUnsubTicker: (...args: any[]) => any;
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
      "t": 1649990370496,
      "p": "0.06241",
      "q": "114.68",
      "T": 2
    }
  */
    protected _constructTicker(data: any, market: any): Ticker;
    /**
    {
      "t": 1649990370496,
      "p": "0.06241",
      "q": "114.68",
      "T": 2
    }
   */
    protected _constructTrade(datum: any, market: any): Trade;
}
