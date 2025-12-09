import { TableColumn } from '../interfaces/table-column.interface';
import { FeedWithCalculations } from '../interfaces/stock.interface';

/**
 * Column configuration for the stock details table.
 * Modify this array to add, remove, or reorder columns.
 */
export const STOCK_DETAILS_COLUMNS: TableColumn<FeedWithCalculations>[] = [
  {
    key: 'rowNumber',
    header: '#',
    field: '$rowIndex',
  },
  {
    key: 'buyPrice',
    header: 'Buy Price',
    field: 'feed.buyPrice',
    pipe: 'formatPrice',
  },
  {
    key: 'sellPrice',
    header: 'Sell Price',
    field: 'feed.sellPrice',
    pipe: 'formatPrice',
  },
  {
    key: 'spread',
    header: 'Spread',
    field: 'spread',
    pipe: 'formatPrice',
  },
  {
    key: 'sellRateChange',
    header: 'Sell Rate Change %',
    field: 'sellRateChangePercent',
    pipe: 'formatPercent',
    hasDynamicClass: true,
    classValueField: 'sellRateChangePercent',
  },
  {
    key: 'timestamp',
    header: 'Timestamp',
    field: 'feed.timestamp',
    pipe: 'formatTimestamp',
  },
];
