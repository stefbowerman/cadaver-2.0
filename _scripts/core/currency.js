/**
 * Currency Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help with currency formatting
 *
 * Current contents
 * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
 * 
 * @deprecated - Because Shopify now supports local currencies, it's easier to do all price formatting on the server (See cart.json.liquid or product-json-lite.liquid)
 *               We don't need this file anymore but there's no reason to get rid of it just yet...
 *
 */

const moneyFormat = '${{amount}}'; // eslint-disable-line no-template-curly-in-string

/**
 * Format money values based on your shop currency settings
 * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents
 * or 3.00 dollars
 * @param  {String} format - shop money_format setting
 * @return {String} value - formatted value
 */
export function formatMoney(cents, format) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }

  let value = '';
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  const formatString = (format || moneyFormat);

  function formatWithDelimiters(number, precision = 2, thousands = ',', decimal = '.') {
    if (Number.isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    const parts = number.split('.');
    const dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${thousands}`);
    const centsAmount = parts[1] ? (decimal + parts[1]) : '';

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_space_separator':
      value = formatWithDelimiters(cents, 2, ' ', '.');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, ',', '.');
      break;
    case 'amount_no_decimals_with_space_separator':
      value = formatWithDelimiters(cents, 0, ' ');
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

/**
 * Removes '.00' if found at the end of the string
 *
 * @param  {string} value - formatted price (see above)
 * @return {string} value - formatted value
 */
export function stripZeroCents(string) {
  return string.replace(/\.00$/, '');
}
