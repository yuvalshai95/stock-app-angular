import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to format percent values with sign prefix.
 * Returns '-' for null/undefined/non-numeric values.
 *
 * @example
 * // Positive value (shows + prefix)
 * {{ 25.5 | formatPercent }}
 * // Output: "+25.50%"
 *
 * @example
 * // Negative value
 * {{ -10.25 | formatPercent }}
 * // Output: "-10.25%"
 *
 * @example
 * // Zero value (no prefix)
 * {{ 0 | formatPercent }}
 * // Output: "0.00%"
 *
 * @example
 * // Custom decimal places
 * {{ 33.3333 | formatPercent: 1 }}
 * // Output: "+33.3%"
 *
 * @example
 * // Null value
 * {{ null | formatPercent }}
 * // Output: "-"
 */
@Pipe({
  name: 'formatPercent',
})
export class FormatPercentPipe implements PipeTransform {
  /**
   * Transforms a numeric value into a formatted percentage string with sign.
   *
   * @param value - The percentage value to format
   * @param decimalPlaces - Number of decimal places (default: 2)
   * @returns Formatted percentage string with sign prefix, or '-' for invalid values
   *
   * @example
   * transform(25.5, 2)       // Returns: "+25.50%"
   * transform(-10.25, 2)     // Returns: "-10.25%"
   * transform(0, 2)          // Returns: "0.00%"
   * transform(33.3333, 1)    // Returns: "+33.3%"
   * transform(null, 2)       // Returns: "-"
   * transform(undefined, 2)  // Returns: "-"
   */
  transform(value: unknown, decimalPlaces: number = 2): string {
    if (value === null || value === undefined || typeof value !== 'number') {
      return '-';
    }
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(decimalPlaces)}%`;
  }
}
