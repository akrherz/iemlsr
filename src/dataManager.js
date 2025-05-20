import GeoJSON from 'ol/format/GeoJSON';
import { getLSRLayer, getSBWLayer } from './layerManager.js';
import { buildRequestOptions } from './optionsManager.js';
import { getState, StateKeys } from './state.js';
import { updateURL } from './urlHandler.js';

/**
 * Load LSR and SBW data from the server
 * @param {object} options Configuration options
 * @param {object} options.filters Filter manager instance
 * @param {Function} options.updateRADARTimes Function to update radar times
 */
export function loadData({ filters, updateRADARTimes }) {
    // Handle tab selection for LSRs
    const activeTab = document.querySelector(".tab .active > a");
    if (activeTab && activeTab.getAttribute("href") !== "#2a") {
        document.getElementById("lsrs").click();
    }
    updateRADARTimes();

    // Clear existing features
    getLSRLayer().getSource().clear(true);
    getSBWLayer().getSource().clear(true);

    // Get current filter values
    const currentFilters = filters.getValue();
    const filterState = {
        byState: currentFilters.byState,
        wfos: currentFilters.wfos,
        states: currentFilters.states,
        lsrTypes: getState(StateKeys.LSR_TYPES),
        sbwTypes: getState(StateKeys.SBW_TYPES)
    };
    
    const opts = buildRequestOptions(filterState);
    const params = new URLSearchParams(opts);

    // Load LSR data
    fetch(`https://mesonet.agron.iastate.edu/geojson/lsr.geojson?${params}`)
        .then(response => response.json())
        .then(data => {
            if (data.features.length === 10000) {
                alert("App limit of 10,000 LSRs reached.");
            }
            getLSRLayer().getSource().addFeatures(
                (new GeoJSON({ featureProjection: 'EPSG:3857' }))
                .readFeatures(data)
            );
        });

    // Load SBW data
    fetch(`https://mesonet.agron.iastate.edu/geojson/sbw.geojson?${params}`)
        .then(response => response.json())
        .then(data => {
            getSBWLayer().getSource().addFeatures(
                (new GeoJSON({ featureProjection: 'EPSG:3857' }))
                .readFeatures(data)
            );
        });

    updateURL();
}
