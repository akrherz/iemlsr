export const StateKeys = {
    FILTERS: 'filters',
    REALTIME: 'realtime',
    LSR_TYPES: 'lsrTypes',
    SBW_TYPES: 'sbwTypes',
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
    [StateKeys.WFO_FILTER]: [],
    [StateKeys.STATE_FILTER]: [],
    [StateKeys.BY_STATE]: false,
    [StateKeys.LAYER_SETTINGS]: '',
    [StateKeys.STS]: new Date(Date.now() - 24 * 60 * 60 * 1000),
    [StateKeys.ETS]: new Date(),
    [StateKeys.SECONDS]: 4 * 60 * 60
};

const subscribers = {};

export function getState(key) {
    return state[key];
}

export function setState(key, value) {
    console.error(`Setting state: ${key} = ${value}`);
    if (!key) return;
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

export function setFilters(filters) {
    setState(StateKeys.FILTERS, filters);
}

export function getRealtime() {
    return getState(StateKeys.REALTIME);
}

export function setRealtime(value) {
    setState(StateKeys.REALTIME, Boolean(value));
}

export function getLayerSettings() {
    return getState(StateKeys.LAYER_SETTINGS);
}

export function setLayerSettings(settings) {
    setState(StateKeys.LAYER_SETTINGS, settings);
}

export function getSts() {
    return getState(StateKeys.STS);
}

export function setSts(date) {
    setState(StateKeys.STS, date);
}

export function getEts() {
    return getState(StateKeys.ETS);
}

export function setEts(date) {
    setState(StateKeys.ETS, date);
}
