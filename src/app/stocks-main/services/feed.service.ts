import { computed, inject, Injectable, signal } from '@angular/core';
import { interval, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { MAX_FEED_HISTORY, POLLING_INTERVAL_MS } from '../constant/feed.config';
import { Feed, FeedsResponse, NormalizedFeed } from '../interfaces/stock.interface';
import { parsePrice } from '../utils/feed-calculations';
import { FeedApiService } from './feed-api.service';

/**
 * Polling mode determines which stocks are being polled.
 * - 'all': Polling all stocks (main screen) - accumulates history for all
 * - 'single': Polling single stock (details screen) - only that stock's history grows
 */
type PollingMode = 'all' | 'single';

/**
 * Facade service responsible for managing feed state, polling, and business logic.
 *
 * This service acts as the "brain" for feed-related operations:
 * - Manages polling lifecycle (start/stop/switch modes)
 * - Caches latest feeds per stock for the main screen
 * - Maintains feed history (max 100 entries) per stock for details screen
 * - Accumulates history for ALL stocks on main screen
 * - Switches to single-stock polling on details screen for efficiency
 *
 * @example
 * // Main screen - start polling all stocks:
 * feedService.startPollingAllStocks([1, 2, 3, 4, 5]);
 * // History accumulates for all stocks
 *
 * // Navigate to details - switch to single stock polling:
 * feedService.switchToSingleStockPolling(1);
 * // Existing history preserved, only stock 1 continues growing
 *
 * // Navigate back to main - resume all stocks polling:
 * feedService.startPollingAllStocks([1, 2, 3, 4, 5]);
 */
@Injectable({
  providedIn: 'root',
})
export class FeedService {
  private readonly feedApiService = inject(FeedApiService);

  /**
   * Latest feed for each stock (for main screen display).
   * Maps stock ID to its most recent normalized feed.
   *
   * @example
   * // Map { 1 => { buyPrice: 150.25, sellPrice: 150.30, stockId: 1, timestamp: Date }, ... }
   */
  private readonly _latestFeedsByStock = signal<Map<number, NormalizedFeed>>(new Map());
  readonly latestFeedsByStock = this._latestFeedsByStock.asReadonly();

  /**
   * Feed history per stock - newest first.
   * Each stock maintains up to MAX_FEED_HISTORY (100) entries.
   * History accumulates for all stocks while on main screen.
   *
   * @example
   * // Map { 1 => [{ buyPrice: 150.30, ... }, { buyPrice: 150.25, ... }, ...], ... }
   */
  private readonly _feedHistoryByStock = signal<Map<number, NormalizedFeed[]>>(new Map());
  readonly feedHistoryByStock = this._feedHistoryByStock.asReadonly();

  /**
   * Last update timestamp from the API response.
   *
   * @example
   * // Date object: 2024-01-15T10:30:00.000Z
   */
  private readonly _lastUpdate = signal<Date | null>(null);
  readonly lastUpdate = this._lastUpdate.asReadonly();

  /** Subject to signal polling stop */
  private stopPolling$ = new Subject<void>();

  /** Current polling mode */
  private pollingMode: PollingMode | null = null;

  /**
   * Starts polling for all stocks (used on main screen).
   * Accumulates feed history for ALL stocks simultaneously.
   * If already polling single stock, stops and restarts with all stocks.
   *
   * @param stockIds - Array of all stock IDs to poll
   *
   * @example
   * // In stocks-list component ngOnInit:
   * const stockIds = stocks.map(s => s.Id); // [1, 2, 3, 4, 5, ...]
   * this.feedService.startPollingAllStocks(stockIds);
   *
   * // All stocks' histories grow simultaneously:
   * // feedService.feedHistoryByStock().get(1) => [feed1, feed2, ...]
   * // feedService.feedHistoryByStock().get(2) => [feed1, feed2, ...]
   */
  startPollingAllStocks(stockIds: number[]): void {
    if (stockIds.length === 0) return;

    // Stop any existing polling
    this.stopPolling();

    this.pollingMode = 'all';

    // Initial fetch
    this.feedApiService
      .getFeedsByIds(stockIds)
      .pipe(tap((response) => this.processFeeds(response)))
      .subscribe();

    // Start interval polling
    interval(POLLING_INTERVAL_MS)
      .pipe(
        takeUntil(this.stopPolling$),
        switchMap(() => this.feedApiService.getFeedsByIds(stockIds)),
        tap((response) => this.processFeeds(response))
      )
      .subscribe();
  }

  /**
   * Switches to single-stock polling (used on details screen).
   * Preserves existing feed history - only the specified stock's history continues to grow.
   * Other stocks' histories are paused but preserved.
   *
   * @param stockId - The stock ID to poll
   *
   * @example
   * // User navigates from main screen to stock 1 details:
   * // Existing history: stock 1 has 45 feeds, stock 2 has 45 feeds
   * feedService.switchToSingleStockPolling(1);
   *
   * // After 10 more seconds:
   * // stock 1 has 55 feeds (still growing)
   * // stock 2 has 45 feeds (paused, preserved)
   */
  switchToSingleStockPolling(stockId: number): void {
    // Stop any existing polling
    this.stopPolling();

    this.pollingMode = 'single';

    // Initial fetch
    this.feedApiService
      .getFeedsByIds([stockId])
      .pipe(tap((response) => this.processFeeds(response)))
      .subscribe();

    // Start interval polling
    interval(POLLING_INTERVAL_MS)
      .pipe(
        takeUntil(this.stopPolling$),
        switchMap(() => this.feedApiService.getFeedsByIds([stockId])),
        tap((response) => this.processFeeds(response))
      )
      .subscribe();
  }

  /**
   * Stops any active polling.
   * Does NOT clear feed history - data is preserved for when polling resumes.
   *
   * @example
   * // In component:
   * this.destroyRef.onDestroy(() => {
   *   this.feedService.stopPolling();
   * });
   */
  stopPolling(): void {
    this.stopPolling$.next();
    this.stopPolling$ = new Subject<void>();
    this.pollingMode = null;
  }

  /**
   * Gets the current polling mode.
   *
   * @returns Current polling mode or null if not polling
   *
   * @example
   * // On main screen:
   * feedService.getPollingMode(); // 'all'
   *
   * // On details screen:
   * feedService.getPollingMode(); // 'single'
   *
   * // Not polling:
   * feedService.getPollingMode(); // null
   */
  getPollingMode(): PollingMode | null {
    return this.pollingMode;
  }

  /**
   * Checks if currently polling.
   *
   * @returns true if polling is active
   */
  isPollingActive(): boolean {
    return this.pollingMode !== null;
  }

  /**
   * Gets the feed history for a specific stock as a computed signal.
   *
   * @param stockId - The stock ID to get history for
   * @returns Computed signal returning feed history array
   *
   * @example
   * // Get computed signal for stock 1:
   * const history = feedService.getFeedHistoryForStock(1);
   * // history() => [{ buyPrice: 150.30, ... }, { buyPrice: 150.25, ... }, ...]
   */
  getFeedHistoryForStock(stockId: number) {
    return computed(() => this._feedHistoryByStock().get(stockId) ?? []);
  }

  /**
   * Gets the latest feed for a specific stock.
   *
   * @param stockId - The stock ID to get latest feed for
   * @returns The latest normalized feed or undefined if not found
   *
   * @example
   * // Get latest feed for stock 1:
   * const latest = feedService.getLatestFeedForStock(1);
   * // Returns: { buyPrice: 150.25, sellPrice: 150.30, stockId: 1, timestamp: Date }
   */
  getLatestFeedForStock(stockId: number): NormalizedFeed | undefined {
    return this._latestFeedsByStock().get(stockId);
  }

  /**
   * Clears all feed history.
   * Used when user logs out or app resets.
   *
   * @example
   * feedService.clearAllFeedHistory();
   */
  clearAllFeedHistory(): void {
    this._feedHistoryByStock.set(new Map());
    this._latestFeedsByStock.set(new Map());
  }

  /**
   * Processes incoming feeds response and updates state.
   * Updates both latest feeds map and feed history.
   *
   * @param response - The API response containing feeds and timestamp
   */
  private processFeeds(response: FeedsResponse): void {
    const timestamp = new Date(response.LastUpdate);
    this._lastUpdate.set(timestamp);

    response.Feeds.forEach((feed) => {
      const normalized = this.normalizeFeed(feed, timestamp);

      // Update latest feed for this stock
      this._latestFeedsByStock.update((map) => {
        const newMap = new Map(map);
        newMap.set(feed.StockId, normalized);
        return newMap;
      });

      // Update feed history for this stock
      this._feedHistoryByStock.update((map) => {
        const newMap = new Map(map);
        const history = newMap.get(feed.StockId) ?? [];

        // Add new feed at the beginning (newest first)
        const updatedHistory = [normalized, ...history];

        // Keep only the last MAX_FEED_HISTORY entries
        if (updatedHistory.length > MAX_FEED_HISTORY) {
          updatedHistory.pop();
        }

        newMap.set(feed.StockId, updatedHistory);
        return newMap;
      });
    });
  }

  /**
   * Normalizes a feed by converting string values to numbers or null.
   * Handles special cases like "-Infinity" strings from the API.
   *
   * @param feed - The raw feed from API
   * @param timestamp - The timestamp to associate with this feed
   * @returns Normalized feed with parsed numeric values
   *
   * @example
   * // Input: { StockId: 1, BuyPrice: '150.25', SellPrice: 150.30 }
   * // Output: { stockId: 1, buyPrice: 150.25, sellPrice: 150.30, timestamp: Date }
   *
   * // Input: { StockId: 1, BuyPrice: '-Infinity', SellPrice: 150.30 }
   * // Output: { stockId: 1, buyPrice: null, sellPrice: 150.30, timestamp: Date }
   */
  private normalizeFeed(feed: Feed, timestamp: Date): NormalizedFeed {
    return {
      buyPrice: parsePrice(feed.BuyPrice),
      sellPrice: parsePrice(feed.SellPrice),
      stockId: feed.StockId,
      timestamp,
    };
  }
}
