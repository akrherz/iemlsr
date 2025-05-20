import './style.css';
import './styles/popups.css';
import 'ol/ol.css';
import 'tom-select/dist/css/tom-select.css';

import { initializeMap } from './mapManager.js';
import { parseHref, migrateHashToParams } from './urlHandler.js';
import { createLSRLayer, createSBWLayer } from './layerManager.js';
import { initializeUI } from './uiManager.js';
import { initializeLSRTable, initializeSBWTable } from './tableManager.js';
import { initializeFilters } from './filterManager.js';
import { initializeExportHandlers } from './exportManager.js';
import { setFilters } from './state.js';
import { loadData } from './dataManager.js';
import { initializeLayerControls } from './layerControlManager.js';
import { startCronTasks } from './cronManager.js';

function initializeApplication() {
    // First migrate any hash parameters to URL parameters
    // This modifies no state, just prepares the URL for the rest of the app
    migrateHashToParams();

    // First parse URL parameters to set initial state
    parseHref();

    // Initialize UI components that don't depend on layers
    initializeUI();

    const olmap = initializeMap();

    // Initialize data tables
    initializeLSRTable("tfe", document.getElementById('lsrtable'));
    initializeSBWTable("tfe", document.getElementById('sbwtable'));

    // Initialize filters with state from URL parameters
    const filters = initializeFilters();
    setFilters(filters);
    // Initialize export handlers
    initializeExportHandlers(filters);

    // Create LSR and SBW layers
    olmap.addLayer(createLSRLayer("tfe", olmap));
    olmap.addLayer(createSBWLayer("tfe"));

    initializeLayerControls(olmap);

    // Start the realtime cron tasks
    startCronTasks();

    // Finally, load the data
    loadData();
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApplication);

