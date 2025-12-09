import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to format price values with specified precision.
 * Returns 'N/A' for null/undefined/non-numeric values.
 *
 * @example
 * // Basic usage with default precision (2 decimal places)
 * {{ 123.456 | formatPrice }}
 * // Output: "123.46"
 *
 * @example
 * // With custom precision
 * {{ 123.456789 | formatPrice: 4 }}
 * // Output: "123.4568"
 *
 * @example
 * // With null value
 * {{ null | formatPrice }}
 * // Output: "N/A"
 *
 * @example
 * // With zero precision
 * {{ 99.99 | formatPrice: 0 }}
 * // Output: "100"
 */
@Pipe({
  name: 'formatPrice',
})
export class FormatPricePipe implements PipeTransform {
  /**
   * Transforms a numeric value into a formatted price string.
   *
   * @param value - The value to format (number, null, undefined, or unknown)
   * @param precision - Number of decimal places (default: 2)
   * @returns Formatted price string or 'N/A' for invalid values
   *
   * @example
   * transform(123.456, 2)    // Returns: "123.46"
   * transform(50.5, 3)       // Returns: "50.500"
   * transform(null, 2)       // Returns: "N/A"
   * transform(undefined, 2)  // Returns: "N/A"
   * transform("invalid", 2)  // Returns: "N/A"
   */
  transform(value: unknown, precision: number = 2): string {
    if (value === null || value === undefined || typeof value !== 'number') {
      return 'N/A';
    }
    return value.toFixed(precision);
  }
}
