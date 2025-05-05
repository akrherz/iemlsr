export function initializeTimeSlider(containerId, onChangeCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const radarTimeDisplay = document.getElementById('radartime');
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = '0';
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
        const dt = new Date();
        dt.setUTCMinutes(dt.getUTCMinutes() + value * 5);
        const timeStr = dt.toLocaleString();
        handle.textContent = timeStr;
        if (radarTimeDisplay) {
            radarTimeDisplay.textContent = timeStr;
        }
    };

    slider.addEventListener('input', (event) => {
        const value = parseInt(event.target.value, 10);
        updateHandlePosition();
        updateTimeDisplay(value);
        if (onChangeCallback) {
            onChangeCallback(value);
        }
    });

    // Initialize display
    updateHandlePosition();
    updateTimeDisplay(0);
}