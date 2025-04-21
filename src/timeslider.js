export function initializeTimeSlider(containerId, onChangeCallback) {
    const container = document.getElementById(containerId);
    const handle = document.createElement('div');
    handle.id = 'custom-handle';
    handle.className = 'ui-slider-handle';
    container.appendChild(handle);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = '0';
    slider.className = 'time-slider';
    container.appendChild(slider);

    const updateHandle = (value) => {
        const dt = new Date();
        dt.setUTCMinutes(dt.getUTCMinutes() + value * 5);
        handle.textContent = dt.toLocaleString();
    };

    slider.addEventListener('input', (event) => {
        const value = parseInt(event.target.value, 10);
        updateHandle(value);
        if (onChangeCallback) {
            onChangeCallback(value);
        }
    });

    updateHandle(0);
}