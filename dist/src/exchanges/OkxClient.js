"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OkxClient = void 0;
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const moment_1 = __importDefault(require("moment"));
const BasicClient_1 = require("../BasicClient");
const Candle_1 = require("../Candle");
const CandlePeriod_1 = require("../CandlePeriod");
const Throttle_1 = require("../flowcontrol/Throttle");
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Level2Update_1 = require("../Level2Update");
const NotImplementedFn_1 = require("../NotImplementedFn");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
/**
 * Implements OKX V5 WebSocket API as defined in
 * https://www.okx.com/docs-v5/en/#websocket-api
 *
 * Limits:
 *    1 connection / second
 *    240 subscriptions / hour
 *
 * Connection will disconnect after 30 seconds of silence
 * it is recommended to send a ping message that contains the
 * message "ping".
 *
 * Order book depth includes maintenance of a checksum for the
 * first 25 values in the orderbook. Each update includes a crc32
 * checksum that can be run to validate that your order book
 * matches the server. If the order book does not match you should
 * issue a reconnect.
 *
 * Refer to: https://www.okx.com/docs-v5/en/#websocket-api-checksum
 */
class OkxClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://ws.okx.com:8443/ws/v5/public", watcherMs, sendThrottleMs = 20, } = {}) {
        super(wssPath, "OKX", undefined, watcherMs);
        this._sendSubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this.candlePeriod = CandlePeriod_1.CandlePeriod._1m;
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasCandles = true;
        this.hasLevel2Snapshots = true;
        this.hasLevel2Updates = true;
        this._sendMessage = (0, Throttle_1.throttle)(this.__sendMessage.bind(this), sendThrottleMs);
    }
    _beforeClose() {
        this._sendMessage.cancel();
    }
    _beforeConnect() {
        this._wss.on("connected", this._startPing.bind(this));
        this._wss.on("disconnected", this._stopPing.bind(this));
        this._wss.on("closed", this._stopPing.bind(this));
    }
    _startPing() {
        clearInterval(this._pingInterval);
        this._pingInterval = setInterval(this._sendPing.bind(this), 15000);
    }
    _stopPing() {
        clearInterval(this._pingInterval);
    }
    _sendPing() {
        if (this._wss) {
            this._wss.send("ping");
        }
    }
    /**
     * Constructs a market argument in a backwards compatible manner where
     * the default is a spot market.
     */
    _marketArg(method, market) {
        return { channel: "tickers", instId: `${market.id}` };
    }
    /**
     * Gets the exchanges interpretation of the candle period
     */
    _candlePeriod(period) {
        switch (period) {
            case CandlePeriod_1.CandlePeriod._1m:
                return "1m";
            case CandlePeriod_1.CandlePeriod._3m:
                return "3m";
            case CandlePeriod_1.CandlePeriod._5m:
                return "5m";
            case CandlePeriod_1.CandlePeriod._15m:
                return "15m";
            case CandlePeriod_1.CandlePeriod._30m:
                return "30m";
            case CandlePeriod_1.CandlePeriod._1h:
                return "1H";
            case CandlePeriod_1.CandlePeriod._2h:
                return "2H";
            case CandlePeriod_1.CandlePeriod._4h:
                return "4H";
            case CandlePeriod_1.CandlePeriod._6h:
                return "6H";
            case CandlePeriod_1.CandlePeriod._12h:
                return "12H";
            case CandlePeriod_1.CandlePeriod._1d:
                return "1D";
            case CandlePeriod_1.CandlePeriod._1w:
                return "1W";
        }
    }
    __sendMessage(msg) {
        this._wss.send(msg);
    }
    _sendSubTicker(remote_id, market) {
        this._sendMessage(JSON.stringify({
            op: "subscribe",
            args: [this._marketArg("ticker", market)],
        }));
    }
    _sendUnsubTicker(remote_id, market) {
        this._sendMessage(JSON.stringify({
            op: "unsubscribe",
            args: [this._marketArg("ticker", market)],
        }));
    }
    _sendSubTrades(remote_id, market) {
        this._sendMessage(JSON.stringify({
            op: "subscribe",
            args: [this._marketArg("trades", market)],
        }));
    }
    _sendUnsubTrades(remote_id, market) {
        this._sendMessage(JSON.stringify({
            op: "unsubscribe",
            args: [this._marketArg("trades", market)],
        }));
    }
    _sendSubCandles(remote_id, market) {
        this._sendMessage(JSON.stringify({
            op: "subscribe",
            args: [this._marketArg("candle" + this._candlePeriod(this.candlePeriod), market)],
        }));
    }
    _sendUnsubCandles(remote_id, market) {
        this._sendMessage(JSON.stringify({
            op: "unsubscribe",
            args: [this._marketArg("candle" + this._candlePeriod(this.candlePeriod), market)],
        }));
    }
    _sendSubLevel2Snapshots(remote_id, market) {
        this._sendMessage(JSON.stringify({
            op: "subscribe",
            args: [this._marketArg("depth5", market)],
        }));
    }
    _sendUnsubLevel2Snapshots(remote_id, market) {
        this._sendMessage(JSON.stringify({
            op: "unsubscribe",
            args: [this._marketArg("depth5", market)],
        }));
    }
    _sendSubLevel2Updates(remote_id, market) {
        this._sendMessage(JSON.stringify({
            op: "subscribe",
            args: [this._marketArg("depth_l2_tbt", market)],
        }));
    }
    _sendUnsubLevel2Updates(remote_id, market) {
        this._sendMessage(JSON.stringify({
            op: "unsubscribe",
            args: [this._marketArg("depth_l2_tbt", market)],
        }));
    }
    _onMessage(raw) {
        if (raw == "pong") {
            return;
        }
        try {
            const msg = JSON.parse(raw.toString());
            this._processMessage(msg);
        }
        catch (ex) {
            this.emit("error", ex);
        }
    }
    _processMessage(msg) {
        // clear semaphore on subscription event reply
        if (msg.event === "subscribe") {
            return;
        }
        // ignore unsubscribe
        if (msg.event === "unsubscribe") {
            return;
        }
        // prevent failed messages from
        if (!msg.data) {
            // eslint-disable-next-line no-console
            console.warn("warn: failure response", JSON.stringify(msg));
            return;
        }
        // tickers
        if (msg.arg.channel.match(/tickers/)) {
            this._processTicker(msg);
            return;
        }
        // trades
        if (msg.arg.channel.match(/trades/)) {
            this._processTrades(msg);
            return;
        }
        // candles
        if (msg.arg.channel.match(/candle/)) {
            this._processCandles(msg);
            return;
        }
        // l2 snapshots
        if (msg.arg.channel.match(/depth5/)) {
            this._processLevel2Snapshot(msg);
            return;
        }
        // l2 updates
        if (msg.arg.channel.match(/depth/)) {
            this._processLevel2Update(msg);
            return;
        }
    }
    /**
   * Process ticker messages in the format
    { table: 'spot/ticker',
      data:
      [ { instrument_id: 'ETH-BTC',
          last: '0.02181',
          best_bid: '0.0218',
          best_ask: '0.02181',
          open_24h: '0.02247',
          high_24h: '0.02262',
          low_24h: '0.02051',
          base_volume_24h: '379522.2418555',
          quote_volume_24h: '8243.729793336415',
          timestamp: '2019-07-15T17:10:55.671Z' } ] }
   */
    _processTicker(msg) {
        for (const datum of msg.data) {
            // ensure market
            const remoteId = datum.instId;
            const market = this._tickerSubs.get(remoteId);
            if (!market)
                continue;
            // construct and emit ticker
            const ticker = this._constructTicker(datum, market);
            this.emit("ticker", ticker, market);
        }
    }
    /**
   * Processes trade messages in the format
    { table: 'spot/trade',
      data:
      [ { instrument_id: 'ETH-BTC',
          price: '0.0218',
          side: 'sell',
          size: '1.1',
          timestamp: '2019-07-15T17:10:56.047Z',
          trade_id: '776432498' } ] }
   */
    _processTrades(msg) {
        for (const datum of msg.data) {
            // ensure market
            const remoteId = datum.instrument_id;
            const market = this._tradeSubs.get(remoteId);
            if (!market)
                continue;
            // construct and emit trade
            const trade = this._constructTrade(datum, market);
            this.emit("trade", trade, market);
        }
    }
    /**
   * Processes a candle message
    {
      "table": "spot/candle60s",
      "data": [
        {
          "candle": [
            "2020-08-10T20:42:00.000Z",
            "0.03332",
            "0.03332",
            "0.03331",
            "0.03332",
            "44.058532"
          ],
          "instrument_id": "ETH-BTC"
        }
      ]
    }
   */
    _processCandles(msg) {
        for (const datum of msg.data) {
            // ensure market
            const remoteId = datum.instrument_id;
            const market = this._candleSubs.get(remoteId);
            if (!market)
                continue;
            // construct and emit candle
            const candle = this._constructCandle(datum);
            this.emit("candle", candle, market);
        }
    }
    /**
   * Processes a level 2 snapshot message in the format:
      { table: 'spot/depth5',
        data: [{
            asks: [ ['0.02192', '1.204054', '3' ] ],
            bids: [ ['0.02191', '15.117671', '3' ] ],
            instrument_id: 'ETH-BTC',
            timestamp: '2019-07-15T16:54:42.301Z' } ] }
   */
    _processLevel2Snapshot(msg) {
        for (const datum of msg.data) {
            // ensure market
            const remote_id = datum.instrument_id;
            const market = this._level2SnapshotSubs.get(remote_id);
            if (!market)
                return;
            // construct snapshot
            const snapshot = this._constructLevel2Snapshot(datum, market);
            this.emit("l2snapshot", snapshot, market);
        }
    }
    /**
   * Processes a level 2 update message in one of two formats.
   * The first message received is the "partial" orderbook and contains
   * 200 records in it.
   *
    { table: 'spot/depth',
          action: 'partial',
          data:
            [ { instrument_id: 'ETH-BTC',
                asks: [Array],
                bids: [Array],
                timestamp: '2019-07-15T17:18:31.737Z',
                checksum: 723501244 } ] }
   *
   * Subsequent calls will include the updates stream for changes to
   * the order book:
   *
      { table: 'spot/depth',
      action: 'update',
      data:
        [ { instrument_id: 'ETH-BTC',
            asks: [Array],
            bids: [Array],
            timestamp: '2019-07-15T17:18:32.289Z',
            checksum: 680530848 } ] }
   */
    _processLevel2Update(msg) {
        const action = msg.action;
        for (const datum of msg.data) {
            // ensure market
            const remote_id = datum.instrument_id;
            const market = this._level2UpdateSubs.get(remote_id);
            if (!market)
                continue;
            // handle updates
            if (action === "partial") {
                const snapshot = this._constructLevel2Snapshot(datum, market);
                this.emit("l2snapshot", snapshot, market);
            }
            else if (action === "update") {
                const update = this._constructLevel2Update(datum, market);
                this.emit("l2update", update, market);
            }
            else {
                // eslint-disable-next-line no-console
                console.error("Unknown action type", msg);
            }
        }
    }
    /**
   * Constructs a ticker from the datum in the format:
      { instrument_id: 'ETH-BTC',
        last: '0.02172',
        best_bid: '0.02172',
        best_ask: '0.02173',
        open_24h: '0.02254',
        high_24h: '0.02262',
        low_24h: '0.02051',
        base_volume_24h: '378400.064179',
        quote_volume_24h: '8226.4437921288',
        timestamp: '2019-07-15T16:10:40.193Z' }
   */
    _constructTicker(data, market) {
        const { last, lastSz, bidPx, bidSz, askPx, askSz, open24h, high24h, low24h, volCcy24h, vol24h, // found in futures
        ts, } = data;
        const change = parseFloat(last) - parseFloat(open24h);
        const changePercent = change / parseFloat(open24h);
        return new Ticker_1.Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: moment_1.default.utc(ts).valueOf(),
            last,
            open: open24h,
            high: high24h,
            low: low24h,
            quoteVolume: volCcy24h || "0",
            volume: vol24h || "0",
            change: change.toFixed(8),
            changePercent: changePercent.toFixed(2),
            bid: bidPx || "0",
            bidVolume: bidSz || "0",
            ask: askPx || "0",
            askVolume: askSz || "0",
        });
    }
    /**
   * Constructs a trade from the message datum in format:
    { instrument_id: 'ETH-BTC',
      price: '0.02182',
      side: 'sell',
      size: '0.94',
      timestamp: '2019-07-15T16:38:02.169Z',
      trade_id: '776370532' }
    */
    _constructTrade(datum, market) {
        const { px, side, sz, timestamp, tradeId } = datum;
        const ts = moment_1.default.utc(timestamp).valueOf();
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId: tradeId,
            side,
            unix: ts,
            price: px,
            amount: sz,
        });
    }
    /**
   * Constructs a candle for the market
      {
        "candle": [
          "2020-08-10T20:42:00.000Z",
          "0.03332",
          "0.03332",
          "0.03331",
          "0.03332",
          "44.058532"
        ],
        "instrument_id": "ETH-BTC"
      }
   * @param {*} datum
   */
    _constructCandle(datum) {
        const [ts, o, h, l, c, vol] = datum.candle;
        return new Candle_1.Candle(moment_1.default.utc(ts).valueOf(), o, h, l, c, vol);
    }
    /**
   * Constructs a snapshot message from the datum in a
   * snapshot message data property. Datum in the format:
   *
      { instrument_id: 'ETH-BTC',
        asks: [ ['0.02192', '1.204054', '3' ] ],
        bids: [ ['0.02191', '15.117671', '3' ] ],
        timestamp: '2019-07-15T16:54:42.301Z' }
   *
   * The snapshot may also come from an update, in which case we need
   * to include the checksum
   *
      { instrument_id: 'ETH-BTC',
        asks: [ ['0.02192', '1.204054', '3' ] ],
        bids: [ ['0.02191', '15.117671', '3' ] ],
        timestamp: '2019-07-15T17:18:31.737Z',
        checksum: 723501244 }

   */
    _constructLevel2Snapshot(datum, market) {
        const asks = datum.asks.map(p => new Level2Point_1.Level2Point(p[0], p[1], p[2]));
        const bids = datum.bids.map(p => new Level2Point_1.Level2Point(p[0], p[1], p[2]));
        const ts = moment_1.default.utc(datum.timestamp).valueOf();
        const checksum = datum.checksum;
        return new Level2Snapshots_1.Level2Snapshot({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestampMs: ts,
            asks,
            bids,
            checksum,
        });
    }
    /**
   * Constructs an update message from the datum in the update
   * stream. Datum is in the format:
    { instrument_id: 'ETH-BTC',
      asks: [ ['0.02192', '1.204054', '3' ] ],
      bids: [ ['0.02191', '15.117671', '3' ] ],
      timestamp: '2019-07-15T17:18:32.289Z',
      checksum: 680530848 }
   */
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    _constructLevel2Update(datum, market) {
        const asks = datum.asks.map(p => new Level2Point_1.Level2Point(p[0], p[1], p[3]));
        const bids = datum.bids.map(p => new Level2Point_1.Level2Point(p[0], p[1], p[3]));
        const ts = moment_1.default.utc(datum.timestamp).valueOf();
        const checksum = datum.checksum;
        return new Level2Update_1.Level2Update({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestampMs: ts,
            asks,
            bids,
            checksum,
        });
    }
}
exports.OkxClient = OkxClient;
//# sourceMappingURL=OkxClient.js.map