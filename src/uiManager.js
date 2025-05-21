import { initializeTimeSlider } from './timeslider.js';
import { getRADARSource, n0q } from './mapManager.js';
import { loadData } from './dataManager.js';
import { getState, setState, StateKeys, setRealtime, subscribeToState } from './state.js';
import { toLocaleString, setupTimeEventHandlers, updateTimeInputs, formatForDateTimeLocal } from './timeUtils.js';
import { updateBrandingOverlay } from './brandingOverlay.js';

/**
 * Initialize all UI components
 */
export function initializeUI() {
    // Initialize time inputs
    const stsInput = document.getElementById('sts');
    const etsInput = document.getElementById('ets');

    const initialSts = getState(StateKeys.STS);
    const initialEts = getState(StateKeys.ETS);
    stsInput.value = formatForDateTimeLocal(initialSts);
    etsInput.value = formatForDateTimeLocal(initialEts);
    // Subscribe to state changes for UI elements
    subscribeToState(StateKeys.STS, (newTime) => {
        stsInput.value = formatForDateTimeLocal(newTime);
    });

    subscribeToState(StateKeys.ETS, (newTime) => {
        etsInput.value = formatForDateTimeLocal(newTime);
    });

    const realtimeCheckbox = document.getElementById('realtime');
    realtimeCheckbox.checked = getState(StateKeys.REALTIME);
    subscribeToState(StateKeys.REALTIME, (isRealtime) => {
        realtimeCheckbox.checked = isRealtime;
        updateTimeInputs(stsInput, etsInput, isRealtime);
    });

    subscribeToState(StateKeys.LAYER_SETTINGS, (settings) => {
        if (settings) {
            applySettings(settings);
        }
    });

    // Set up event handlers for time inputs
    setupTimeEventHandlers(stsInput, etsInput, getState(StateKeys.REALTIME), loadData);

    // Initialize time slider
    initializeTimeSlider('timeslider', (dt) => {
        n0q?.setSource(getRADARSource(dt));
        updateBrandingOverlay(`IEM LSR App: RADAR: ${toLocaleString(dt)}`)
    });

    // Handle realtime toggle
    document.getElementById('realtime').addEventListener('change', (event) => {
        const realtime = event.target.checked;
        setRealtime(realtime);
        
        if (realtime) {
            // Set the initial 4-hour window when enabling realtime
            const now = new Date();
            const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
            setState(StateKeys.ETS, now);
            setState(StateKeys.STS, fourHoursAgo);

            // Immediately load new data
            loadData();
        }
    });

    // Handle load button click
    const loadButton = document.getElementById('load');
    loadButton.addEventListener('click', () => {
        // Clear input-changed class from all inputs with that class
        document.querySelectorAll('.input-changed').forEach(input => {
            input.classList.remove('input-changed');
        });
        loadButton.classList.remove('load-needed');
        setTimeout(loadData, 0);
    });

    // Add change event listener to any input that should trigger load button highlight
    document.querySelectorAll('.input-field').forEach(input => {
        input.addEventListener('change', () => {
            loadButton.classList.add('load-needed');
        });
    });
}
