export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // or whatever currency is appropriate for the user, maybe IQD or generic number. For now USD formatting works to show 2 decimal places.
  }).format(amount).replace('$', '') + ' دينار'; // Hardcoding دينار as currency symbol
}
