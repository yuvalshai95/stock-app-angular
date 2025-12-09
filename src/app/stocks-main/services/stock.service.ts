import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { Stock } from '../interfaces/stock.interface';
import { StockApiService } from './stock-api.service';

/**
 * Facade service responsible for managing stock state and business logic.
 * Delegates HTTP operations to StockApiService.
 *
 * This service acts as the "brain" for stock-related operations:
 * - Caches stock data in signals for reactive updates
 * - Provides quick lookups via Map structure
 * - Exposes read-only signals for consumers
 *
 * @example
 * // Fetching and accessing stocks:
 * stockService.fetchStocks();
 * const allStocks = stockService.stocks(); // Signal<Stock[]>
 * const apple = stockService.getStockById(1); // Stock | undefined
 */
@Injectable({
  providedIn: 'root',
})
export class StockService {
  private readonly stockApiService = inject(StockApiService);

  /**
   * Cached list of all stocks.
   *
   * @example
   * // After fetchStocks() completes:
   * // [{ Id: 1, Name: 'Apple', Symbol: 'AAPL', PrecisionDigit: 2 }, ...]
   */
  private readonly _stocks = signal<Stock[]>([]);
  readonly stocks = this._stocks.asReadonly();

  /**
   * Map of stock ID to stock for O(1) lookups.
   *
   * @example
   * // After fetchStocks() completes:
   * // Map { 1 => { Id: 1, Name: 'Apple', ... }, 2 => { Id: 2, Name: 'Google', ... } }
   */
  private readonly _stocksMap = signal<Map<number, Stock>>(new Map());
  readonly stocksMap = this._stocksMap.asReadonly();

  /**
   * Fetches all stocks from the API and caches them.
   * Updates both the stocks array and the lookup map.
   *
   * @example
   * // Trigger fetch:
   * stockService.fetchStocks();
   *
   * // After completion, signals are updated:
   * // stockService.stocks() => [{ Id: 1, ... }, { Id: 2, ... }]
   * // stockService.stocksMap() => Map { 1 => {...}, 2 => {...} }
   */
  fetchStocks(): void {
    this.stockApiService
      .getStocks()
      .pipe(
        tap((stocks: Stock[]) => {
          this._stocks.set(stocks);
          const map = new Map<number, Stock>();
          stocks.forEach((stock: Stock) => map.set(stock.Id, stock));
          this._stocksMap.set(map);
        })
      )
      .subscribe();
  }

  /**
   * Gets a stock by its ID from the cache.
   *
   * @param id - The stock ID to look up
   * @returns The stock if found, undefined otherwise
   *
   * @example
   * // Get stock with ID 1:
   * const stock = stockService.getStockById(1);
   * // Returns: { Id: 1, Name: 'Apple', Symbol: 'AAPL', PrecisionDigit: 2 }
   *
   * // Get non-existent stock:
   * const missing = stockService.getStockById(999);
   * // Returns: undefined
   */
  getStockById(id: number): Stock | undefined {
    return this._stocksMap().get(id);
  }
}
