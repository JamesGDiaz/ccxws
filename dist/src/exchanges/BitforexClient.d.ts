/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
/**
 * Implements the exchange according to API specifications:
 *
 */
export declare class BitforexClient extends BasicClient {
    id: number;
    _pingInterval: NodeJS.Timeout;
    constructor({ wssPath, watcherMs, retryTimeoutMs, }?: ClientOptions);
    protected _beforeConnect(): void;
    protected _startPing(): void;
    protected _stopPing(): void;
    protected _sendPing(): void;
    protected _sendSubTicker(remote_id: string): void;
    protected _sendUnsubTicker: (...args: any[]) => any;
    protected _sendSubTrades(remote_id: string): void;
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
      "data": {
        "startdate": 1649962809679,
        "enddate": 1650049209679,
        "type": "24H",
        "high": 40817.65,
        "low": 39394.6,
        "last": 40395.17,
        "open": 39667.91,
        "productvol": 1179.193,
        "currencyvol": 47337079.013194,
        "allVol": 0,
        "allCurrencyVol": 0,
        "rate": 0.0183
      },
      "event": "ticker",
      "param": {
        "businessType": "coin-usdc-btc"
      }
    }
  */
    protected _constructTicker(data: any, market: any): Ticker;
    /**
    {
      "price": 40368.27,
      "amount": 0.0146,
      "time": 1650049663495,
      "direction": 1,
      "tid": "1579765408"
    }
   */
    protected _constructTrade(datum: any, market: any): Trade;
}
