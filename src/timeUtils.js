// Utility functions for handling time/date operations

import { setState, StateKeys } from "./state";

/**
 * Our custom toLocaleString() function to format date without seconds
 * in the format of YYYY/mm/dd hh:mm AM/PM
 * @param {Date} dt - Date to format
 * @returns {string} Formatted date string
 */
export function toLocaleString(dt) {
    // Format date to YYYY/mm/dd hh:mm AM/PM
    return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours() % 12 || 12).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')} ${dt.getHours() < 12 ? 'AM' : 'PM'}`;
}

/**
 * Updates the start and end time inputs based on realtime mode
 * @param {HTMLInputElement} stsInput - Start time input element
 * @param {HTMLInputElement} etsInput - End time input element
 * @param {boolean} realtime - Whether in realtime mode
 */
export function updateTimeInputs(stsInput, etsInput, realtime) {
    const now = new Date();
    
    // Configure input states based on realtime mode
    if (realtime) {
        // In realtime mode, inputs should be read-only
        stsInput.readOnly = true;
        etsInput.readOnly = true;
        stsInput.style.pointerEvents = 'none';
        etsInput.style.pointerEvents = 'none';
        
        // Update values
        etsInput.value = formatForDateTimeLocal(now);
        const sts = new Date(now);
        sts.setDate(sts.getDate() - 1); // Default to last 24 hours
        stsInput.value = formatForDateTimeLocal(sts);
    } else {
        // In manual mode, inputs should be enabled
        stsInput.readOnly = false;
        etsInput.readOnly = false;
        stsInput.style.pointerEvents = 'auto';
        etsInput.style.pointerEvents = 'auto';
        
        // Only set default values if inputs are empty
        if (!stsInput.value || !etsInput.value) {
            etsInput.value = formatForDateTimeLocal(now);
            const sts = new Date(now);
            sts.setDate(sts.getDate() - 1); // Default to last 24 hours
            stsInput.value = formatForDateTimeLocal(sts);
        }
    }
    
    // Ensure inputs stay within valid range
    const minDate = '2003-01-01T00:00';
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 3);
    const maxDateStr = maxDate.toISOString().slice(0, 16);
    
    stsInput.min = minDate;
    stsInput.max = maxDateStr;
    etsInput.min = minDate;
    etsInput.max = maxDateStr;
}

/**
 * Gets a date in the format YYYY-MM-DD-HHMM
 * @param {Date} dt - Date to format
 * @returns {string} Formatted date
 */
export function getFormattedDate(dt) {
    return dt.toISOString().replace(/[-:T]/g, '').slice(0, 12);
}


/**
 * Builds date parameters for shapefile requests
 * @param {Date} date - The date to format
 * @returns {{ year: number, month: number, day: number, hour: number, minute: number }} Formatted date parts
 */
export function getShapefileDateParams(date) {
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes()
    };
}

/**
 * Set up event handlers for time inputs
 * @param {HTMLInputElement} stsInput - Start time input element 
 * @param {HTMLInputElement} etsInput - End time input element
 * @param {boolean} realtime - Whether realtime mode is enabled
 */
export function setupTimeEventHandlers(stsInput, etsInput, realtime) {
    const inputs = [stsInput, etsInput];

    // Remove the loading class if it exists
    inputs.forEach(input => {
        input.classList.remove('input-field-loading');
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
    });

    // Add click and focus handlers
    inputs.forEach(input => {
        // Handle click event
        input.addEventListener('click', () => {
            if (!realtime) {
                input.showPicker(); // Show the native datetime picker
            }
        });

        // Handle focus event
        input.addEventListener('focus', () => {
            if (!realtime) {
                input.showPicker(); // Show the native datetime picker
            }
        });
    });

    // Handle value changes
    stsInput.addEventListener('change', (event) => {
        if (realtime) return;
        // Ensure end time is not before start time
        const newStartDate = new Date(event.target.value);
        setState(StateKeys.STS, newStartDate);
        // Highlight inputs to indicate changes need to be loaded
        inputs.forEach(input => input.classList.add('input-changed'));
    });
    
    etsInput.addEventListener('change', (event) => {
        if (realtime) return;
        // Ensure start time is not after end time
        const newEndDate = new Date(event.target.value);
        setState(StateKeys.ETS, newEndDate);
        // Highlight inputs to indicate changes need to be loaded
        inputs.forEach(input => input.classList.add('input-changed'));
    });
}

/**
 * Format a date for a datetime-local input (YYYY-MM-DDThh:mm)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string in local timezone
 */
export function formatForDateTimeLocal(date) {
    // Use local getters since datetime-local input expects local time
    return date.toLocaleString('sv', { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(' ', 'T');
}
