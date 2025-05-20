const STATE_KEY = 'iemlsr_state';

export const StateKeys = {
    FILTERS: 'filters',
    REALTIME: 'realtime',
    LSR_TYPES: 'lsrTypes',
    SBW_TYPES: 'sbwTypes',
    WFO_FILTER: 'wfoFilter',
    STATE_FILTER: 'stateFilter',
    BY_STATE: 'byState',
    LAYER_SETTINGS: 'layerSettings'
};

const state = {
    [StateKeys.FILTERS]: null,
    [StateKeys.REALTIME]: false,
    [StateKeys.LSR_TYPES]: [],
    [StateKeys.SBW_TYPES]: [],
    [StateKeys.WFO_FILTER]: [],
    [StateKeys.STATE_FILTER]: [],
    [StateKeys.BY_STATE]: false,
    [StateKeys.LAYER_SETTINGS]: ''
};

const subscribers = {};

export function getState(key) {
    return state[key];
}

export function setState(key, value) {
    if (!key) return;
    const oldValue = state[key];
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

// Specialized getters/setters for common state
export function getFilters() {
    return getState(StateKeys.FILTERS);
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

export function saveState() {
    const stateToSave = {
        realtime: getRealtime(),
        layerSettings: getLayerSettings(),
        filters: {
            lsrTypes: getState(StateKeys.LSR_TYPES),
            sbwTypes: getState(StateKeys.SBW_TYPES),
            wfoFilter: getState(StateKeys.WFO_FILTER),
            stateFilter: getState(StateKeys.STATE_FILTER),
            byState: getState(StateKeys.BY_STATE)
        }
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(stateToSave));
}

export function loadState() {
    const savedState = localStorage.getItem(STATE_KEY);
    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);
            if (parsedState.realtime !== undefined) {
                setRealtime(parsedState.realtime);
            }
            if (parsedState.layerSettings) {
                setLayerSettings(parsedState.layerSettings);
            }
            if (parsedState.filters) {
                setState(StateKeys.LSR_TYPES, parsedState.filters.lsrTypes || []);
                setState(StateKeys.SBW_TYPES, parsedState.filters.sbwTypes || []);
                setState(StateKeys.WFO_FILTER, parsedState.filters.wfoFilter || []);
                setState(StateKeys.STATE_FILTER, parsedState.filters.stateFilter || []);
                setState(StateKeys.BY_STATE, parsedState.filters.byState || false);
            }
        } catch (e) {
            console.error('Failed to parse saved state:', e);
        }
    }
}
