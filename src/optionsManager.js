import { getFilters, getState, StateKeys } from './state.js';

/**
 * Build options for data requests based on current filters and time range
 * @param {object} filters Filter selections
 * @param {Function} filters.wfoSelect.getValue Get selected WFOs
 * @param {Function} filters.stateSelect.getValue Get selected states
 * @returns {object} Request options
 */
export function buildRequestOptions() {
    const filters = getFilters();
    if (!filters) {
        return;
    }
    const byStateRadio = document.querySelector('input[type=radio][name=by][value=state]');
    const by = byStateRadio.checked ? 'state' : 'wfo';
    const wfos = filters.wfoSelect.getValue();
    const states = filters.stateSelect.getValue();
    
    // Get times directly from state
    const stsTime = getState(StateKeys.STS);
    const etsTime = getState(StateKeys.ETS);
    
    const opts = {
        sts: stsTime.toISOString(),
        ets: etsTime.toISOString()
    };
    if (by === "state") {
        opts.states = states.length ? encodeURIComponent(states.join(",")) : "";
    } else {
        opts.wfos = wfos.length ? encodeURIComponent(wfos.join(",")) : "";
    }
    return opts;
}
