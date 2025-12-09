import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to return CSS class name based on numeric value sign.
 * Used for applying dynamic styling to elements based on positive/negative values.
 *
 * @example
 * // Positive value
 * {{ 25.5 | changeClass }}
 * // Output: "positive"
 *
 * @example
 * // Negative value
 * {{ -10.25 | changeClass }}
 * // Output: "negative"
 *
 * @example
 * // Zero value
 * {{ 0 | changeClass }}
 * // Output: "neutral"
 *
 * @example
 * // Null value
 * {{ null | changeClass }}
 * // Output: "neutral"
 *
 * @example
 * // Usage with class binding
 * <td [class.positive]="(value | changeClass) === 'positive'"
 *     [class.negative]="(value | changeClass) === 'negative'"
 *     [class.neutral]="(value | changeClass) === 'neutral'">
 */
@Pipe({
  name: 'changeClass',
})
export class ChangeClassPipe implements PipeTransform {
  /**
   * Determines the CSS class name based on the numeric value's sign.
   *
   * @param value - The numeric value to evaluate
   * @returns 'positive' for values > 0, 'negative' for values < 0, 'neutral' otherwise
   *
   * @example
   * transform(25.5)       // Returns: "positive"
   * transform(-10.25)     // Returns: "negative"
   * transform(0)          // Returns: "neutral"
   * transform(0.001)      // Returns: "positive"
   * transform(-0.001)     // Returns: "negative"
   * transform(null)       // Returns: "neutral"
   * transform(undefined)  // Returns: "neutral"
   * transform("invalid")  // Returns: "neutral"
   */
  transform(value: unknown): string {
    if (value === null || value === undefined || typeof value !== 'number' || value === 0) {
      return 'neutral';
    }
    return value > 0 ? 'positive' : 'negative';
  }
}
