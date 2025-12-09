import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { STOCKS_LIST_COLUMNS } from '../../constant/stocks-list-table.config';
import { StockWithLatestFeed } from '../../interfaces/stock.interface';
import { TableColumn } from '../../interfaces/table-column.interface';
import { RateChangeDirection } from '../../enums/rate-change-direction.enum';
import { ChangeClassPipe } from '../../pipes/change-class.pipe';
import { FormatPercentPipe } from '../../pipes/format-percent.pipe';
import { FormatPricePipe } from '../../pipes/format-price.pipe';
import { HighlightSearchPipe } from '../../pipes/highlight-search.pipe';
import { FeedService } from '../../services/feed.service';
import { StockService } from '../../services/stock.service';
import { calculateDailyBuyRateChange } from '../../utils/feed-calculations';
import { getNestedValue } from '../../utils/object.utils';

/**
 * Main screen component displaying a list of stocks with their latest rates.
 * Starts polling for ALL stocks on init, accumulating feed history for each.
 * When user navigates to details, history is already available.
 */
@Component({
  selector: 'app-stocks-list',
  templateUrl: './stocks-list.component.html',
  styleUrl: './stocks-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, InputTextModule, FormsModule, FormatPricePipe, FormatPercentPipe, ChangeClassPipe, HighlightSearchPipe],
})
export class StocksListComponent implements OnInit {
  private readonly stockService = inject(StockService);
  private readonly feedService = inject(FeedService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Table column configuration */
  readonly columns: TableColumn<StockWithLatestFeed>[] = STOCKS_LIST_COLUMNS;

  /** Search term for filtering stocks */
  readonly searchTerm = signal('');

  /** Combined stocks with their latest feed data, rate directions, and daily buy rate change */
  private readonly stocksWithFeeds = computed<StockWithLatestFeed[]>(() => {
    const stocks = this.stockService.stocks();
    const feedsMap = this.feedService.latestFeedsByStock();
    const feedHistoryMap = this.feedService.feedHistoryByStock();
    const rateDirectionsMap = this.feedService.rateDirectionsByStock();

    return stocks.map((stock) => {
      const feedHistory = feedHistoryMap.get(stock.Id) ?? [];
      const rateDirections = rateDirectionsMap.get(stock.Id);
      return {
        stock,
        latestFeed: feedsMap.get(stock.Id) ?? null,
        dailyBuyRateChange: calculateDailyBuyRateChange(feedHistory),
        buyRateDirection: rateDirections?.buyRateDirection ?? RateChangeDirection.NEUTRAL,
        sellRateDirection: rateDirections?.sellRateDirection ?? RateChangeDirection.NEUTRAL,
      };
    });
  });

  /** Filtered stocks based on search term (case-insensitive contains match on name or symbol) */
  readonly filteredStocks = computed<StockWithLatestFeed[]>(() => {
    const stocks = this.stocksWithFeeds();
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return stocks;
    }

    return stocks.filter((item) => {
      const name = item.stock.Name.toLowerCase();
      const symbol = item.stock.Symbol.toLowerCase();
      return name.includes(term) || symbol.includes(term);
    });
  });

  ngOnInit(): void {
    // Fetch stocks first, then start polling with all stock IDs
    this.stockService.fetchStocks().subscribe((stocks) => {
      const stockIds = stocks.map((stock) => stock.Id);
      this.feedService.startPollingAllStocks(stockIds);
    });

    this.destroyRef.onDestroy(() => {
      this.feedService.stopPolling();
    });
  }

  /**
   * Handles row selection to navigate to stock details.
   */
  onRowSelect(event: TableRowSelectEvent<StockWithLatestFeed>): void {
    const data = event.data;
    if (data && !Array.isArray(data)) {
      this.router.navigate(['/stock', data.stock.Id]);
    }
  }

  /**
   * Gets a nested value from an item using dot notation path.
   */
  getValue(item: StockWithLatestFeed, path: string): unknown {
    return getNestedValue(item, path);
  }

  /**
   * Gets the pipe argument value for a column.
   */
  getPipeArg(item: StockWithLatestFeed, column: TableColumn<StockWithLatestFeed>): number {
    if (column.pipeArg !== undefined) {
      return column.pipeArg;
    }
    if (column.pipeArgField) {
      const value = getNestedValue(item, column.pipeArgField);
      return typeof value === 'number' ? value : 2;
    }
    return 2;
  }

  /**
   * Gets the value for dynamic class calculation.
   */
  getClassValue(item: StockWithLatestFeed, column: TableColumn<StockWithLatestFeed>): unknown {
    if (!column.classValueField) {
      return null;
    }
    return getNestedValue(item, column.classValueField);
  }

  /**
   * Gets the CSS class based on direction field value.
   * Maps 'up' -> 'positive', 'down' -> 'negative', 'neutral' -> 'neutral'
   *
   * @param item - The row data
   * @param column - The column configuration
   * @returns CSS class name: 'positive', 'negative', or 'neutral'
   */
  getDirectionClass(item: StockWithLatestFeed, column: TableColumn<StockWithLatestFeed>): string {
    if (!column.directionField) {
      return 'neutral';
    }
    const direction = getNestedValue(item, column.directionField);
    if (direction === RateChangeDirection.UP) return 'positive';
    if (direction === RateChangeDirection.DOWN) return 'negative';
    return 'neutral';
  }

  /**
   * Gets the arrow character based on direction field value.
   *
   * @param item - The row data
   * @param column - The column configuration
   * @returns Arrow character: '▲' for up, '▼' for down, '' for neutral
   */
  getDirectionArrow(item: StockWithLatestFeed, column: TableColumn<StockWithLatestFeed>): string {
    if (!column.directionField) {
      return '';
    }
    const direction = getNestedValue(item, column.directionField);
    if (direction === RateChangeDirection.UP) return '▲';
    if (direction === RateChangeDirection.DOWN) return '▼';
    return '';
  }
}
