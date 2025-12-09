/**
 * Feed polling and history configuration constants.
 *
 * These values control how the feed service fetches and stores feed data.
 */

/**
 * Interval in milliseconds between feed polling requests.
 *
 * @example
 * // With POLLING_INTERVAL_MS = 1000:
 * // - First fetch at t=0ms
 * // - Second fetch at t=1000ms
 * // - Third fetch at t=2000ms
 * // - etc.
 *
 * @default 1000 (1 second)
 */
export const POLLING_INTERVAL_MS = 1000;

/**
 * Maximum number of feed entries to keep in history per stock.
 * When this limit is reached, the oldest feed is removed when a new one arrives.
 *
 * @example
 * // With MAX_FEED_HISTORY = 100:
 * // - Feeds 1-100 are stored
 * // - When feed 101 arrives:
 * //   - Feed 1 (oldest) is removed
 * //   - Feed 101 is added at the beginning (newest first)
 * // - History always contains at most 100 feeds
 *
 * @default 100
 */
export const MAX_FEED_HISTORY = 100;
