import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Stock } from '../interfaces/stock.interface';

/**
 * API service responsible for making HTTP calls to the Stock endpoint.
 * This service handles only data fetching without any state management.
 *
 * @example
 * // Fetching all stocks:
 * stockApiService.getStocks().subscribe(stocks => {
 *   // stocks: [{ Id: 1, Name: 'Apple', Symbol: 'AAPL', PrecisionDigit: 2 }, ...]
 * });
 */
@Injectable({
  providedIn: 'root',
})
export class StockApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://34.159.211.193/api/Stock';

  /**
   * Fetches all stocks from the API.
   *
   * @returns Observable of Stock array
   *
   * @example
   * // Returns:
   * // [
   * //   { Id: 1, Name: 'Apple', Symbol: 'AAPL', PrecisionDigit: 2 },
   * //   { Id: 2, Name: 'Google', Symbol: 'GOOGL', PrecisionDigit: 4 }
   * // ]
   */
  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.apiUrl);
  }
}
