// Currency utility functions
export const getCurrencySymbol = (currency) => {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'CAD': 'C$',
        'AUD': 'A$',
        'RUB': '₽'
    };
    return symbols[currency] || currency;
};

export const formatCurrency = (amount, currency) => {
    const symbol = getCurrencySymbol(currency);
    const formattedAmount = parseFloat(amount || 0).toFixed(2);

    // For some currencies, symbol goes after the amount
    if (currency === 'RUB') {
        return `${formattedAmount} ${symbol}`;
    }

    return `${symbol}${formattedAmount}`;
};

export const SUPPORTED_CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' }
];
