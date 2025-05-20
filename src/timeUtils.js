// Utility functions for handling time/date operations

/**
 * Updates the start and end time inputs based on realtime mode
 * @param {HTMLInputElement} stsInput - Start time input element
 * @param {HTMLInputElement} etsInput - End time input element
 * @param {boolean} realtime - Whether in realtime mode
 */
export function updateTimeInputs(stsInput, etsInput, realtime) {
    const now = new Date();
    
    if (realtime) {
        // In realtime mode, end time is now and start time is relative
        etsInput.value = now.toISOString().slice(0, 16);
        const sts = new Date(now);
        sts.setDate(sts.getDate() - 1); // Default to last 24 hours
        stsInput.value = sts.toISOString().slice(0, 16);
    } else if (!stsInput.value || !etsInput.value) {
        // Initial load or reset - set default time range
        etsInput.value = now.toISOString().slice(0, 16);
        const sts = new Date(now);
        sts.setDate(sts.getDate() - 1); // Default to last 24 hours
        stsInput.value = sts.toISOString().slice(0, 16);
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
 * Handles the cron job that runs every minute to update time inputs in realtime mode
 * @param {boolean} realtime - Whether realtime mode is active
 * @param {HTMLInputElement} stsInput - Start time input element
 * @param {HTMLInputElement} etsInput - End time input element
 * @param {Function} loadData - Callback to reload data after time update
 */
export function cronMinute(realtime, stsInput, etsInput, loadData) {
    if (!realtime) return;
    const now = new Date();
    
    // Update end time to now
    etsInput.value = now.toISOString().slice(0, 16);
    
    // Maintain the same time difference for start time
    const sts = new Date(stsInput.value);
    const timeDiff = now - new Date(etsInput.value);
    sts.setTime(sts.getTime() + timeDiff);
    stsInput.value = sts.toISOString().slice(0, 16);
    
    setTimeout(loadData, 0);
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
 * Gets a time range in ISO format
 * @param {HTMLElement} stsInput - Start time input element
 * @param {HTMLElement} etsInput - End time input element
 * @returns {{ sts: string, ets: string }} ISO formatted time range
 */
export function getTimeRange(stsInput, etsInput) {
    return {
        sts: new Date(stsInput.value).toISOString(),
        ets: new Date(etsInput.value).toISOString()
    };
}

/**
 * Set up event handlers for time inputs
 * @param {HTMLInputElement} stsInput - Start time input element 
 * @param {HTMLInputElement} etsInput - End time input element
 * @param {boolean} realtime - Whether realtime mode is enabled
 * @param {Function} loadData - Function to call when times change
 */
export function setupTimeEventHandlers(stsInput, etsInput, realtime, loadData) {
    stsInput.addEventListener('change', (event) => {
        // Ensure end time is not before start time
        if (new Date(etsInput.value) < new Date(event.target.value)) {
            etsInput.value = event.target.value;
        }
        if (!realtime) {
            setTimeout(loadData, 0);
        }
    });
    
    etsInput.addEventListener('change', (event) => {
        // Ensure start time is not after end time
        if (new Date(stsInput.value) > new Date(event.target.value)) {
            stsInput.value = event.target.value;
        }
        if (!realtime) {
            setTimeout(loadData, 0);
        }
    });
}
