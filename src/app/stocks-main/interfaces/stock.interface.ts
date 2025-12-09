/**
 * Represents a stock entity from the API.
 *
 * @example
 * const googleStock: Stock = {
 *   Id: 1,
 *   Name: 'Google(Alphabet)',
 *   Symbol: 'GOOG',
 *   PrecisionDigit: 2
 * };
 *
 * @example
 * const appleStock: Stock = {
 *   Id: 2,
 *   Name: 'Apple',
 *   Symbol: 'AAPL',
 *   PrecisionDigit: 3
 * };
 */
export interface Stock {
  /** Unique identifier for the stock */
  Id: number;
  /** Full name of the stock/company */
  Name: string;
  /** Trading symbol (ticker) */
  Symbol: string;
  /** Number of decimal places for price display */
  PrecisionDigit: number;
}

/**
 * Represents a single feed entry from the API.
 * Note: Prices can be string values like "-Infinity" or "+Infinity" in edge cases.
 *
 * @example
 * // Normal feed
 * const normalFeed: Feed = {
 *   BuyPrice: 142.50,
 *   SellPrice: 142.45,
 *   StockId: 1
 * };
 *
 * @example
 * // Feed with infinity value (edge case)
 * const edgeCaseFeed: Feed = {
 *   BuyPrice: "-Infinity",
 *   SellPrice: "-Infinity",
 *   StockId: 13
 * };
 */
export interface Feed {
  /** Buy price - can be number or string (e.g., "-Infinity", "+Infinity") */
  BuyPrice: number | string;
  /** Sell price - can be number or string (e.g., "-Infinity", "+Infinity") */
  SellPrice: number | string;
  /** ID of the stock this feed belongs to */
  StockId: number;
}

/**
 * API response structure for feeds endpoint.
 *
 * @example
 * const response: FeedsResponse = {
 *   Feeds: [
 *     { BuyPrice: 142.50, SellPrice: 142.45, StockId: 1 },
 *     { BuyPrice: 178.25, SellPrice: 178.20, StockId: 2 }
 *   ],
 *   LastUpdate: "2024-01-15T10:30:45.123Z"
 * };
 */
export interface FeedsResponse {
  /** Array of feed entries */
  Feeds: Feed[];
  /** ISO timestamp of when the feed was last updated */
  LastUpdate: string;
}

/**
 * Normalized feed with numeric values for display and calculations.
 * Invalid values (like "-Infinity") are converted to null.
 *
 * @example
 * // Normal normalized feed
 * const feed: NormalizedFeed = {
 *   buyPrice: 142.50,
 *   sellPrice: 142.45,
 *   stockId: 1,
 *   timestamp: new Date('2024-01-15T10:30:45.123Z')
 * };
 *
 * @example
 * // Feed with null prices (from invalid API values)
 * const invalidFeed: NormalizedFeed = {
 *   buyPrice: null,
 *   sellPrice: null,
 *   stockId: 13,
 *   timestamp: new Date('2024-01-15T10:30:45.123Z')
 * };
 */
export interface NormalizedFeed {
  /** Normalized buy price, null if original value was invalid */
  buyPrice: number | null;
  /** Normalized sell price, null if original value was invalid */
  sellPrice: number | null;
  /** ID of the stock this feed belongs to */
  stockId: number;
  /** Timestamp when this feed was received */
  timestamp: Date;
}

/**
 * Stock with its most recent feed data for the main screen.
 *
 * @example
 * // Stock with latest feed data
 * const stockWithFeed: StockWithLatestFeed = {
 *   stock: {
 *     Id: 1,
 *     Name: 'Google(Alphabet)',
 *     Symbol: 'GOOG',
 *     PrecisionDigit: 2
 *   },
 *   latestFeed: {
 *     buyPrice: 142.50,
 *     sellPrice: 142.45,
 *     stockId: 1,
 *     timestamp: new Date('2024-01-15T10:30:45.123Z')
 *   }
 * };
 *
 * @example
 * // Stock without any feed data yet
 * const stockNoFeed: StockWithLatestFeed = {
 *   stock: {
 *     Id: 2,
 *     Name: 'Apple',
 *     Symbol: 'AAPL',
 *     PrecisionDigit: 3
 *   },
 *   latestFeed: null
 * };
 */
export interface StockWithLatestFeed {
  /** The stock entity */
  stock: Stock;
  /** Most recent feed for this stock, or null if no feed received yet */
  latestFeed: NormalizedFeed | null;
}

/**
 * Feed entry with calculated values for the details screen.
 *
 * @example
 * // Feed with all calculations
 * const feedWithCalcs: FeedWithCalculations = {
 *   feed: {
 *     buyPrice: 142.50,
 *     sellPrice: 142.45,
 *     stockId: 1,
 *     timestamp: new Date('2024-01-15T10:30:45.123Z')
 *   },
 *   spread: 0.05,                    // buyPrice - sellPrice = 142.50 - 142.45
 *   sellRateChangePercent: 2.5       // 2.5% increase from previous sell rate
 * };
 *
 * @example
 * // First feed (no previous to compare)
 * const firstFeed: FeedWithCalculations = {
 *   feed: {
 *     buyPrice: 100.00,
 *     sellPrice: 99.50,
 *     stockId: 1,
 *     timestamp: new Date('2024-01-15T10:00:00.000Z')
 *   },
 *   spread: 0.50,
 *   sellRateChangePercent: null      // No previous feed to calculate change
 * };
 *
 * @example
 * // Feed with invalid prices
 * const invalidFeed: FeedWithCalculations = {
 *   feed: {
 *     buyPrice: null,
 *     sellPrice: null,
 *     stockId: 13,
 *     timestamp: new Date()
 *   },
 *   spread: null,                    // Cannot calculate with null prices
 *   sellRateChangePercent: null
 * };
 */
export interface FeedWithCalculations {
  /** The normalized feed data */
  feed: NormalizedFeed;
  /** Spread between buy and sell price (buyPrice - sellPrice), null if prices are invalid */
  spread: number | null;
  /** Percentage change from previous sell rate, null if no previous feed or invalid prices */
  sellRateChangePercent: number | null;
}
