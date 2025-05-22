import { getState, setState, StateKeys } from './state.js';
import { generateSettings } from './settingsManager.js';

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
 * Parse URL parameters and initialize state
 */
export function parseHref() {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    
    // Check for selection type and IDs
    const by = params.get("by") || "wfo";
    
    // Store the selection type in state for WFO/state selector initialization
    setState(StateKeys.BY_STATE, by === "state");
    
    // Handle WFO filter
    const wfoParam = params.get("wfo");
    if (wfoParam) {
        const wfoIds = wfoParam.split(",");
        setState(StateKeys.WFO_FILTER, wfoIds);
    }
    
    // Handle state filter
    const stateParam = params.get("state");
    if (stateParam) {
        const stateIds = stateParam.split(",");
        setState(StateKeys.STATE_FILTER, stateIds);
    }

    // Handle time parameters
    const stsParam = params.get("sts");
    const etsParam = params.get("ets");
    const secondsParam = params.get("seconds");
    
    let stsTime;
    let etsTime;
    
    if (stsParam && etsParam) {
        // Parse full date/time in YYYYmmddHH24MI format (already in UTC)
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
        const seconds = Math.abs(parseInt(secondsParam, 10));
        // Provision of seconds parameter indicates realtime mode
        setState(StateKeys.REALTIME, true);
        setState(StateKeys.SECONDS, seconds);
        etsTime = new Date();
        etsTime.setTime(etsTime.getTime());
        stsTime = new Date(etsTime.getTime() - (seconds * 1000));
    } else {
        etsTime = new Date();
        etsTime.setTime(etsTime.getTime());
        stsTime = new Date(etsTime.getTime() - 24 * 60 * 60 * 1000);
    }
    // check that stsTime and etsTime are valid dates
    if (stsTime instanceof Date && !isNaN(stsTime) &&
        etsTime instanceof Date && !isNaN(etsTime)) {
        setState(StateKeys.STS, stsTime);
        setState(StateKeys.ETS, etsTime);
    }

    // Handle settings parameter
    const settingsParam = params.get("settings");
    if (settingsParam) {
        setState(StateKeys.LAYER_SETTINGS, settingsParam);
    }

}

export function updateURL() {
    // Get dates directly from state
    const stsDate = getState(StateKeys.STS);
    const etsDate = getState(StateKeys.ETS);
    
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
    
    // Get selection type and filters from state
    const by = getState(StateKeys.BY_STATE) ? "state" : "wfo";
    const wfoFilter = getState(StateKeys.WFO_FILTER) || [];
    const stateFilter = getState(StateKeys.STATE_FILTER) || [];
    
    // Create URLSearchParams object
    const params = new URLSearchParams();
    
    // Add selection parameters
    params.set("by", by);
    if (by === "wfo" && wfoFilter.length > 0) {
        params.set("wfo", wfoFilter.join(","));
    } else if (by === "state" && stateFilter.length > 0) {
        params.set("state", stateFilter.join(","));
    }
    const realtime = getState(StateKeys.REALTIME);
    if (realtime) {
        const seconds = getState(StateKeys.SECONDS);
        params.set("seconds", seconds);
    } else {
        params.set("sts", sts);
        params.set("ets", ets);
    }

    // Add settings
    const settings = generateSettings();
    if (settings) {
        params.set("settings", settings);
    }
    
    // Update URL without reloading the page
    const newUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
}