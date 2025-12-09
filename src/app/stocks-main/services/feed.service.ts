import { computed, inject, Injectable, signal } from '@angular/core';
import { interval, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { MAX_FEED_HISTORY, POLLING_INTERVAL_MS } from '../constant/feed.config';
import { Feed, FeedsResponse, NormalizedFeed } from '../interfaces/stock.interface';
import { parsePrice } from '../utils/feed-calculations';
import { FeedApiService } from './feed-api.service';

/**
 * Facade service responsible for managing feed state, polling, and business logic.
 * Delegates HTTP operations to FeedApiService.
 *
 * This service acts as the "brain" for feed-related operations:
 * - Manages polling lifecycle (start/stop)
 * - Caches latest feeds per stock for the main screen
 * - Maintains feed history (max 100 entries) per stock for details screen
 * - Normalizes raw feed data from API
 *
 * @example
 * // Start polling all feeds (main screen):
 * feedService.startPollingAllFeeds();
 * const latestFeeds = feedService.latestFeedsByStock(); // Signal<Map<number, NormalizedFeed>>
 *
 * // Start polling single stock (details screen):
 * feedService.startPollingStockFeeds(1);
 * const history = feedService.feedHistoryByStock().get(1); // NormalizedFeed[]
 *
 * // Stop polling on component destroy:
 * feedService.stopPolling();
 */
@Injectable({
  providedIn: 'root',
})
export class FeedService {
  private readonly feedApiService = inject(FeedApiService);

  /**
   * Latest feed for each stock (for main screen).
   * Maps stock ID to its most recent normalized feed.
   *
   * @example
   * // Map { 1 => { buyPrice: 150.25, sellPrice: 150.30, stockId: 1, timestamp: Date }, ... }
   */
  private readonly _latestFeedsByStock = signal<Map<number, NormalizedFeed>>(new Map());
  readonly latestFeedsByStock = this._latestFeedsByStock.asReadonly();

  /**
   * Feed history per stock (for details screen) - newest first.
   * Each stock maintains up to MAX_FEED_HISTORY (100) entries.
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

  /** Flag to prevent multiple polling instances */
  private isPolling = false;

  /**
   * Starts polling for all stocks feeds (used on main screen).
   * Fetches immediately, then every POLLING_INTERVAL_MS (1 second).
   *
   * @example
   * // In component ngOnInit:
   * this.feedService.startPollingAllFeeds();
   *
   * // Feeds are automatically updated every second:
   * // feedService.latestFeedsByStock() => Map { 1 => {...}, 2 => {...}, ... }
   */
  startPollingAllFeeds(): void {
    if (this.isPolling) return;
    this.isPolling = true;

    // Initial fetch
    this.feedApiService
      .getAllFeeds()
      .pipe(tap((response) => this.processFeeds(response)))
      .subscribe();

    // Start interval polling
    interval(POLLING_INTERVAL_MS)
      .pipe(
        takeUntil(this.stopPolling$),
        switchMap(() => this.feedApiService.getAllFeeds()),
        tap((response) => this.processFeeds(response))
      )
      .subscribe();
  }

  /**
   * Starts polling for a specific stock's feeds (used on details screen).
   * Fetches immediately, then every POLLING_INTERVAL_MS (1 second).
   *
   * @param stockId - The stock ID to poll feeds for
   *
   * @example
   * // In stock details component ngOnInit:
   * this.feedService.startPollingStockFeeds(1);
   *
   * // Feed history builds up over time:
   * // feedService.feedHistoryByStock().get(1) => [newest, ..., oldest] (max 100)
   */
  startPollingStockFeeds(stockId: number): void {
    if (this.isPolling) return;
    this.isPolling = true;

    // Initial fetch
    this.feedApiService
      .getFeedsByStockId(stockId)
      .pipe(tap((response) => this.processFeeds(response)))
      .subscribe();

    // Start interval polling
    interval(POLLING_INTERVAL_MS)
      .pipe(
        takeUntil(this.stopPolling$),
        switchMap(() => this.feedApiService.getFeedsByStockId(stockId)),
        tap((response) => this.processFeeds(response))
      )
      .subscribe();
  }

  /**
   * Stops any active polling.
   * Should be called in component ngOnDestroy.
   *
   * @example
   * // In component:
   * this.destroyRef.onDestroy(() => {
   *   this.feedService.stopPolling();
   * });
   */
  stopPolling(): void {
    this.stopPolling$.next();
    this.isPolling = false;
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
   * Clears feed history for a specific stock.
   * Used when navigating to stock details to start fresh.
   *
   * @param stockId - The stock ID to clear history for
   *
   * @example
   * // Clear history before starting new polling session:
   * feedService.clearFeedHistory(1);
   * feedService.startPollingStockFeeds(1);
   */
  clearFeedHistory(stockId: number): void {
    this._feedHistoryByStock.update((map) => {
      const newMap = new Map(map);
      newMap.delete(stockId);
      return newMap;
    });
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
