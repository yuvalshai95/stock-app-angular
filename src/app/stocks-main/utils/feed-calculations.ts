import { FeedWithCalculations, NormalizedFeed } from '../interfaces/stock.interface';

/**
 * Calculates the spread between buy and sell prices.
 * Spread = BuyPrice - SellPrice
 *
 * @param buyPrice - The buy price value
 * @param sellPrice - The sell price value
 * @returns The spread value, or null if either price is null
 *
 * @example
 * // Normal calculation
 * calculateSpread(150.50, 150.25)  // Returns: 0.25
 * calculateSpread(100.00, 99.50)   // Returns: 0.50
 *
 * @example
 * // When buy equals sell (no spread)
 * calculateSpread(100.00, 100.00)  // Returns: 0
 *
 * @example
 * // Negative spread (unusual market condition)
 * calculateSpread(99.50, 100.00)   // Returns: -0.50
 *
 * @example
 * // With null values
 * calculateSpread(null, 150.25)    // Returns: null
 * calculateSpread(150.50, null)    // Returns: null
 * calculateSpread(null, null)      // Returns: null
 */
export function calculateSpread(buyPrice: number | null, sellPrice: number | null): number | null {
  if (buyPrice === null || sellPrice === null) {
    return null;
  }
  return buyPrice - sellPrice;
}

/**
 * Calculates the percent change between current and previous sell rate.
 * Formula: ((current - previous) / previous) * 100
 *
 * @param currentSellRate - The current sell rate
 * @param previousSellRate - The previous sell rate
 * @returns The percentage change, or null if calculation is not possible
 *
 * @example
 * // Price increase
 * calculatePercentChange(110.00, 100.00)  // Returns: 10.00 (10% increase)
 * calculatePercentChange(105.00, 100.00)  // Returns: 5.00 (5% increase)
 *
 * @example
 * // Price decrease
 * calculatePercentChange(90.00, 100.00)   // Returns: -10.00 (10% decrease)
 * calculatePercentChange(50.00, 100.00)   // Returns: -50.00 (50% decrease)
 *
 * @example
 * // No change
 * calculatePercentChange(100.00, 100.00)  // Returns: 0.00
 *
 * @example
 * // Large changes
 * calculatePercentChange(200.00, 100.00)  // Returns: 100.00 (doubled)
 * calculatePercentChange(25.00, 100.00)   // Returns: -75.00 (75% decrease)
 *
 * @example
 * // With null values
 * calculatePercentChange(null, 100.00)    // Returns: null
 * calculatePercentChange(110.00, null)    // Returns: null
 *
 * @example
 * // Division by zero protection
 * calculatePercentChange(110.00, 0)       // Returns: null
 */
export function calculatePercentChange(
  currentSellRate: number | null,
  previousSellRate: number | null
): number | null {
  if (currentSellRate === null || previousSellRate === null || previousSellRate === 0) {
    return null;
  }
  return ((currentSellRate - previousSellRate) / previousSellRate) * 100;
}

/**
 * Transforms a list of feeds into feeds with calculated values.
 * Expects feeds in newest-first order.
 *
 * @param feeds - Array of normalized feeds, ordered newest first
 * @returns Array of feeds with spread and percent change calculations
 *
 * @example
 * // Basic usage with three feeds (newest first)
 * const feeds = [
 *   { buyPrice: 152.00, sellPrice: 151.50, stockId: 1, timestamp: new Date('2024-01-15T10:02:00') },
 *   { buyPrice: 151.00, sellPrice: 150.50, stockId: 1, timestamp: new Date('2024-01-15T10:01:00') },
 *   { buyPrice: 150.00, sellPrice: 149.50, stockId: 1, timestamp: new Date('2024-01-15T10:00:00') }
 * ];
 *
 * calculateFeedMetrics(feeds);
 * // Returns:
 * // [
 * //   {
 * //     feed: { buyPrice: 152.00, sellPrice: 151.50, ... },
 * //     spread: 0.50,
 * //     sellRateChangePercent: 0.664 // ((151.50 - 150.50) / 150.50) * 100
 * //   },
 * //   {
 * //     feed: { buyPrice: 151.00, sellPrice: 150.50, ... },
 * //     spread: 0.50,
 * //     sellRateChangePercent: 0.669 // ((150.50 - 149.50) / 149.50) * 100
 * //   },
 * //   {
 * //     feed: { buyPrice: 150.00, sellPrice: 149.50, ... },
 * //     spread: 0.50,
 * //     sellRateChangePercent: null // No previous feed to compare
 * //   }
 * // ]
 *
 * @example
 * // Empty array
 * calculateFeedMetrics([])  // Returns: []
 *
 * @example
 * // Single feed (no percent change possible)
 * const singleFeed = [
 *   { buyPrice: 100.00, sellPrice: 99.50, stockId: 1, timestamp: new Date() }
 * ];
 * calculateFeedMetrics(singleFeed);
 * // Returns: [{ feed: {...}, spread: 0.50, sellRateChangePercent: null }]
 */
export function calculateFeedMetrics(feeds: NormalizedFeed[]): FeedWithCalculations[] {
  return feeds.map((feed, index) => {
    const previousFeed = feeds[index + 1]; // Previous = older = next in array (newest first)

    return {
      feed,
      spread: calculateSpread(feed.buyPrice, feed.sellPrice),
      sellRateChangePercent: previousFeed
        ? calculatePercentChange(feed.sellPrice, previousFeed.sellPrice)
        : null,
    };
  });
}

/**
 * Parses a price value, handling special cases like "-Infinity".
 *
 * @param value - The price value as a number or string
 * @returns The parsed number, or null if the value is not a finite number
 *
 * @example
 * // Normal numeric values
 * parsePrice(150.50)       // Returns: 150.50
 * parsePrice(0)            // Returns: 0
 *
 * @example
 * // String values
 * parsePrice("150.50")     // Returns: 150.50
 * parsePrice("99.99")      // Returns: 99.99
 *
 * @example
 * // Invalid/infinite values
 * parsePrice("-Infinity")  // Returns: null
 * parsePrice("Infinity")   // Returns: null
 * parsePrice(Infinity)     // Returns: null
 * parsePrice(NaN)          // Returns: null
 * parsePrice("invalid")    // Returns: null
 */
export function parsePrice(value: number | string): number | null {
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isFinite(parsed)) {
      return null;
    }
    return parsed;
  }
  if (!isFinite(value)) {
    return null;
  }
  return value;
}
