/**
 * Configuration for a table column.
 * Used to define dynamic table columns with flexible formatting and styling.
 *
 * @example
 * // Simple text column
 * const nameColumn: TableColumn = {
 *   key: 'name',
 *   header: 'Name',
 *   field: 'stock.Name'
 * };
 *
 * @example
 * // Column with price formatting and dynamic precision
 * const buyRateColumn: TableColumn = {
 *   key: 'buyRate',
 *   header: 'Buy Rate',
 *   field: 'latestFeed.buyPrice',
 *   pipe: 'formatPrice',
 *   pipeArgField: 'stock.PrecisionDigit'  // Gets precision from data
 * };
 *
 * @example
 * // Column with percent formatting and dynamic CSS class
 * const changeColumn: TableColumn = {
 *   key: 'sellRateChange',
 *   header: 'Sell Rate Change %',
 *   field: 'sellRateChangePercent',
 *   pipe: 'formatPercent',
 *   hasDynamicClass: true,
 *   classValueField: 'sellRateChangePercent'  // Used for positive/negative styling
 * };
 *
 * @example
 * // Column with static pipe argument
 * const priceColumn: TableColumn = {
 *   key: 'price',
 *   header: 'Price',
 *   field: 'price',
 *   pipe: 'formatPrice',
 *   pipeArg: 4  // Always show 4 decimal places
 * };
 *
 * @example
 * // Special row index column
 * const rowNumberColumn: TableColumn = {
 *   key: 'rowNumber',
 *   header: '#',
 *   field: '$rowIndex'  // Special field that returns row index + 1
 * };
 */
export interface TableColumn<T = unknown> {
  /**
   * Unique identifier for the column.
   * Used for tracking in @for loops.
   *
   * @example 'id', 'name', 'buyRate', 'sellRateChange'
   */
  key: string;

  /**
   * Header text displayed in the table header row.
   *
   * @example 'ID', 'Stock Name', 'Buy Rate', 'Sell Rate Change %'
   */
  header: string;

  /**
   * Path to the value in the data object.
   * Supports nested paths using dot notation.
   * Use '$rowIndex' for row number (1-based).
   *
   * @example
   * 'stock.Name'           // Accesses data.stock.Name
   * 'latestFeed.buyPrice'  // Accesses data.latestFeed.buyPrice
   * 'spread'               // Accesses data.spread
   * '$rowIndex'            // Returns row index + 1
   */
  field: string;

  /**
   * Optional pipe to format the value.
   * Available pipes: 'formatPrice', 'formatPercent', 'formatTimestamp'
   *
   * @example 'formatPrice' - Formats as "123.45" or "N/A"
   * @example 'formatPercent' - Formats as "+5.25%" or "-3.10%"
   * @example 'formatTimestamp' - Formats as "2:30:45 PM"
   */
  pipe?: 'formatPrice' | 'formatPercent' | 'formatTimestamp';

  /**
   * Field path for pipe argument (e.g., precision).
   * Used when the pipe argument should come from the data.
   *
   * @example 'stock.PrecisionDigit' - Gets precision from the stock object
   */
  pipeArgField?: string;

  /**
   * Static pipe argument value.
   * Used when the pipe argument is constant.
   *
   * @example 2 - Always use 2 decimal places
   * @example 4 - Always use 4 decimal places
   */
  pipeArg?: number;

  /**
   * Whether this column should have dynamic CSS class based on value.
   * When true, classes 'positive', 'negative', or 'neutral' are applied.
   *
   * @example true - Apply dynamic class based on classValueField
   */
  hasDynamicClass?: boolean;

  /**
   * Field path to get the value for dynamic class calculation.
   * The value is passed to changeClass pipe to determine CSS class.
   *
   * @example 'sellRateChangePercent' - Positive values get 'positive' class
   */
  classValueField?: string;

  /**
   * Field path to get the direction value for CSS class.
   * Unlike classValueField (which uses changeClass pipe on numbers),
   * this field should already contain 'up', 'down', or 'neutral' string.
   * Maps to: 'up' -> 'positive', 'down' -> 'negative', 'neutral' -> 'neutral'
   *
   * @example 'buyRateDirection' - Gets direction string directly from data
   */
  directionField?: string;
}
