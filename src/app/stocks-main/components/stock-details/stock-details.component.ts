import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { STOCK_DETAILS_COLUMNS } from '../../constant/stock-details-table.config';
import { FeedWithCalculations, Stock } from '../../interfaces/stock.interface';
import { TableColumn } from '../../interfaces/table-column.interface';
import { ChangeClassPipe } from '../../pipes/change-class.pipe';
import { FormatPercentPipe } from '../../pipes/format-percent.pipe';
import { FormatPricePipe } from '../../pipes/format-price.pipe';
import { FormatTimestampPipe } from '../../pipes/format-timestamp.pipe';
import { FeedService } from '../../services/feed.service';
import { StockService } from '../../services/stock.service';
import { calculateFeedMetrics } from '../../utils/feed-calculations';
import { getNestedValue } from '../../utils/object.utils';

/**
 * Stock details screen showing the last 100 feeds for a selected stock.
 *
 * Feed history is already accumulated from the main screen polling.
 * This component switches to single-stock polling for efficiency,
 * preserving existing history and continuing to grow it.
 */
@Component({
  selector: 'app-stock-details',
  templateUrl: './stock-details.component.html',
  styleUrl: './stock-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    FormatPricePipe,
    FormatPercentPipe,
    FormatTimestampPipe,
    ChangeClassPipe,
  ],
})
export class StockDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly stockService = inject(StockService);
  private readonly feedService = inject(FeedService);
  private readonly destroyRef = inject(DestroyRef);

  /** Table column configuration */
  readonly columns: TableColumn<FeedWithCalculations>[] = STOCK_DETAILS_COLUMNS;

  /** Current stock ID from route */
  private readonly stockId = signal<number | null>(null);

  /** Current stock details */
  readonly stock = computed<Stock | undefined>(() => {
    const id = this.stockId();
    if (id === null) return undefined;
    return this.stockService.getStockById(id);
  });

  /** Precision digits for price formatting */
  readonly precision = computed(() => this.stock()?.PrecisionDigit ?? 2);

  /** Feed history for this stock - already populated from main screen */
  private readonly feedHistory = computed(() => {
    const id = this.stockId();
    if (id === null) return [];
    return this.feedService.feedHistoryByStock().get(id) ?? [];
  });

  /** Feeds with calculated spread and percent change */
  readonly feedsWithCalculations = computed<FeedWithCalculations[]>(() => {
    const feeds = this.feedHistory();
    return calculateFeedMetrics(feeds);
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : null;
    this.stockId.set(id);

    if (id !== null) {
      // Fetch stocks if not already loaded (e.g., direct URL navigation)
      if (this.stockService.stocks().length === 0) {
        this.stockService.fetchStocks().subscribe();
      }

      // Switch to single-stock polling for efficiency
      // Existing feed history is preserved and continues to grow
      this.feedService.switchToSingleStockPolling(id);
    }

    this.destroyRef.onDestroy(() => {
      this.feedService.stopPolling();
    });
  }

  /**
   * Navigates back to the stocks list.
   */
  goBack(): void {
    this.router.navigate(['/stocks']);
  }

  /**
   * Gets a nested value from an item using dot notation path.
   * Handles special $rowIndex field.
   */
  getValue(item: FeedWithCalculations, path: string, rowIndex: number): unknown {
    if (path === '$rowIndex') {
      return rowIndex + 1;
    }
    return getNestedValue(item, path);
  }

  /**
   * Gets the value for dynamic class calculation.
   */
  getClassValue(item: FeedWithCalculations, column: TableColumn<FeedWithCalculations>): unknown {
    if (!column.classValueField) {
      return null;
    }
    return getNestedValue(item, column.classValueField);
  }
}
