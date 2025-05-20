import './style.css';
import 'ol/ol.css';
import 'ol-layerswitcher/src/ol-layerswitcher.css';
import 'tom-select/dist/css/tom-select.css';

import { initializeMap } from './mapManager.js';
import { parseHref, migrateHashToParams } from './urlHandler.js';
import { createLSRLayer, createSBWLayer } from './layerManager.js';
import { initializeUI } from './uiManager.js';
import { initializeLSRTable, initializeSBWTable } from './tableManager.js';
import { initializeFilters } from './filterManager.js';
import { initializeExportHandlers } from './exportManager.js';
import { setFilters } from './state.js';

function initializeApplication() {
    // First migrate any hash parameters to URL parameters
    migrateHashToParams();

    // Initialize UI components that don't depend on layers
    initializeUI();

    // Initialize filters first (creates UI components)
    const filters = initializeFilters();
    setFilters(filters);

    // Initialize export handlers
    initializeExportHandlers(filters);

    const olmap = initializeMap();

    // Initialize data tables
    initializeLSRTable(document.getElementById('lsrtable'));
    initializeSBWTable(document.getElementById('sbwtable'));

    // Create LSR and SBW layers
    olmap.addLayer(createLSRLayer("tfe", olmap));
    olmap.addLayer(createSBWLayer("tfe"));

    // Initialize URL parameters and data
    parseHref();
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApplication);

