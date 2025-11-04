export const formatCurrency = (value: number): string => {
  if (typeof value !== 'number') return '';
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};
export const formatCurrencyWithoutSymbol = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value);
}
export const formatCurrency_2 = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
export const parseCurrency = (value: string): number => {
    return parseInt(value.replace(/\./g, '')) || 0
}
