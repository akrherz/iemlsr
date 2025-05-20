import TomSelect from 'tom-select';
import { iemdata } from './iemdata.js';
import { lsrtable, sbwtable } from './tableManager.js';
import { setState, StateKeys} from './state.js';

/**
 * Common configuration for tom-select instances
 */
const BASE_CONFIG = {
    allowEmptyOption: true,
    plugins: {
        clear_button: {
            title: 'Remove all selected options'
        }
    }
};

/**
 * Initialize the LSR type filter
 * @param {HTMLElement} element - The select element to transform
 * @param {object} lsrtable - DataTable instance for LSRs
 * @returns {TomSelect} Initialized tom-select instance
 */
export function initializeLSRTypeFilter(element, lsrtable) {
    const filter = new TomSelect(element, {
        ...BASE_CONFIG,
        placeholder: "Filter LSRs by Event Type",
        maxItems: null, // Allow multiple selections
    });

    filter.on('change', () => {
        const vals = filter.getValue();
        const val = vals.length ? vals.join("|") : null;
        lsrtable.column(4).search(val ? `^${val}$` : '', true, false).draw();
        setState(StateKeys.LSR_TYPES, vals);
    });

    return filter;
}

/**
 * Initialize the SBW type filter
 * @param {HTMLElement} element - The select element to transform
 * @param {object} sbwtable - DataTable instance for SBWs
 * @returns {TomSelect} Initialized tom-select instance
 */
export function initializeSBWTypeFilter(element, sbwtable) {
    const filter = new TomSelect(element, {
        ...BASE_CONFIG,
        placeholder: "Filter SBWs by Event Type",
        maxItems: null, // Allow multiple selections
    });

    filter.on('change', () => {
        const vals = filter.getValue();
        const val = vals.length ? vals.join("|") : null;
        sbwtable.column(3).search(val ? `^${val}$` : '', true, false).draw();
        setState(StateKeys.SBW_TYPES, vals);
    });

    return filter;
}

/**
 * Initialize a location select (WFO or State)
 * @param {HTMLElement} element - The select element to transform
 * @param {Array<Array<string>>} data - Array of [value, text] pairs for options
 * @param {string} filterType - Type of filter (wfo or state)
 * @returns {TomSelect} Initialized tom-select instance
 */
export function initializeLocationSelect(element, data, filterType) {
    const select = new TomSelect(element, {
        ...BASE_CONFIG,
        maxItems: null,
        render: {
            item: (data) => `<div>[${data.value}] ${data.text}</div>`,
            option: (data) => `<div>[${data.value}] ${data.text}</div>`
        }
    });

    // Populate options
    data.forEach(([value, text]) => {
        select.addOption({ value, text });
    });

    select.on('change', () => {
        const vals = select.getValue();
        setState(
            filterType === 'wfo' ? StateKeys.WFO_FILTER : StateKeys.STATE_FILTER,
            vals
        );
    });

    return select;
}

/**
 * Initialize radio button handlers for filter type
 */
function initializeFilterTypeHandlers() {
    const radioButtons = document.querySelectorAll('input[type=radio][name=by]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isByState = e.target.value === 'state';
            setState(StateKeys.BY_STATE, isByState);
        });
    });
}

/**
 * Initialize all filters for the application
 * @returns {object} Object containing all initialized filters
 */
export function initializeFilters() {
    const lsrtypefilter = initializeLSRTypeFilter(
        document.getElementById('lsrtypefilter'),
        lsrtable
    );

    const sbwtypefilter = initializeSBWTypeFilter(
        document.getElementById('sbwtypefilter'),
        sbwtable
    );

    const wfoSelect = initializeLocationSelect(
        document.getElementById('wfo'),
        iemdata.wfos,
        'wfo'
    );

    const stateSelect = initializeLocationSelect(
        document.getElementById('state'),
        iemdata.states,
        'state'
    );

    initializeFilterTypeHandlers();

    return {
        lsrtypefilter,
        sbwtypefilter,
        wfoSelect,
        stateSelect,
        getValue: () => ({
            byState: document.querySelector('input[type=radio][name=by][value=state]').checked,
            wfos: wfoSelect.getValue(),
            states: stateSelect.getValue(),
            lsrTypes: lsrtypefilter.getValue(),
            sbwTypes: sbwtypefilter.getValue()
        })
    };
}
