import { getState, setState, StateKeys } from './state.js';
import { applySettings, generateSettings } from './settingsManager.js';

/**
 * Helper function to get selected values from a select element
 * @param {HTMLSelectElement} selectElement 
 * @returns {string[]} Array of selected values
 */
function getSelectedValues(selectElement) {
    return Array.from(selectElement.selectedOptions).map(option => option.value);
}

/**
 * Helper function to set selected values on a select element
 * @param {HTMLSelectElement} selectElement 
 * @param {string[]} values 
 */
function setSelectedValues(selectElement, values) {
    // Clear current selections
    selectElement.querySelectorAll('option').forEach(option => option.selected = false);
    // Set new selections
    values.forEach(value => {
        const option = selectElement.querySelector(`option[value="${value}"]`);
        if (option) option.selected = true;
    });
    // Dispatch change event
    selectElement.dispatchEvent(new Event('change'));
}

/**
 * Migrates the app from hash-based URLs to parameter-based URLs.
 * This function should be called on initial load to check if a hash exists
 * and convert it to URL parameters.
 */
export function migrateHashToParams() {
    const url = new URL(window.location);
    const hash = url.hash;
    if (!hash || hash.length <= 1) {
        return;
    }
    
    // Remove the # character
    const tokens = hash.substring(1).split("/");
    if (tokens.length < 2) {
        return;
    }
    
    // Parse components from hash
    const ids = tokens[0].split(",");
    let by = "wfo";
    
    // Determine if we're dealing with WFOs or states
    if (ids.length > 0 && ids[0].length !== 3) {
        by = "state";
    }
    
    // Create URLSearchParams object with current params
    const params = new URLSearchParams(url.search);
    
    // Set the selections
    if (ids.length > 0 && ids[0] !== "") {
        params.set("by", by);
        params.set(by, tokens[0]);
    }
    
    // Handle time parameters
    if (tokens.length > 2) {
        // Full date/time format - ensure format is YYYYmmddHH24MI
        params.set("sts", tokens[1]);
        params.set("ets", tokens[2]);
    } else if (tokens.length === 2) {
        // Relative time format
        params.set("seconds", tokens[1]);
    }
    
    // Handle settings
    if (tokens.length > 3) {
        params.set("settings", tokens[3]);
    }
    
    // Create new URL with parameters and no hash
    const newUrl = `${url.origin}${url.pathname}?${params.toString()}`;
    
    // Replace the current URL without reloading the page
    window.history.replaceState({}, "", newUrl);
}

/**
 * Format a Date object for use in a datetime-local input field
 * @param {Date} date - The date to format
 * @returns {string} - Date string in format YYYY-MM-DDTHH:MM
 */
