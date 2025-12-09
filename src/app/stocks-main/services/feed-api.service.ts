import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FeedsResponse } from '../interfaces/stock.interface';

/**
 * API service responsible for making HTTP calls to the Feeds endpoint.
 * This service handles only data fetching without any state management.
 *
 * @example
 * // Fetching all feeds:
 * feedApiService.getAllFeeds().subscribe(response => {
 *   // response.Feeds: [{ StockId: 1, BuyPrice: 150.25, SellPrice: 150.30 }, ...]
 *   // response.LastUpdate: '2024-01-15T10:30:00Z'
 * });
 *
 * // Fetching feeds for specific stock:
 * feedApiService.getFeedsByStockId(1).subscribe(response => {
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
   * Fetches feeds for all stocks from the API.
   *
   * @returns Observable of FeedsResponse containing all feeds and last update timestamp
   *
   * @example
   * // Returns:
   * // {
   * //   Feeds: [
   * //     { StockId: 1, BuyPrice: 150.25, SellPrice: 150.30 },
   * //     { StockId: 2, BuyPrice: 2800.50, SellPrice: 2801.00 }
   * //   ],
   * //   LastUpdate: '2024-01-15T10:30:00Z'
   * // }
   */
  getAllFeeds(): Observable<FeedsResponse> {
    return this.http.get<FeedsResponse>(this.apiUrl);
  }

  /**
   * Fetches feeds for a specific stock ID from the API.
   *
   * @param stockId - The stock ID to fetch feeds for
   * @returns Observable of FeedsResponse containing feeds for the specified stock
   *
   * @example
   * // getFeedsByStockId(1) returns:
   * // {
   * //   Feeds: [{ StockId: 1, BuyPrice: 150.25, SellPrice: 150.30 }],
   * //   LastUpdate: '2024-01-15T10:30:00Z'
   * // }
   */
  getFeedsByStockId(stockId: number): Observable<FeedsResponse> {
    return this.http.get<FeedsResponse>(`${this.apiUrl}?ids=${stockId}`);
  }
}
