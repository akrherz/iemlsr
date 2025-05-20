import { getTimeRange } from './timeUtils.js';

/**
 * Build options for data requests based on current filters and time range
 * @param {object} filters Filter selections
 * @param {Function} filters.wfoSelect.getValue Get selected WFOs
 * @param {Function} filters.stateSelect.getValue Get selected states
 * @returns {object} Request options
 */
export function buildRequestOptions(filters) {
    if (!filters) {
        return;
    }
    const byStateRadio = document.querySelector('input[type=radio][name=by][value=state]');
    const by = byStateRadio.checked ? 'state' : 'wfo';
    const wfos = filters.wfoSelect.getValue();
    const states = filters.stateSelect.getValue();
    
    const timeRange = getTimeRange(
        document.getElementById("sts"),
        document.getElementById("ets")
    );
    
    const opts = { ...timeRange };
    if (by === "state") {
        opts.states = states.length ? encodeURIComponent(states.join(",")) : "";
    } else {
        opts.wfos = wfos.length ? encodeURIComponent(wfos.join(",")) : "";
    }
    return opts;
}