function formatDateTimeForInput(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Parse URL parameters and initialize state
 */
export function parseHref() {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    
    // Check for selection type and IDs
    const by = params.get("by") || "wfo";
    let ids = [];
    
    if (by === "wfo") {
        const wfoParam = params.get("wfo");
        if (wfoParam) {
            ids = wfoParam.split(",");
            setSelectedValues(wfoSelect, ids);
            setState(StateKeys.WFO_FILTER, ids);
        }
    } else if (by === "state") {
        const stateParam = params.get("state");
        if (stateParam) {
            ids = stateParam.split(",");
            setSelectedValues(stateSelect, ids);
            setState(StateKeys.STATE_FILTER, ids);
            setState(StateKeys.BY_STATE, true);
            document.getElementById("by_state").click();
        }
    }

    // Handle LSR and SBW type parameters
    const lsrTypes = params.get("lsrTypes");
    if (lsrTypes) {
        setState(StateKeys.LSR_TYPES, lsrTypes.split(","));
    }
    
    const sbwTypes = params.get("sbwTypes");
    if (sbwTypes) {
        setState(StateKeys.SBW_TYPES, sbwTypes.split(","));
    }
    
    // Handle time parameters
    const stsParam = params.get("sts");
    const etsParam = params.get("ets");
    const secondsParam = params.get("seconds");
    
    let stsTime;
    let etsTime;
    
    if (stsParam && etsParam) {
        // Parse full date/time in YYYYmmddHH24MI format (UTC)
        stsTime = new Date(Date.UTC(
            parseInt(stsParam.slice(0, 4), 10),
            parseInt(stsParam.slice(4, 6), 10) - 1,
            parseInt(stsParam.slice(6, 8), 10),
            parseInt(stsParam.slice(8, 10), 10),
            parseInt(stsParam.slice(10, 12), 10)
        ));
        
        etsTime = new Date(Date.UTC(
            parseInt(etsParam.slice(0, 4), 10),
            parseInt(etsParam.slice(4, 6), 10) - 1,
            parseInt(etsParam.slice(6, 8), 10),
            parseInt(etsParam.slice(8, 10), 10),
            parseInt(etsParam.slice(10, 12), 10)
        ));
    } else if (secondsParam) {
        // Parse relative time
        setState(StateKeys.REALTIME, true);
        document.getElementById("realtime").checked = true;
        etsTime = new Date();
        stsTime = new Date(etsTime.getTime() - Math.abs(parseInt(secondsParam, 10)) * 1000);
    } else {
        // No parameters provided, use defaults
        etsTime = new Date();
        stsTime = new Date(etsTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    }
    
    // Update state
    setState(StateKeys.STS, stsTime);
    setState(StateKeys.ETS, etsTime);
    
    // Set the form values in local timezone
    document.getElementById("sts").value = formatDateTimeForInput(stsTime);
    document.getElementById("ets").value = formatDateTimeForInput(etsTime);
    

    // Apply settings if available
    const settingsParam = params.get("settings");
    if (settingsParam) {
        applySettings(settingsParam);
    }

}

export function updateURL() {
    // Get date objects from the form inputs (these will be in local timezone)
    const stsElement = document.getElementById("sts");
    const etsElement = document.getElementById("ets");
    
    // Convert to UTC for the URL parameters
    const stsDate = new Date(stsElement.value);
    const etsDate = new Date(etsElement.value);
    
    // Format dates in YYYYmmddHH24MI format (UTC)
    const sts = stsDate.getUTCFullYear().toString().padStart(4, '0') +
               (stsDate.getUTCMonth() + 1).toString().padStart(2, '0') +
               stsDate.getUTCDate().toString().padStart(2, '0') +
               stsDate.getUTCHours().toString().padStart(2, '0') +
               stsDate.getUTCMinutes().toString().padStart(2, '0');
               
    const ets = etsDate.getUTCFullYear().toString().padStart(4, '0') +
               (etsDate.getUTCMonth() + 1).toString().padStart(2, '0') +
               etsDate.getUTCDate().toString().padStart(2, '0') +
               etsDate.getUTCHours().toString().padStart(2, '0') +
               etsDate.getUTCMinutes().toString().padStart(2, '0');
    
    const by = document.querySelector("input[type=radio][name=by]:checked").value;
    const wfos = getSelectedValues(document.getElementById('wfo'));
    const states = getSelectedValues(document.getElementById('state'));
    
    // Create URLSearchParams object
    const params = new URLSearchParams();
    
    // Add type filter parameters
    const lsrTypes = getState(StateKeys.LSR_TYPES);
    const sbwTypes = getState(StateKeys.SBW_TYPES);
    
    if (lsrTypes && lsrTypes.length > 0) {
        params.set("lsrTypes", lsrTypes.join(","));
    }
    
    if (sbwTypes && sbwTypes.length > 0) {
        params.set("sbwTypes", sbwTypes.join(","));
    }
    
    // Add selection parameters
    params.set("by", by);
    if (by === "wfo" && wfos.length > 0) {
        params.set("wfo", wfos.join(","));
    } else if (by === "state" && states.length > 0) {
        params.set("state", states.join(","));
    }
    
    // Add time parameters in YYYYmmddHH24MI format
    params.set("sts", sts);
    params.set("ets", ets);
    
    // Add settings
    const settings = generateSettings();
    if (settings) {
        params.set("settings", settings);
    }
    
    // Update URL without reloading the page
    const newUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
}