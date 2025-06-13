import { getN0QLayer, getStatesLayer, getCountiesLayer } from './mapManager.js';
import { getLSRLayer, getSBWLayer, setLSRIconMode, updateSBWLineWidth } from './layerManager.js';
import { updateURL } from './urlHandler.js';
import { requireElement, requireInputElement, requireSelectElement } from 'iemjs/domUtils';

/**
 * Initialize layer controls in the drawer
 * @param {*} map OpenLayers map instance
 */
export function initializeLayerControls(map) {
    const baseLayers = map.getLayers().item(0).getLayers().getArray();
    
    // Base layer selection
    const baseLayerSelect = requireSelectElement('baseLayer');
    baseLayerSelect.addEventListener('change', () => {
        baseLayers.forEach((layer, index) => {
            layer.setVisible(index === baseLayerSelect.selectedIndex);
        });
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
    const sbwWidth = requireInputElement('sbw-width');
    const sbwWidthValue = requireElement('sbw-width-value');
    // Set initial value
    updateSBWLineWidth(parseFloat(sbwWidth.value));
    // Handle changes
    sbwWidth.addEventListener('input', () => {
        const scale = Math.exp(Math.log(0.1) + (Math.log(10) - Math.log(0.1)) * (
            parseFloat(sbwWidth.value) / 100));
        sbwWidthValue.textContent = `${scale.toFixed(1)}×`;
        updateSBWLineWidth(parseFloat(sbwWidth.value));
    });

    // Setup LSR label mode toggle
    const lsrLabelMode = requireInputElement('lsr-label-mode');
    lsrLabelMode.addEventListener('change', () => {
        setLSRIconMode(lsrLabelMode.checked);
        updateURL();
    });
}

/**
 * Set up a layer visibility toggle
 * @param {string} id Element ID of the checkbox
 * @param {*} layer OpenLayers layer to control
 */
function setupLayerToggle(id, layer) {
    const checkbox = requireInputElement(id);
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
 * @param {*} layer OpenLayers layer to control
 */
function setupOpacityControl(id, layer) {
    const slider = requireInputElement(id);
    // Set initial state
    slider.value = `${layer.getOpacity() * 100}`;
    // Handle changes
    slider.addEventListener('input', () => {
        layer.setOpacity(parseFloat(slider.value) / 100);
    });
    // Update slider when opacity changes
    layer.on('change:opacity', () => {
        slider.value = `${layer.getOpacity() * 100}`;
    });
}
