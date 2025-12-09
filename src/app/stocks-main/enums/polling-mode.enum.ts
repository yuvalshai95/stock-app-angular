/**
 * Polling mode determines which stocks are being polled.
 * - ALL: Polling all stocks (main screen) - accumulates history for all
 * - SINGLE: Polling single stock (details screen) - only that stock's history grows
 */
export enum PollingMode {
  /** Polling all stocks (main screen) - accumulates history for all */
  ALL = 'all',
  /** Polling single stock (details screen) - only that stock's history grows */
  SINGLE = 'single',
}
