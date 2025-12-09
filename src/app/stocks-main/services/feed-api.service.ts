import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FeedsResponse } from '../interfaces/stock.interface';

/**
 * API service responsible for making HTTP calls to the Feeds endpoint.
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
   */
  getFeedsByIds(ids: number[]): Observable<FeedsResponse> {
    const idsParam = ids.join(',');
    return this.http.get<FeedsResponse>(`${this.apiUrl}?ids=${idsParam}`);
  }
}
