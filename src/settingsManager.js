import { getN0QLayer, getStatesLayer, getCountiesLayer } from "./mapManager";
import { getLSRLayer, getSBWLayer, setLSRIconMode } from "./layerManager";
import { getState, setState, StateKeys } from "./state";

/**
 * Generate settings string based on layer visibility
 * @returns {string} Settings string
 */
export function generateSettings() {
    const realtime = getState(StateKeys.REALTIME);
    let res = "";
    res += (getN0QLayer().getVisible() ? "1" : "0");
    res += (getLSRLayer().getVisible() ? "1" : "0");
    res += (getSBWLayer().getVisible() ? "1" : "0");
    res += (realtime ? "1" : "0");
    res += (getStatesLayer().getVisible() ? "1" : "0");
    res += (getCountiesLayer().getVisible() ? "1" : "0");
    res += (document.getElementById("lsr-label-mode").checked ? "1" : "0");
    return res;
}

/**
 * Apply settings to layers and controls
 * @param {string[]} opts Settings array
 */
export function applySettings(opts) {
    if (opts[0] !== undefined) { // Show RADAR
        getN0QLayer().setVisible(opts[0] === "1");
    }
    if (opts[1] !== undefined) { // Show LSRs
        getLSRLayer().setVisible(opts[1] === "1");
    }
    if (opts[2] !== undefined) { // Show SBWs
        getSBWLayer().setVisible(opts[2] === "1");
    }
    if (opts[3] === "1") { // Realtime
        setState(StateKeys.REALTIME, true);
        document.getElementById("realtime").checked = true;
    }
    if (opts[4] !== undefined) {
        getStatesLayer().setVisible(opts[4] === "1");
    }
    if (opts[5] !== undefined) {
        getCountiesLayer().setVisible(opts[5] === "1");
    }
    if (opts[6] !== undefined) { // LSR Label Mode
        const useLSRIcons = opts[6] === "1";
        document.getElementById("lsr-label-mode").checked = useLSRIcons;
        setLSRIconMode(useLSRIcons);
    }
}
