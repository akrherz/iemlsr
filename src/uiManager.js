import { initializeTimeSlider } from './timeslider.js';
import { getRADARSource } from './mapManager.js';
import { initializeDrawerControls } from './drawerManager.js';
import { initializeTabs } from './tabs.js';
import { initializeReportsModal } from './modalManager.js';
import { n0q } from './mapManager.js';
import { updateRADARTimes } from './timeUtils.js';

/**
 * Initialize all UI components
 * @param {Object} options Configuration object containing all required dependencies
 * @returns {Object} Object containing initialized UI components
 */
export function initializeUI() {
    // Initialize time slider
    initializeTimeSlider('timeslider', (value) => {
        const dt = new Date(nexradBaseTime);
        dt.setUTCMinutes(dt.getUTCMinutes() + value * 5);
        n0q.setSource(getRADARSource(dt));
    });

    // Handle realtime toggle
    document.getElementById('realtime').addEventListener('change', function() {
        setRealtime(this.checked);
    });

    updateRADARTimes();

    document.getElementById('load').addEventListener('click', () => {
        setTimeout(loadData, 0);
    });


    // Initialize drawer controls
    initializeDrawerControls(
        document.getElementById('controls-drawer'),
        document.getElementById('drawer-toggle-left'),
        document.getElementById('drawer-close-left')
    );

    // Initialize tabs and modals
    initializeTabs();
    initializeReportsModal();

}
