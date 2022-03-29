/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
/**
 * Implements the exchange according to API specifications:
 *
 */
export declare class BitrueClient extends BasicClient {
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
    protected _onMessageInf(err: any, raw: any): void;
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
    protected _constructTicker(data: any, market: any): Ticker;
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
    protected _constructTrade(datum: any, market: any): Trade;
}
