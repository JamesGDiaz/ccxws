import { BasicClient } from "./BasicClient";
import { BasicMultiClient } from "./BasicMultiClient";
import { SmartWss } from "./SmartWss";
import { Watcher } from "./Watcher";

import { Auction } from "./Auction";
import { BlockTrade } from "./BlockTrade";
import { Candle } from "./Candle";
import { CandlePeriod } from "./CandlePeriod";
import { Level2Point } from "./Level2Point";
import { Level2Snapshot } from "./Level2Snapshots";
import { Level2Update } from "./Level2Update";
import { Level3Point } from "./Level3Point";
import { Level3Snapshot } from "./Level3Snapshot";
import { Level3Update } from "./Level3Update";
import { Ticker } from "./Ticker";
import { Trade } from "./Trade";

import { AaxClient } from "./exchanges/AaxClient";
import { BiboxClient } from "./exchanges/BiboxClient";
import { BinanceClient } from "./exchanges/BinanceClient";
import { BinanceFuturesCoinmClient } from "./exchanges/BinanceFuturesCoinmClient";
import { BinanceFuturesUsdtmClient } from "./exchanges/BinanceFuturesUsdtmClient";
import { BinanceJeClient } from "./exchanges/BinanceJeClient";
import { BinanceUsClient } from "./exchanges/BinanceUsClient";
import { BitfinexClient } from "./exchanges/BitfinexClient";
import { BitforexClient } from "./exchanges/BitforexClient";
import { BitflyerClient } from "./exchanges/BitflyerClient";
import { BithumbClient } from "./exchanges/BithumbClient";
import { BitmartClient } from "./exchanges/BitmartClient";
import { BitmexClient } from "./exchanges/BitmexClient";
import { BitrueClient } from "./exchanges/BitrueClient";
import { BitstampClient } from "./exchanges/BitstampClient";
import { BittrexClient } from "./exchanges/BittrexClient";
import { ByBitClient } from "./exchanges/ByBitClient";
import { CexClient } from "./exchanges/CexClient";
import { CoinbaseProClient } from "./exchanges/CoinbaseProClient";
import { CoinexClient } from "./exchanges/CoinexClient";
import { CryptoComClient } from "./exchanges/CryptoComClient";
import { DeribitClient } from "./exchanges/DeribitClient";
import { DigifinexClient } from "./exchanges/DigifinexClient";
import { ErisXClient } from "./exchanges/ErisxClient";
import { FtxClient } from "./exchanges/FtxClient";
import { FtxUsClient } from "./exchanges/FtxUsClient";
import { GateioClient } from "./exchanges/GateioClient";
import { GeminiClient } from "./exchanges/Geminiclient";
import { HitBtcClient } from "./exchanges/HitBtcClient";
import { HuobiClient } from "./exchanges/HuobiClient";
import { HuobiFuturesClient } from "./exchanges/HuobiFuturesClient";
import { HuobiJapanClient } from "./exchanges/HuobiJapanClient";
import { HuobiKoreaClient } from "./exchanges/HuobiKoreaClient";
import { HuobiSwapsClient } from "./exchanges/HuobiSwapsClient";
import { KrakenClient } from "./exchanges/KrakenClient";
import { KucoinClient } from "./exchanges/KucoinClient";
import { LedgerXClient } from "./exchanges/LedgerXClient";
import { LiquidClient } from "./exchanges/LiquidClient";
import { MexcClient } from "./exchanges/MexcClient";
import { OkxClient } from "./exchanges/OkxClient";
import { PoloniexClient } from "./exchanges/PoloniexClient";
import { UpbitClient } from "./exchanges/UpbitClient";
import { ZbClient } from "./exchanges/ZbClient";

export {
    //
    // Base clients
    BasicClient,
    BasicMultiClient,
    SmartWss,
    Watcher,
    //
    // Event types
    Auction,
    BlockTrade,
    Candle,
    CandlePeriod,
    Level2Point,
    Level2Snapshot,
    Level2Update,
    Level3Point,
    Level3Snapshot,
    Level3Update,
    Ticker,
    Trade,
    //
    // Clients
    AaxClient,
    BiboxClient,
    BinanceClient,
    BinanceFuturesCoinmClient,
    BinanceFuturesUsdtmClient,
    BinanceJeClient,
    BinanceUsClient,
    BitfinexClient,
    BitforexClient,
    BitflyerClient,
    BithumbClient,
    BitmartClient,
    BitmexClient,
    BitrueClient,
    BitstampClient,
    BittrexClient,
    ByBitClient,
    CexClient,
    CoinbaseProClient,
    CoinexClient,
    CryptoComClient,
    DeribitClient,
    DigifinexClient,
    ErisXClient,
    FtxClient,
    FtxUsClient,
    GateioClient,
    GeminiClient,
    HitBtcClient,
    HuobiClient,
    HuobiFuturesClient,
    HuobiSwapsClient,
    HuobiJapanClient,
    HuobiKoreaClient,
    KucoinClient,
    KrakenClient,
    LedgerXClient,
    LiquidClient,
    MexcClient,
    OkxClient,
    PoloniexClient,
    UpbitClient,
    ZbClient,
};

export default {
    Aax: AaxClient,
    Bibox: BiboxClient,
    Binance: BinanceClient,
    BinanceFuturesCoinM: BinanceFuturesCoinmClient,
    BinanceFuturesUsdtM: BinanceFuturesUsdtmClient,
    BinanceJe: BinanceJeClient,
    BinanceUs: BinanceUsClient,
    Bitfinex: BitfinexClient,
    Bitforex: BitforexClient,
    Bitflyer: BitflyerClient,
    Bithumb: BithumbClient,
    Bitmart: BitmartClient,
    BitMEX: BitmexClient,
    Bitrue: BitrueClient,
    Bitstamp: BitstampClient,
    Bittrex: BittrexClient,
    ByBit: ByBitClient,
    Cex: CexClient,
    CoinbasePro: CoinbaseProClient,
    Coinex: CoinexClient,
    CryptoCom: CryptoComClient,
    Deribit: DeribitClient,
    Digifinex: DigifinexClient,
    ErisX: ErisXClient,
    Ftx: FtxClient,
    FtxUs: FtxUsClient,
    Gateio: GateioClient,
    Gemini: GeminiClient,
    HitBTC: HitBtcClient,
    Huobi: HuobiClient,
    HuobiFutures: HuobiFuturesClient,
    HuobiSwaps: HuobiSwapsClient,
    HuobiJapan: HuobiJapanClient,
    HuobiKorea: HuobiKoreaClient,
    Kucoin: KucoinClient,
    Kraken: KrakenClient,
    LedgerX: LedgerXClient,
    Liquid: LiquidClient,
    Mexc: MexcClient,
    OKx: OkxClient,
    Poloniex: PoloniexClient,
    Upbit: UpbitClient,
    Zb: ZbClient,
};
