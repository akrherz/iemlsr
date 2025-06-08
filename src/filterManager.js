import TomSelect from 'tom-select';
import { wfos, states } from 'iemjs/iemdata';
import { getLSRTable, getSBWTable } from './tableManager.js';
import { setState, getState, StateKeys} from './state.js';

/**
 * Common configuration for tom-select instances
 */
const BASE_CONFIG = {
    allowEmptyOption: true,
    maxOptions: 1000, // ts did not like this being set to null
    plugins: {
        clear_button: {
            title: 'Remove all selected options'
        }
    }
};

/**
 * Initialize the LSR type filter
 * @param {string} divid - The select element to transform
 * @returns {TomSelect} Initialized tom-select instance
 */
function initializeLSRTypeFilter(divid) {
    const filter = new TomSelect(divid, {
        ...BASE_CONFIG,
        placeholder: "Filter LSRs by Event Type",
        maxItems: null, // Allow multiple selections
    });

    filter.on('change', () => {
        const vals = filter.getValue();
        let val = null;
        if (vals instanceof Array) {
            // Join selected values with pipe for regex matching
            val = vals.join("|");
        }
        getLSRTable().column(3).search(val ? `^${val}$` : '', true, false).draw();
        setState(StateKeys.LSR_TYPES, vals);
    });

    return filter;
}

/**
 * Initialize the SBW type filter
 * @param {string} divid - The select element to transform
 * @returns {TomSelect} Initialized tom-select instance
 */
function initializeSBWTypeFilter(divid) {
    const filter = new TomSelect(divid, {
        ...BASE_CONFIG,
        placeholder: "Filter SBWs by Event Type",
        maxItems: null, // Allow multiple selections
    });

    filter.on('change', () => {
        const vals = filter.getValue();
        let val = null;
        if (vals instanceof Array) {
            // Join selected values with pipe for regex matching
            val = vals.join("|");
        }
        getSBWTable().column(3).search(val ? `^${val}$` : '', true, false).draw();
        setState(StateKeys.SBW_TYPES, vals);
    });

    return filter;
}

/**
 * Initialize a location select (WFO or State)
 * @param {string} divid - The select element to transform
 * @param {Array<Array<string>>} data - Array of [value, text] pairs for options
 * @param {string} filterType - Type of filter (wfo or state)
 * @returns {TomSelect} Initialized tom-select instance
 */
function initializeLocationSelect(divid, data, filterType) {
    const select = new TomSelect(divid, {
        ...BASE_CONFIG,
        maxItems: null,
        searchField: ['value', 'text'],
        render: {
            item: (ldata) => `<div>[${ldata.value}] ${ldata.text}</div>`,
            option: (ldata) => `<div>[${ldata.value}] ${ldata.text}</div>`
        }
    });

    // Populate options
    data.forEach(([value, text]) => {
        select.addOption({ value, text });
    });

    select.on('change', () => {
        const vals = select.getValue();
        const stateKey = filterType === 'wfo' ? StateKeys.WFO_FILTER : StateKeys.STATE_FILTER;
        setState(stateKey, vals);
    });

    return select;
}

/**
 * Initialize radio button handlers for filter type
 */
function initializeFilterTypeHandlers() {
    const radioButtons = document.querySelectorAll('input[type=radio][name=by]');
    const byState = getState(StateKeys.BY_STATE);

    // Set initial radio button state
    radioButtons.forEach(radio => {
        if (radio instanceof HTMLInputElement) {
            radio.checked = (radio.value === 'state') === byState;
        }
    });
    
    // Add change event handlers
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const target = e.target;
            if (target instanceof HTMLInputElement) {
                const isByState = target.value === 'state';
                setState(StateKeys.BY_STATE, isByState);
            }
        });
    });
}

/**
 * Initialize all filters for the application
 * @returns {object} Object containing all initialized filters
 */
export function initializeFilters() {
    // Initialize LSR and SBW type filters
    const lsrtypefilter = initializeLSRTypeFilter('#lsrtypefilter');

    const sbwtypefilter = initializeSBWTypeFilter('#sbwtypefilter');

    // Initialize location selectors
    const wfoSelect = initializeLocationSelect(
        '#wfo',
        wfos,
        'wfo'
    );

    const stateSelect = initializeLocationSelect(
        '#state',
        states,
        'state'
    );

    // Set initial values from state
    const byState = getState(StateKeys.BY_STATE);
    const wfoFilter = getState(StateKeys.WFO_FILTER) || [];
    const stateFilter = getState(StateKeys.STATE_FILTER) || [];

    // Set initial radio button state
    const stateRadio = document.querySelector('input[type=radio][name=by][value=state]');
    const wfoRadio = document.querySelector('input[type=radio][name=by][value=wfo]');
    if (stateRadio instanceof HTMLInputElement && wfoRadio instanceof HTMLInputElement) {
        if (byState) {
            stateRadio.checked = true;
            wfoRadio.checked = false;
        } else {
            wfoRadio.checked = true;
            stateRadio.checked = false;
        }
    }

    // Set initial selections
    if (Array.isArray(wfoFilter) && wfoFilter.length > 0) {
        wfoSelect.setValue(wfoFilter);
    }
    if (Array.isArray(stateFilter) && stateFilter.length > 0) {
        stateSelect.setValue(stateFilter);
    }

    initializeFilterTypeHandlers();

    return {
        lsrtypefilter,
        sbwtypefilter,
        wfoSelect,
        stateSelect,
        getValue: () => ({
            // @ts-ignore
            byState: document.querySelector('input[type=radio][name=by][value=state]').checked,
            wfos: wfoSelect.getValue(),
            states: stateSelect.getValue(),
            lsrTypes: lsrtypefilter.getValue(),
            sbwTypes: sbwtypefilter.getValue()
        })
    };
}
