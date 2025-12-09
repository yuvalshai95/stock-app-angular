import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { STOCKS_LIST_COLUMNS } from '../../constant/stocks-list-table.config';
import { StockWithLatestFeed } from '../../interfaces/stock.interface';
import { TableColumn } from '../../interfaces/table-column.interface';
import { FormatPricePipe } from '../../pipes/format-price.pipe';
import { FeedService } from '../../services/feed.service';
import { StockService } from '../../services/stock.service';
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
  imports: [TableModule, FormatPricePipe],
})
export class StocksListComponent implements OnInit {
  private readonly stockService = inject(StockService);
  private readonly feedService = inject(FeedService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Table column configuration */
  readonly columns: TableColumn<StockWithLatestFeed>[] = STOCKS_LIST_COLUMNS;

  /** Combined stocks with their latest feed data */
  readonly stocksWithFeeds = computed<StockWithLatestFeed[]>(() => {
    const stocks = this.stockService.stocks();
    const feedsMap = this.feedService.latestFeedsByStock();

    return stocks.map((stock) => ({
      stock,
      latestFeed: feedsMap.get(stock.Id) ?? null,
    }));
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
}
