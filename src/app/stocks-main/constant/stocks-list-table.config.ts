import { TableColumn } from '../interfaces/table-column.interface';
import { StockWithLatestFeed } from '../interfaces/stock.interface';

/**
 * Column configuration for the stocks list table.
 * Modify this array to add, remove, or reorder columns.
 */
export const STOCKS_LIST_COLUMNS: TableColumn<StockWithLatestFeed>[] = [
  {
    key: 'id',
    header: 'ID',
    field: 'stock.Id',
  },
  {
    key: 'name',
    header: 'Name',
    field: 'stock.Name',
  },
  {
    key: 'symbol',
    header: 'Symbol',
    field: 'stock.Symbol',
  },
  {
    key: 'buyRate',
    header: 'Buy Rate',
    field: 'latestFeed.buyPrice',
    pipe: 'formatPrice',
    pipeArgField: 'stock.PrecisionDigit',
  },
  {
    key: 'sellRate',
    header: 'Sell Rate',
    field: 'latestFeed.sellPrice',
    pipe: 'formatPrice',
    pipeArgField: 'stock.PrecisionDigit',
  },
  {
    key: 'dailyBuyRateChange',
    header: 'Daily Buy Rate Change',
    field: 'dailyBuyRateChange',
    pipe: 'formatPercent',
    hasDynamicClass: true,
    classValueField: 'dailyBuyRateChange',
  },
];
