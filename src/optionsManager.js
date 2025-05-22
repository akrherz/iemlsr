import { getState, StateKeys } from './state.js';

/**
 * Build options for data requests based on current filters and time range
 * @returns {object} Request options
 */
export function buildRequestOptions() {
    const filters = getState(StateKeys.FILTERS);
    if (!filters) {
        return {};
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
        opts.states = states.length ? states.join(",") : "";
    } else {
        opts.wfos = wfos.length ? wfos.join(",") : "";
    }
    return opts;
}
