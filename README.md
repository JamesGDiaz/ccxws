# CryptoCurrency eXchange WebSockets

[![CI](https://github.com/altangent/ccxws/workflows/Node.js%20CI/badge.svg)](https://github.com/altangent/ccxws/actions?query=workflow%3A%22Node.js+CI%22)
[![Coverage](https://coveralls.io/repos/github/altangent/ccxws/badge.svg?branch=master)](https://coveralls.io/github/altangent/ccxws?branch=master)

A JavaScript library for connecting to realtime public APIs on all cryptocurrency exchanges.

CCXWS provides a standardized eventing interface for connection to public APIs. Currently CCXWS support ticker, trade and orderbook events.

The CCXWS socket client performs automatic reconnection when there are disconnections. It also has silent reconnection logic to assist when no data has been seen by the client but the socket remains open.

CCXWS uses similar market structures to those generated by the CCXT library. This allows interoperability between the RESTful interfaces provided by CCXT and the realtime interfaces provided by CCXWS.

Check out the [FAQS](/FAQ.md) for more inforamtion on common issues you may encounter.

Check out the [CONTRIBUTING guide](/CONTRIBUTING.md) for how to get involved.

## Getting Started

Install ccxws

```bash
npm install ccxws
```

Create a new client for an exchange. Subscribe to the events that you want to listen to by supplying a market.

```javascript
import { BinanceClient } from "ccxws";
const binance = new BinanceClient();

// market could be from CCXT or genearted by the user
const market = {
  id: "BTCUSDT", // remote_id used by the exchange
  base: "BTC", // standardized base symbol for Bitcoin
  quote: "USDT", // standardized quote symbol for Tether
};

// handle trade events
binance.on("trade", trade => console.log(trade));

// handle level2 orderbook snapshots
binance.on("l2snapshot", snapshot => console.log(snapshot));

// subscribe to trades
binance.subscribeTrades(market);

// subscribe to level2 orderbook snapshots
binance.subscribeLevel2Snapshots(market);
```

## Exchanges

| Exchange               | API | Class                     | Ticker   | Trades   | Candles  | OB-L2 Snapshot | OB-L2 Updates | OB-L3 Snapshot | OB-L3 Updates |
| ---------------------- | --- | ------------------------- | -------- | -------- | -------- | -------------- | ------------- | -------------- | ------------- |
| Bibox                  | 1   | BiboxClient               | &#10003; | &#10003; | &#10003; | &#10003;       |               | -              | -             |
| ByBit                  | 1   | ByBitClient               | &#10003; | &#10003; | -        | -              |               | -              | -             |
| Binance                | 1   | BinanceClient             | &#10003; | &#10003; | &#10003; | &#10003;       | &#10003;\*\*  | -              | -             |
| Binance Futures Coin-M | 1   | BinanceFuturesCoinmClient | &#10003; | &#10003; | &#10003; | &#10003;       | &#10003;\*\*  | -              | -             |
| Binance Futures USDT-M | 1   | BinanceFuturesUsdtmClient | &#10003; | &#10003; | &#10003; | &#10003;       | &#10003;\*\*  | -              | -             |
| Binance US             | 1   | BinanceUsClient           | &#10003; | &#10003; | &#10003; | &#10003;       | &#10003;\*\*  | -              | -             |
| Bitfinex               | 2   | BitfinexClient            | &#10003; | &#10003; | -        | -              | &#10003;\*    | -              | &#10003;\*    |
| Bitforex               | 1   | BitforexClient            | &#10003; | &#10003; | -        | -              | -             | -              | -             |
| bitFlyer               | 1   | BitflyerClient            | &#10003; | &#10003; | -        | -              | &#10003;\*\*  | -              | -             |
| Bithumb                | 1   | BithumbClient             | &#10003; | &#10003; | -        | -              | &#10003;\*\*  | -              | -             |
| Bitmart                | 1   | BitmartClient             | &#10003; | &#10003; | -        | -              | -             | -              | -             |
| BitMEX                 | 1   | BitmexClient              | &#10003; | &#10003; | &#10003; | -              | &#10003;\*    | -              | -             |
| Bitrue                 | 1   | BitrueClient              | &#10003; | &#10003; | -        | -              | -             | -              | -             |
| Bitstamp               | 2   | BitstampClient            | &#10003; | &#10003; | -        | &#10003;       | &#10003;\*\*  | -              | -             |
| Bittrex                | 3   | BittrexClient             | &#10003; | &#10003; | &#10003; | -              | &#10003;\*    | -              | -             |
| Cex.io                 | 1   | CexClient                 | &#10003; | &#10003; | &#10003; | &#10003;       |               | -              | -             |
| Coinbase Pro           | 1   | CoinbaseProClient         | &#10003; | &#10003; | -        | -              | &#10003;\*    | -              | &#10003;      |
| Coinex                 | 1   | CoinexClient              | &#10003; | &#10003; | &#10003; | -              | &#10003;\*    | -              | -             |
| Crypto.com             | 2   | CryptoComClient           | &#10003; | &#10003; | -        | -              | -             | -              | -             |
| Deribit                | 2   | DeribitClient             | &#10003; | &#10003; | &#10003; | -              | &#10003;\*    | -              | -             |
| Digifinex              | 1   | DigifinexClient           | &#10003; | &#10003; | -        | -              | &#10003;\*    | -              | -             |
| ErisX                  | 3.4 | ErisXClient               | -        | &#10003; | -        | -              | -             | -              | &#10003;\*    |
| FTX                    | 1   | FtxClient                 | &#10003; | &#10003; | -        | -              | &#10003;\*    | -              | -             |
| FTXUS                  | 1   | FtxUsClient               | &#10003; | &#10003; | -        | -              | &#10003;\*    | -              | -             |
| Gate.io                | 3   | GateioClient              | &#10003; | &#10003; | -        | -              | &#10003;\*    | -              | -             |
| Gemini                 | 1   | GeminiClient              | -        | &#10003; | -        | -              | &#10003;\*    | -              | -             |
| HitBTC                 | 2   | HitBtcClient              | &#10003; | &#10003; | &#10003; | -              | &#10003;\*    | -              | -             |
| Huobi Global           | 1   | HuobiClient               | &#10003; | &#10003; | &#10003; | &#10003;       | -             | -              | -             |
| Huobi Global Futures   | 1   | HuobiFuturesClient        | &#10003; | &#10003; | &#10003; | &#10003;       | &#10003;\*    | -              | -             |
| Huobi Global Swaps     | 1   | HuobiSwapsClient          | &#10003; | &#10003; | &#10003; | &#10003;       | &#10003;\*    | -              | -             |
| Huobi Japan            | 1   | HuobiJapanClient          | &#10003; | &#10003; | &#10003; | &#10003;       | -             | -              | -             |
| Huobi Korea            | 1   | HuobiKoreaClient          | &#10003; | &#10003; | &#10003; | &#10003;       | -             | -              | -             |
| KuCoin                 | 2   | KucoinClient              | &#10003; | &#10003; | &#10003; | -              | &#10003;\*\*  | -              | &#10003;\*    |
| Kraken                 | 0   | KrakenClient              | &#10003; | &#10003; | &#10003; | -              | &#10003;\*    | -              | -             |
| LedgerX                | 1   | LedgerXClient             | -        | &#10003; | -        | -              | -             | -              | &#10003;\*    |
| Liquid                 | 2   | LiquidClient              | &#10003; | &#10003; | -        | -              | &#10003;      | -              | -             |
| Mexc                   | 2   | MexcClient                | &#10003; | &#10003; | -        | -              | -             | -              | -             |
| OKx                    | 3   | OkxClient                 | &#10003; | &#10003; | &#10003; | &#10003;       | &#10003;\*    | -              | -             |
| Poloniex               | 2   | PoloniexClient            | &#10003; | &#10003; | -        | -              | &#10003;\*    | -              | -             |
| Upbit                  | 1   | UpbitClient               | &#10003; | &#10003; | -        | &#10003;       | -             | -              | -             |
| ZB                     | 1   | ZbClient                  | &#10003; | &#10003; | -        | &#10003;       | -             | -              | -             |

Notes:

- &#10003;\* broadcasts a snapshot event at startup
- &#10003;\*\* broadcasts a snapshot by using the REST API

## Definitions

Trades - A maker/taker match has been made. Broadcast as an aggregated event.

Orderbook level 2 - has aggregated price points for bids/asks that include the price and total volume at that point. Some exchange may include the number of orders making up the volume at that price point.

Orderbook level 3 - this is the most granual order book information. It has raw order information for bids/asks that can be used to build aggregated volume information for the price points.

## API

### `Market`

Markets are used as input to many of the client functions. Markets can be generated and stored by you the developer or loaded from the CCXT library.

These properties are required by CCXWS.

- `id: string` - the identifier used by the remote exchange
- `base: string` - the normalized base symbol for the market
- `quote: string` - the normalized quote symbol for the market
- `type: string` - the type of market: `spot`, `futures`, `option`, `swap`

### `Client`

A websocket client that connects to a specific exchange. There is an implementation of this class for each exchange that governs the specific rules for managing the realtime connections to the exchange. You must instantiate the specific exchanges client to conncet to the exchange.

```javascript
const binance = new ccxws.Binance();
const coinbase = new ccxws.CoinbasePro();
```

Clients can be instantiated with an options object that has several properties properties:

- `wssPath: string` - allows customization of the web socket path. When this is configured, additional rules surrounding connection may be ignored.
- `watcherMs: number` - allows customization of the reconnection watcher. This value is the duration of time that must pass without a message for a reconnection is peroformed. This value can be customized depending on the type and liquidity of markets that you are subscribing to.
- `apiKey: string` - any API key needed for the exchange
- `apiSecret: string` - any API secret needed for the exchange

#### Events

Subscribe to events by addding an event handler to the client `.on(<event>)` method of the client. Multiple event handlers can be added for the same event.

Once an event handler is attached you can start the stream using the `subscribe<X>` methods.

All events emit the market used to subscribe to the event as a second property of the event handler.

```javascript
binance.on("error", err => console.error(err));
binance.on("trades", (trade, market) => console.log(trade, market));
binance.on("l2snapshot", (snapshot, market) => console.log(snapshot, market));
```

##### `error` emits `Error`

You must subscribe to the `error` event to prevent the process exiting. More information in the [Node.js Events Documentation](https://nodejs.org/dist/latest-v10.x/docs/api/events.html#events_error_events)

> If an EventEmitter does not have at least one listener registered for the 'error' event, and an 'error' event is emitted, the error is thrown, a stack trace is printed, and the Node.js process exits.

##### `ticker` emits `Ticker`, `Market`

Fired when a ticker update is received. Returns an instance of `Ticker` and the `Market` used to subscribe to the event.

##### `trade` emits `Trade`, `Market`

Fired when a trade is received. Returns an instance of `Trade` and the `Market` used to subscribe to the event.

##### `candle` emits `Candle`, `Market`

Fired when a candle is received. Returns an instance of `Candle` and the `Market` used to subscribe to the event.

##### `l2snapshot` emits `Level2Snapshot`, `Market`

Fired when a orderbook level 2 snapshot is received. Returns an instance of `Level2Snapshot` and the `Market` used to subscribe to the event.

The level of detail will depend on the specific exchange and may include 5/10/20/50/100/1000 bids and asks.

This event is also fired when subscribing to the `l2update` event on many exchanges.

##### `l2update` emits `Level2Update`, `Market`

Fired when a orderbook level 2 update is recieved. Returns an instance of `Level2Update` and the `Market` used to subscribe to the event.

Subscribing to this event may trigger an initial `l2snapshot` event for many exchanges.

##### `l3snapshot` emits `Level3Snapshot`, `Market`

Fired when a orderbook level 3 snapshot is received. Returns an instance of `Level3Snapshot` and the `Market` used to subscribe to the event.

##### `l3update` emits `Level3Update`, `Market`

Fired when a level 3 update is recieved. Returns an instance of `Level3Update` and the `Market` used to subscribe to the event.

#### Connection Events

Clients emit events as their state changes.

```
   +-------+
   |       |
   | start |
   |       |
   +---+---+
       |
       |
       |
       | subscribe
       |
       |
       |
+------v-------+       initiate
|              |       reconnect
|  connecting  <------------------------+
|              |                        |
+------+-------+                        |
       |                                |
       |                        +-------+-------+
       |                        |               |
       | socket                 | disconnected  |
       | open                   |               |
       |                        +-------^-------+
       |                                |
+------v-------+                        |
|              |                        |
|  connected   +------------------------+
|              |        socket
+------+-------+        closed
       |
       |
       |
       | close
       | requested
       |
       |
       |
+------v-------+                  +--------------+
|              |                  |              |
|   closing    +------------------>    closed    |
|              |     socket       |              |
+--------------+     closed       +--------------+
```

##### `connecting`

Fires prior to a socket initiating the connection. This event also fires when a reconnection starts.

##### `connected`

Fires when a socket has connected. This event will also fire for reconnection completed.

##### `disconnected`

Fires when a socket prematurely disconnects. Automatic reconnection will be triggered. The expected
flow is `disconnected -> connecting -> connected`.

##### `closing`

Fires when the client is preparing to close its connection(s). This event is not fired during reconnections.

##### `closed`

Fires when the client has closed its connection(s). This event is not fired during reconnections, it is fired when the `close` method is called and the connection(s) are successfully closed.

##### `reconnecting`

Fires when a socket has initiated the reconnection process due to inactivity. This is fired at the start of the reconnection process `reconnecting -> closing -> closed -> connecting -> connected`

#### Methods

##### `subscribeTicker(market): void`

Subscribes to a ticker feed for a market. This method will cause the client to emit `ticker` events that have a payload of the `Ticker` object.

##### `unsubscribeTicker(market): void`

Unsubscribes from a ticker feed for a market.

##### `subscribeTrades(market): void`

Subscribes to a trade feed for a market. This method will cause the client to emit `trade` events that have a payload of the `Trade` object.

##### `unsubscribeTrades(market): void`

Unsubscribes from a trade feed for a market.

\*For some exchanges, calling unsubscribe may cause a temporary disruption in all feeds.

##### `subscribeCandles(market): void`

Subscribes to a candle feed for a market. This method will cause the client to emit `candle` events that have a payload of the `Candle` object. Set the
`candlePeriod` property of the client to control which candle is returned by the feed.

##### `unsubscribeCandles(market): void`

Unsubscribes from a candle feed for a market.

\*For some exchanges, calling unsubscribe may cause a temporary disruption in all feeds.

##### `subscribeLevel2Snapshots(market): void`

Subscribes to the orderbook level 2 snapshot feed for a market. This method will cause the client to emit `l2snapshot` events that have a payload of the `Level2Snaphot` object.

This method is a no-op for exchanges that do not support level 2 snapshot subscriptions.

##### `unsubscribeLevel2Snapshots(market): void`

Unbusbscribes from the orderbook level 2 snapshot for a market.

\*For some exchanges, calling unsubscribe may cause a temporary disruption in all feeds.

##### `subscribeLevel2Updates(market): void`

Subscribes to the orderbook level 2 update feed for a market. This method will cause the client to emit `l2update` events that have a payload of the `Level2Update` object.

This method is a no-op for exchanges that do not support level 2 snapshot subscriptions.

##### `unsubscribeLevel2Updates(market): void`

Unbusbscribes from the orderbook level 2 updates for a market.

\*For some exchanges, calling unsubscribe may cause a temporary disruption in all feeds.

##### `subscribeLevel3Snapshots(market): void`

Subscribes to the orderbook level 3 snapshot feed for a market. This method will cause the client to emit `l3snapshot` events that have a payload of the `Level3Snaphot` object.

This method is a no-op for exchanges that do not support level 2 snapshot subscriptions.

##### `unsubscribeLevel3Snapshots(market): void`

Unbusbscribes from the orderbook level 3 snapshot for a market.

\*For some exchanges, calling unsubscribe may cause a temporary disruption in all feeds.

##### `subscribeLevel3Updates(market): void`

Subscribes to the orderbook level 3 update feed for a market. This method will cause the client to emit `l3update` events that have a payload of the `Level3Update` object.

This method is a no-op for exchanges that do not support level 3 snapshot subscriptions.

##### `unsubscribeLevel3Updates(market): void`

Unbusbscribes from the orderbook level 3 updates for a market.

\*For some exchanges, calling unsubscribe may cause a temporary disruption in all feeds.

### `Ticker`

The ticker class is the result of a `ticker` event.

#### Properties

- `exchange: string` - the name of the exchange
- `base: string` - the normalized base symbol for the market
- `quote: string` - the normalized quote symbol for the market
- `timestamp: int` - the unix timestamp in milliseconds
- `last: string` - the last price of a match that caused a tick
- `open: string` - the price 24 hours ago
- `low: string` - the highest price in the last 24 hours
- `high: string` - the lowest price in the last 24 hours
- `volume: string` - the base volume traded in the last 24 hours
- `quoteVolume: string` - the quote volume traded in the last 24 hours
- `change: string` - the price change (last - open)
- `changePercent: string` - the price change in percent (last - open) / open \* 100
- `bid: string` - the best bid price
- `bidVolume: string` - the volume at the best bid price
- `ask: string` - the best ask price
- `askVolume: string` - the volume at the best ask price

### `Trade`

The trade class is the result of a `trade` event emitted from a client.

#### Properties

- `exchange: string` - the name of the exchange
- `base: string` - the normalized base symbol for the market
- `quote: string` - the normalized quote symbol for the market
- `tradeId: string` - the unique trade identifer from the exchanges feed
- `unix: int` - the unix timestamp in milliseconds for when the trade executed
- `side: string` - whether the buyer `buy` or seller `sell` was the maker for the match
- `price: string` - the price at which the match executed
- `amount: string` - the amount executed in the match
- `buyOrderId: string` - the order id of the buy side
- `sellOrderId: string` - the order id of the sell side

### `Candle`

The candle class is the result of a `candle` event emitted from a client.

#### Properties

- `timestampMs: int` - the unix timestamp in milliseconds for the candle
- `open: string` - the open price for the period
- `high: string` - the high price for the period
- `low: string` - the low price for the period
- `close: string` - the close price for the period
- `volume: string` - the volume exchanged during the period

### `Level2Point`

Represents a price point in a level 2 orderbook

#### Properties

- `price: string` - price
- `size: string` - aggregated volume for all orders at this price point
- `count: int` - optional number of orders aggregated into the price point

### `Level2Snapshot`

The level 2 snapshot class is the result of a `l2snapshot` or `l2update` event emitted from the client.

#### Properties

- `exchange: string` - the name of the exchange
- `base: string` - the normalized base symbol for the market
- `quote: string` - the normalized quote symbol for the market
- `timestampMs: int` - optional timestamp in milliseconds for the snapshot
- `sequenceId: int` - optional sequence identifier for the snapshot
- `asks: [Level2Point]` - the ask (seller side) price points
- `bids: [Level2Point]` - the bid (buyer side) price points

### `Level2Update`

The level 2 update class is a result of a `l2update` event emitted from the client. It consists of a collection of bids/asks even exchanges broadcast single events at a time.

#### Properties

- `exchange: string` - the name of the exchange
- `base: string` - the normalized base symbol for the market
- `quote: string` - the normalized quote symbol for the market
- `timestampMs: int` - optional timestamp in milliseconds for the snapshot
- `sequenceId: int` - optional sequence identifier for the snapshot
- `asks: [Level2Point]` - the ask (seller side) price points
- `bids: [Level2Point]` - the bid (buyer side) price points

### `Level3Point`

Represents a price point in a level 3 orderbook

#### Properties

- `orderId: string` - identifier for the order
- `price: string` - price
- `size: string` - volume of the order
- `meta: object` - optional exchange specific metadata with additional information about the update.

### `Level3Snapshot`

The level 3 snapshot class is the result of a `l3snapshot` or `l3update` event emitted from the client.

#### Properties

- `exchange: string` - the name of the exchange
- `base: string` - the normalized base symbol for the market
- `quote: string` - the normalized quote symbol for the market
- `timestampMs: int` - optional timestamp in milliseconds for the snapshot
- `sequenceId: int` - optional sequence identifier for the snapshot
- `asks: [Level3Point]` - the ask (seller side) price points
- `bids: [Level3Point]` - the bid (buyer side) price points

### `Level3Update`

The level 3 update class is a result of a `l3update` event emitted from the client. It consists of a collection of bids/asks even exchanges broadcast single events at a time.

Additional metadata is often provided in the `meta` property that has more detailed information that is often required to propertly manage a level 3 orderbook.

#### Properties

- `exchange: string` - the name of the exchange
- `base: string` - the normalized base symbol for the market
- `quote: string` - the normalized quote symbol for the market
- `timestampMs: int` - optional timestamp in milliseconds for the snapshot
- `sequenceId: int` - optional sequence identifier for the snapshot
- `asks: [Level3Point]` - the ask (seller side) price points
- `bids: [Level3Point]` - the bid (buyer side) price points

## Caveats

### Snapshots broadcast using the REST API

For exchanges which request the Level2Snapshot or Level3Snapshot over REST, there can be a race condition where messages are missed between the snapshot and the first update, for example the snapshot `sequenceId` is 100 and the first update's `sequenceId` is 105.

For a not-so-reliable fix you can monkey-patch a delay so that the snapshot is requested after subscribing to updates to better ensure the snapshot arrives with a `sequenceId` >= the first update that arrives. See example below:

```js
const REST_DELAY_MS = 500;
client._originalRequestLevel2Snapshot = client._requestLevel2Snapshot;
client._requestLevel2Snapshot = market =>
  setTimeout(() => client._originalRequestLevel2Snapshot(market), REST_DELAY_MS);
```

Otherwise you should be prepared to manually verify the `sequenceId` if possible, and request the snapshot again if there is a gap between the snapshot and the first update by calling `client.requestLevel2Snapshot(market)` again.
