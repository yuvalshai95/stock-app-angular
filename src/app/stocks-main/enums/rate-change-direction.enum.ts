/**
 * Direction of rate change compared to previous value.
 * - UP: Current value is higher than previous
 * - DOWN: Current value is lower than previous
 * - NEUTRAL: Current value equals previous, or no previous value exists
 *
 * @example
 * // Price went from 100 to 110
 * const direction = RateChangeDirection.UP;
 *
 * // Price went from 100 to 90
 * const direction = RateChangeDirection.DOWN;
 *
 * // Price stayed at 100, or first feed received
 * const direction = RateChangeDirection.NEUTRAL;
 */
export enum RateChangeDirection {
  /** Current value is higher than previous */
  UP = 'up',
  /** Current value is lower than previous */
  DOWN = 'down',
  /** Current value equals previous, or no previous value exists */
  NEUTRAL = 'neutral',
}
