// Utility functions for handling time/date operations

import { setState, StateKeys } from "./state";
import strftime from "strftime";

/**
 * Our custom toLocaleString() function to format date without seconds
 * in the format of YYYY/mm/dd hh:mm AM/PM
 * @param {Date} dt - Date to format
 * @returns {string} Formatted date string
 */
export function toLocaleString(dt) {
    // Format date to YYYY/mm/dd hh:mm AM/PM
    return strftime('%Y/%m/%d %I:%M %p', dt);
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
        if (realtime) {
            return;
        }
        // Ensure end time is not before start time
        const target = event.target;
        if (target instanceof HTMLInputElement) {
            const newStartDate = new Date(target.value);
            setState(StateKeys.STS, newStartDate);
            // Highlight inputs to indicate changes need to be loaded
            inputs.forEach(input => input.classList.add('input-changed'));
        }
    });
    
    etsInput.addEventListener('change', (event) => {
        if (realtime) {
            return;
        }
        // Ensure start time is not after end time
        const target = event.target;
        if (target instanceof HTMLInputElement) {
            const newEndDate = new Date(target.value);
            setState(StateKeys.ETS, newEndDate);
            // Highlight inputs to indicate changes need to be loaded
            inputs.forEach(input => input.classList.add('input-changed'));
        }
    });
}

/**
 * Format a date for a datetime-local input (YYYY-MM-DDThh:mm)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string in local timezone
 */
export function formatForDateTimeLocal(date) {
    return strftime('%Y-%m-%dT%H:%M', date);
}

/**
 * DataTable render function for datetime columns that need proper sorting
 * Returns the original Date object for sorting operations and formatted string for display
 * @param {string|Date} data - The datetime data (ISO string or Date object)
 * @param {string} type - The operation type ('display', 'type', 'sort', etc.)
 * @returns {Date|string} Date object for sorting, formatted string for display
 */
export function renderDateTime(data, type) {
    const date = new Date(data);
    
    // For sorting and type detection, return the Date object which DataTables can sort properly
    if (type === 'sort' || type === 'type') {
        return date;
    }
    
    // For display, return the formatted string
    return toLocaleString(date);
}
