import './style.css';
import './styles/popups.css';
import 'ol/ol.css';
import 'ol-layerswitcher/src/ol-layerswitcher.css';
import 'tom-select/dist/css/tom-select.css';

import { initializeMap } from './mapManager.js';
import { parseHref, migrateHashToParams } from './urlHandler.js';
import { createLSRLayer, createSBWLayer, initializeLayerSwitcher } from './layerManager.js';
import { initializeUI } from './uiManager.js';
import { initializeLSRTable, initializeSBWTable } from './tableManager.js';
import { initializeFilters } from './filterManager.js';
import { initializeExportHandlers } from './exportManager.js';
import { setFilters } from './state.js';
import { loadData } from './dataManager.js';

function initializeApplication() {
    // First migrate any hash parameters to URL parameters
    // This modifies no state, just prepares the URL for the rest of the app
    migrateHashToParams();

    // Initialize UI components that don't depend on layers
    initializeUI();

    // Initialize filters first (creates UI components)
    const filters = initializeFilters();
    setFilters(filters);

    // Initialize export handlers
    initializeExportHandlers(filters);

    const olmap = initializeMap();
    initializeLayerSwitcher(olmap);

    // Initialize data tables
    initializeLSRTable(document.getElementById('lsrtable'));
    initializeSBWTable(document.getElementById('sbwtable'));

    // Create LSR and SBW layers
    olmap.addLayer(createLSRLayer("tfe", olmap));
    olmap.addLayer(createSBWLayer("tfe"));

    // Initialize URL parameters and data
    parseHref();

    // Finally, load the data
    loadData();
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApplication);

