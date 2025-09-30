import { useCustomize } from '../contexts/CustomizeContext';
import { useCallback } from 'react';

export const useFormatting = () => {
    const { settings } = useCustomize();
    const formatSettings = settings?.globalFormat;

    const formatDate = useCallback((dateString: string | Date | null | undefined): string => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';

        const options: Intl.DateTimeFormatOptions = {};
        if (formatSettings?.timezone) {
            try {
                options.timeZone = formatSettings.timezone;
            } catch (e) {
                console.warn(`Invalid timezone: ${formatSettings.timezone}`);
            }
        }
        
        // Adjust for timezone offset to prevent date changes
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

        switch (formatSettings?.dateFormat) {
            case 'MM/DD/YYYY':
                return adjustedDate.toLocaleDateString('en-US', options);
            case 'YYYY-MM-DD':
                return adjustedDate.toLocaleDateString('sv-SE', options);
            case 'DD/MM/YYYY':
            default:
                return adjustedDate.toLocaleDateString('es-ES', options);
        }
    }, [formatSettings]);

    const formatTime = useCallback((dateString: string | Date): string => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Hora inválida';
        
        const options: Intl.DateTimeFormatOptions = {
            hour: 'numeric',
            minute: 'numeric',
            hour12: formatSettings?.timeFormat === '12h',
        };

        if (formatSettings?.timezone) {
             try {
                options.timeZone = formatSettings.timezone;
            } catch (e) {
                console.warn(`Invalid timezone: ${formatSettings.timezone}`);
            }
        }

        return date.toLocaleTimeString('es-ES', options);
    }, [formatSettings]);

    const formatCurrency = useCallback((value: number, currencyCode: string = ''): string => {
        if (typeof value !== 'number') return 'N/A';
        
        const { currencyStyle = 'symbol_before', decimalPlaces = 2, decimalSeparator = ',', thousandsSeparator = '.' } = formatSettings || {};

        const fixedValue = value.toFixed(decimalPlaces);
        const parts = fixedValue.split('.');
        let integerPart = parts[0];
        const decimalPart = parts.length > 1 ? parts[1] : '';

        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
        
        const formattedNumber = `${integerPart}${decimalPart ? decimalSeparator : ''}${decimalPart}`;

        if (currencyStyle === 'symbol_after') {
            return `${formattedNumber} ${currencyCode}`;
        }
        return `${currencyCode} ${formattedNumber}`;

    }, [formatSettings]);

    const formatNumber = useCallback((value: number): string => {
        if (typeof value !== 'number') return 'N/A';

        const { decimalPlaces = 0, decimalSeparator = ',', thousandsSeparator = '.' } = formatSettings || {};
        
        const fixedValue = value.toFixed(decimalPlaces);
        const parts = fixedValue.split('.');
        let integerPart = parts[0];
        const decimalPart = parts.length > 1 ? parts[1] : '';

        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

        return `${integerPart}${decimalPart ? decimalSeparator : ''}${decimalPart}`;

    }, [formatSettings]);


    return { formatDate, formatTime, formatCurrency, formatNumber, defaultUnit: formatSettings?.defaultUnit };
};
