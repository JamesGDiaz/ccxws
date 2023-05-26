/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
/**
 * Implements the exchange according to API specifications:
 *
 */
export declare class BitmartClient extends BasicClient {
    id: number;
    _pingTimer: NodeJS.Timeout;
    _pingTimerTimestamp: number;
    constructor({ wssPath, watcherMs, retryTimeoutMs, }?: ClientOptions);
    protected _beforeConnect(): void;
    protected _startPing(): void;
    protected _stopPing(): void;
    protected _sendPing(): void;
    protected _sendSubTicker(remote_id: string): void;
    protected _sendUnsubTicker(remote_id: string): void;
    protected _sendSubTrades(remote_id: string): void;
    protected _sendUnsubTrades(remote_id: string): void;
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
    protected _processMessage(msg: any): void;
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
    protected _constructTicker(data: any, market: any): Ticker;
    /**
    {
      "price": "40313.34",
      "s_t": 1650052935,
      "side": "sell",
      "size": "0.13710",
      "symbol": "BTC_USDT"
    }
   */
    protected _constructTrade(datum: any, market: any): Trade;
}
