export const sanitizePrice = (text: string): string => {
    // Allow only digits and at most one decimal point
    let sanitized = '';
    let hasDecimal = false;

    for (const char of text) {
        if (char >= '0' && char <= '9') {
            sanitized += char;
        } else if (char === '.' && !hasDecimal) {
            sanitized += char;
            hasDecimal = true;
        }
    }

    // Handle leading zeros
    if (sanitized.includes('.')) {
        const [whole, ...rest] = sanitized.split('.');
        const decimal = rest.join('');

        if (whole === '') {
            // ".5" -> "0.5"
            sanitized = '0.' + decimal;
        } else if (whole.length > 1 && whole.startsWith('0')) {
            // "05.5" -> "5.5"
            sanitized = whole.replace(/^0+/, '') + '.' + decimal;
        } else {
            sanitized = whole + '.' + decimal;
        }
    } else {
        // Whole number: remove leading zeros (e.g., "05" -> "5", "012" -> "12")
        sanitized = sanitized.replace(/^0+/, '');
        if (sanitized === '') {
            sanitized = '0';
        }
    }

    return sanitized;
};

