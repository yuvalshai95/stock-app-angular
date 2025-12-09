import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to format Date objects to locale time string.
 *
 * @example
 * // With a Date object
 * {{ dateValue | formatTimestamp }}
 * // Output: "2:30:45 PM" (varies by locale)
 *
 * @example
 * // With null value
 * {{ null | formatTimestamp }}
 * // Output: "-"
 *
 * @example
 * // With undefined value
 * {{ undefined | formatTimestamp }}
 * // Output: "-"
 */
@Pipe({
  name: 'formatTimestamp',
})
export class FormatTimestampPipe implements PipeTransform {
  /**
   * Transforms a Date object into a locale time string.
   *
   * @param value - The Date object to format
   * @returns Locale time string or '-' for invalid values
   *
   * @example
   * transform(new Date('2024-01-15T14:30:45'))  // Returns: "2:30:45 PM" (locale dependent)
   * transform(new Date('2024-01-15T09:05:00'))  // Returns: "9:05:00 AM" (locale dependent)
   * transform(null)                             // Returns: "-"
   * transform(undefined)                        // Returns: "-"
   * transform("not a date")                     // Returns: "-"
   */
  transform(value: unknown): string {
    if (!value || !(value instanceof Date)) {
      return '-';
    }
    return value.toLocaleTimeString();
  }
}
