import './style.css';
import './styles/popups.css';
import 'ol/ol.css';
import 'tom-select/dist/css/tom-select.css';
import '@shoelace-style/shoelace/dist/themes/light.css';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';
// Import the drawer components
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

// Set the base path for Shoelace assets
setBasePath('/node_modules/@shoelace-style/shoelace/dist');

import { initializeMap } from './mapManager.js';
import { parseHref, migrateHashToParams } from './urlHandler.js';
import { createLSRLayer, createSBWLayer } from './layerManager.js';
import { initializeUI } from './uiManager.js';
import { initializeLSRTable, initializeSBWTable } from './tableManager.js';
import { initializeFilters } from './filterManager.js';
import { initializeExportHandlers } from './exportManager.js';
import { setState, StateKeys, getState } from './state.js';
import { loadData } from './dataManager.js';
import { initializeLayerControls } from './layerControlManager.js';
import { startCronTasks } from './cronManager.js';
import { initializeRightPane } from './rightPaneManager.js';
import { initializeTabs } from './tabs.js';
import { applySettings } from './settingsManager.js';

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
    initializeLSRTable("tfe", document.getElementById('lsrtable'), olmap);
    initializeSBWTable("tfe", document.getElementById('sbwtable'), olmap);

    // Initialize the right pane and tabs
    initializeRightPane();
    initializeTabs();

    // Initialize filters with state from URL parameters
    const filters = initializeFilters();
    setState(StateKeys.FILTERS, filters);
    // Initialize export handlers
    initializeExportHandlers(filters);

    // Create LSR and SBW layers
    olmap.addLayer(createLSRLayer("tfe", olmap));
    olmap.addLayer(createSBWLayer("tfe"));

    initializeLayerControls(olmap);

    // Apply URL-based settings after all layers and controls are initialized
    // This ensures settings from URL parameters are properly applied at page load
    const initialSettings = getState(StateKeys.LAYER_SETTINGS);
    if (initialSettings) {
        applySettings(initialSettings);
    }

    // Start the realtime cron tasks
    startCronTasks();

    // Finally, load the data
    loadData();
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApplication);

