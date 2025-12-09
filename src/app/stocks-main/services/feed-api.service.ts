import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FeedsResponse } from '../interfaces/stock.interface';

/**
 * API service responsible for making HTTP calls to the Feeds endpoint.
 * This service handles only data fetching without any state management.
 *
 * @example
 * // Fetching feeds for multiple stocks:
 * feedApiService.getFeedsByIds([1, 2, 3]).subscribe(response => {
 *   // response.Feeds: [{ StockId: 1, BuyPrice: 150.25, SellPrice: 150.30 }, ...]
 *   // response.LastUpdate: '2024-01-15T10:30:00Z'
 * });
 *
 * // Fetching feeds for single stock:
 * feedApiService.getFeedsByIds([1]).subscribe(response => {
 *   // response.Feeds: [{ StockId: 1, BuyPrice: 150.25, SellPrice: 150.30 }]
 * });
 */
@Injectable({
  providedIn: 'root',
})
export class FeedApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://34.159.211.193/api/feeds';

  /**
   * Fetches feeds for specified stock IDs from the API.
   *
   * @param ids - Array of stock IDs to fetch feeds for
   * @returns Observable of FeedsResponse containing feeds for specified stocks
   *
   * @example
   * // getFeedsByIds([1, 2, 3]) returns:
   * // {
   * //   Feeds: [
   * //     { StockId: 1, BuyPrice: 150.25, SellPrice: 150.30 },
   * //     { StockId: 2, BuyPrice: 2800.50, SellPrice: 2801.00 },
   * //     { StockId: 3, BuyPrice: 45.72, SellPrice: 45.72 }
   * //   ],
   * //   LastUpdate: '2024-01-15T10:30:00Z'
   * // }
   *
   * // getFeedsByIds([1]) returns:
   * // {
   * //   Feeds: [{ StockId: 1, BuyPrice: 150.25, SellPrice: 150.30 }],
   * //   LastUpdate: '2024-01-15T10:30:00Z'
   * // }
   */
  getFeedsByIds(ids: number[]): Observable<FeedsResponse> {
    const idsParam = ids.join(',');
    return this.http.get<FeedsResponse>(`${this.apiUrl}?ids=${idsParam}`);
  }
}
