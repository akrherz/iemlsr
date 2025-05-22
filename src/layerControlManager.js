import { getN0QLayer, getStatesLayer, getCountiesLayer } from './mapManager.js';
import { getLSRLayer, getSBWLayer, setLSRIconMode, updateSBWLineWidth } from './layerManager.js';
import { updateURL } from './urlHandler.js';

/**
 * Initialize layer controls in the drawer
 * @param {Map} map OpenLayers map instance
 */
export function initializeLayerControls(map) {
    const baseLayers = map.getLayers().item(0).getLayers().getArray();
    
    // Base layer selection
    const baseLayerSelect = document.getElementById('baseLayer');
    baseLayerSelect.addEventListener('change', () => {
        baseLayers.forEach((layer, index) => {
            layer.setVisible(index === baseLayerSelect.selectedIndex);
        });
        updateURL();
    });

    // Layer visibility toggles
    setupLayerToggle('layer-nexrad', getN0QLayer());
    setupLayerToggle('layer-states', getStatesLayer());
    setupLayerToggle('layer-counties', getCountiesLayer());
    setupLayerToggle('layer-lsr', getLSRLayer());
    setupLayerToggle('layer-sbw', getSBWLayer());

    // Layer opacity controls
    setupOpacityControl('nexrad-opacity', getN0QLayer());
    setupOpacityControl('lsr-opacity', getLSRLayer());
    setupOpacityControl('sbw-opacity', getSBWLayer());

    // Setup SBW line width control
    const sbwWidth = document.getElementById('sbw-width');
    const sbwWidthValue = document.getElementById('sbw-width-value');
    // Set initial value
    updateSBWLineWidth(sbwWidth.value);
    // Handle changes
    sbwWidth.addEventListener('input', () => {
        const scale = Math.exp(Math.log(0.1) + (Math.log(10) - Math.log(0.1)) * (sbwWidth.value / 100));
        sbwWidthValue.textContent = `${scale.toFixed(1)}×`;
        updateSBWLineWidth(sbwWidth.value);
    });

    // Setup LSR label mode toggle
    const lsrLabelMode = document.getElementById('lsr-label-mode');
    lsrLabelMode.addEventListener('change', () => {
        setLSRIconMode(lsrLabelMode.checked);
        updateURL();
    });
}

/**
 * Set up a layer visibility toggle
 * @param {string} id Element ID of the checkbox
 * @param {Layer} layer OpenLayers layer to control
 */
function setupLayerToggle(id, layer) {
    const checkbox = document.getElementById(id);
    // Set initial state
    checkbox.checked = layer.getVisible();
    // Handle changes
    checkbox.addEventListener('change', () => {
        layer.setVisible(checkbox.checked);
        updateURL();
    });
    // Update checkbox when layer visibility changes
    layer.on('change:visible', () => {
        checkbox.checked = layer.getVisible();
    });
}

/**
 * Set up a layer opacity control
 * @param {string} id Element ID of the range input
 * @param {Layer} layer OpenLayers layer to control
 */
function setupOpacityControl(id, layer) {
    const slider = document.getElementById(id);
    // Set initial state
    slider.value = layer.getOpacity() * 100;
    // Handle changes
    slider.addEventListener('input', () => {
        layer.setOpacity(slider.value / 100);
    });
    // Update slider when opacity changes
    layer.on('change:opacity', () => {
        slider.value = layer.getOpacity() * 100;
    });
}
