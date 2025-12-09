/**
 * Gets a nested value from an object using a dot-notation path.
 *
 * @param obj - The object to get the value from
 * @param path - The dot-notation path (e.g., 'stock.Name', 'feed.buyPrice')
 * @returns The value at the path, or undefined if not found
 *
 * @example
 * // Simple nested object
 * const data = { stock: { Name: 'Apple', Symbol: 'AAPL' } };
 * getNestedValue(data, 'stock.Name')    // Returns: "Apple"
 * getNestedValue(data, 'stock.Symbol')  // Returns: "AAPL"
 *
 * @example
 * // Deeply nested object
 * const data = { feed: { details: { buyPrice: 150.25 } } };
 * getNestedValue(data, 'feed.details.buyPrice')  // Returns: 150.25
 *
 * @example
 * // Non-existent path
 * const data = { stock: { Name: 'Apple' } };
 * getNestedValue(data, 'stock.Price')      // Returns: undefined
 * getNestedValue(data, 'invalid.path')     // Returns: undefined
 *
 * @example
 * // With null/undefined values in path
 * const data = { stock: null };
 * getNestedValue(data, 'stock.Name')  // Returns: undefined
 *
 * @example
 * // Special $rowIndex path (handled by caller)
 * getNestedValue(data, '$rowIndex')  // Returns: undefined (special case)
 *
 * @example
 * // Real-world usage with StockWithLatestFeed
 * const stockData = {
 *   stock: { Id: 1, Name: 'Google', Symbol: 'GOOG', PrecisionDigit: 2 },
 *   latestFeed: { buyPrice: 142.50, sellPrice: 142.45, stockId: 1 }
 * };
 * getNestedValue(stockData, 'stock.Name')           // Returns: "Google"
 * getNestedValue(stockData, 'stock.PrecisionDigit') // Returns: 2
 * getNestedValue(stockData, 'latestFeed.buyPrice')  // Returns: 142.50
 */
export function getNestedValue<T>(obj: T, path: string): unknown {
  if (path === '$rowIndex') {
    return undefined; // Special case handled by template
  }

  return path.split('.').reduce<unknown>((current, key) => {
    if (current === null || current === undefined) {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, obj);
}
