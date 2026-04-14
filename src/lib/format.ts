/**
 * Currency formatting utilities for BudgetZTL.
 */

const CURRENCY_CONFIG: Record<
  string,
  { symbol: string; locale: string; decimals: number }
> = {
  USD: { symbol: "$", locale: "en-US", decimals: 2 },
  EUR: { symbol: "\u20AC", locale: "de-DE", decimals: 2 },
  GBP: { symbol: "\u00A3", locale: "en-GB", decimals: 2 },
  JPY: { symbol: "\u00A5", locale: "ja-JP", decimals: 0 },
  MXN: { symbol: "$", locale: "es-MX", decimals: 2 },
};

/**
 * Format a number as currency based on the budget's currency code.
 * Examples: formatCurrency(4250, "USD") => "$4,250.00"
 */
export function formatCurrency(amount: number, currency: string): string {
  const config = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.USD;
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}

/**
 * Get just the currency symbol for a given currency code.
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_CONFIG[currency]?.symbol ?? "$";
}

/**
 * Format a date string (YYYY-MM-DD) as a relative/friendly date.
 * "Today", "Yesterday", or "Oct 12, 2023"
 */
export function formatRelativeDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) {
    return "Today";
  }

  if (date.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
