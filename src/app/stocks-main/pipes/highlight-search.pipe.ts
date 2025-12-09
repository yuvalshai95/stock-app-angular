import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Pipe to highlight search terms within text by wrapping matches in <strong> tags.
 * Case-insensitive matching.
 *
 * @example
 * // Basic usage
 * {{ 'Google' | highlightSearch: 'go' }}
 * // Output: "<strong>Go</strong>ogle" (rendered as bold "Go" + "ogle")
 *
 * @example
 * // No match
 * {{ 'Apple' | highlightSearch: 'go' }}
 * // Output: "Apple"
 *
 * @example
 * // Empty search term
 * {{ 'Google' | highlightSearch: '' }}
 * // Output: "Google"
 */
@Pipe({
  name: 'highlightSearch',
})
export class HighlightSearchPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  /**
   * Transforms text by highlighting matching search terms.
   *
   * @param value - The text to search within
   * @param searchTerm - The term to highlight
   * @returns SafeHtml with matching text wrapped in <strong> tags
   */
  transform(value: unknown, searchTerm: string): SafeHtml {
    if (value === null || value === undefined) {
      return '';
    }

    const text = String(value);

    if (!searchTerm || searchTerm.trim() === '') {
      return text;
    }

    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    const highlighted = text.replace(regex, '<strong>$1</strong>');

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
