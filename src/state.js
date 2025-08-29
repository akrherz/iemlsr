export const StateKeys = {
    FILTERS: 'filters',
    REALTIME: 'realtime',
    LSR_TYPES: 'lsrTypes',
    SBW_TYPES: 'sbwTypes',
    LSR_MAGNITUDE_OPERATOR: 'lsrMagnitudeOperator',
    LSR_MAGNITUDE_VALUE: 'lsrMagnitudeValue',
    WFO_FILTER: 'wfoFilter',
    STATE_FILTER: 'stateFilter',
    BY_STATE: 'byState',
    LAYER_SETTINGS: 'layerSettings',
    STS: 'sts',
    ETS: 'ets',
    SECONDS: 'seconds'
};

const state = {
    [StateKeys.FILTERS]: null,
    [StateKeys.REALTIME]: false,
    [StateKeys.LSR_TYPES]: [],
    [StateKeys.SBW_TYPES]: [],
    [StateKeys.LSR_MAGNITUDE_OPERATOR]: 'gte',
    [StateKeys.LSR_MAGNITUDE_VALUE]: null,
    [StateKeys.WFO_FILTER]: [],
    [StateKeys.STATE_FILTER]: [],
    [StateKeys.BY_STATE]: false,
    [StateKeys.LAYER_SETTINGS]: '',
    [StateKeys.STS]: new Date(Date.now() - 24 * 60 * 60 * 1000),
    [StateKeys.ETS]: new Date(),
    [StateKeys.SECONDS]: 4 * 60 * 60
};

const subscribers = {};

/**
 * Get the current state
 * @param {string} key 
 * @returns {*}
 */
export function getState(key) {
    return state[key];
}

/**
 * Get the current state for dates
 * @param {string} key 
 * @returns {Date}
 */
export function getStateDate(key) {
    return state[key];
}

/**
 * Set the state
 * @param {string} key 
 * @param {string | number | boolean | Date | Array} value 
 * @returns 
 */
export function setState(key, value) {
    if (!key) {
        return;
    }
    state[key] = value;
    notifySubscribers(key);
}

export function subscribeToState(key, callback) {
    if (!subscribers[key]) {
        subscribers[key] = [];
    }
    if (typeof callback === 'function') {
        subscribers[key].push(callback);
    }
}

function notifySubscribers(key) {
    if (subscribers[key]) {
        subscribers[key].forEach((callback) => callback(state[key]));
    }
}

// ----------------- HELPERS

/**
 * Get the current STS as a Date object
 * @returns {Date}
 */
export function getStateSTS() {
    return getStateDate(StateKeys.STS);
}

/**
 * Get the current ETS as a Date object
 * @returns {Date}
 */
export function getStateETS() {
    return getStateDate(StateKeys.ETS);
}

export function getRealtime() {
    return getState(StateKeys.REALTIME);
}

export function setRealtime(value) {
    setState(StateKeys.REALTIME, Boolean(value));
}
