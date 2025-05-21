import { getState, StateKeys } from './state.js';

export function initializeTimeSlider(containerId, onChangeCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const radarTimeDisplay = document.getElementById('radartime');
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = '100';
    slider.className = 'time-slider';
    container.appendChild(slider);
    const handle = document.createElement('div');
    handle.id = 'custom-handle';
    handle.className = 'ui-slider-handle';
    container.appendChild(handle);

    const updateHandlePosition = () => {
        const percent = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        handle.style.left = `${percent}%`;
    };

    const updateTimeDisplay = (value) => {
        const sts = getState(StateKeys.STS);
        const ets = getState(StateKeys.ETS);
        const increment = (ets - sts) / 1000 / 60 / 100; // minutes
        const minutes = Math.floor(increment * value);
        const newDate = new Date(sts.getTime() + minutes * 60 * 1000);
        // Rectify newDate to nearest 5 minutes
        const dt = new Date(newDate);
        dt.setUTCSeconds(0);
        dt.setUTCMilliseconds(0);
        dt.setUTCMinutes(Math.round(dt.getUTCMinutes() / 5) * 5);
        onChangeCallback(dt);
        const timeStr = dt.toLocaleString();
        if (radarTimeDisplay) {
            radarTimeDisplay.textContent = timeStr;
        }
    };

    slider.addEventListener('input', (event) => {
        const value = parseInt(event.target.value, 10);
        updateHandlePosition();
        updateTimeDisplay(value);
    });

    // Initialize display
    updateHandlePosition();
    updateTimeDisplay(100);
}