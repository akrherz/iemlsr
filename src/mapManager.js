import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import StadiaMaps from 'ol/source/StadiaMaps.js';
import LayerGroup from 'ol/layer/Group';
import { transform } from 'ol/proj';
import { getLSRTable, getSBWTable } from './tableManager.js';
import { handleLSRClick, handleSBWClick } from './featureManager.js';
import { getState, StateKeys } from './state.js';

let n0q = null;
let statesLayer = null;
let countiesLayer = null;

/**
 * Get the N0Q layer instance
 * @returns {TileLayer} The N0Q layer
 */
export function getN0QLayer() {
    return n0q;
}

/**
 * Get the states layer instance
 * @returns {TileLayer} The states layer
 */
export function getStatesLayer() {
    return statesLayer;
}

/**
 * Get the counties layer instance
 * @returns {TileLayer} The counties layer
 */
export function getCountiesLayer() {
    return countiesLayer;
}

/**
 * Creates and returns base layers for the map
 * @returns {LayerGroup} Group containing base layers
 */
function createBaseLayers() {
    return new LayerGroup({
        // @ts-ignore
        title: 'Base Maps',
        layers: [
            new TileLayer({
                // @ts-ignore
                title: 'OpenStreetMap',
                visible: true,
                type: 'base',
                source: new XYZ({
                    url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                })
            }),
            new TileLayer({
                visible: false,
                // @ts-ignore
                title: 'Stadia Maps Alidade Smooth',
                source: new StadiaMaps({
                    layer: 'alidade_smooth_dark',
                    retina: true,
		    apiKey: '72baaf91-97a2-49cd-aa31-ba5c5e48f63b'
                }),
            }),
            new TileLayer({
                // @ts-ignore
                title: "MapTiler Dataviz",
                type: 'base',
                visible: false,
                source: new XYZ({
                    url: 'https://api.maptiler.com/maps/dataviz/{z}/{x}/{y}.png?key=d7EdAVvDI3ocoa9OUt9Z',
                    tileSize: 512,
                    crossOrigin: 'anonymous'
                })
            }),
            new TileLayer({
                // @ts-ignore
                title: "MapTiler Toner v2 (Black/White)",
                type: 'base',
                visible: false,
                source: new XYZ({
                    url: 'https://api.maptiler.com/maps/toner-v2/{z}/{x}/{y}.png?key=d7EdAVvDI3ocoa9OUt9Z',
                    tileSize: 512,
                    crossOrigin: 'anonymous'
                })
            })
        ]
    });
}

export function make_iem_tms(title, layername, visible, type) {
    return new TileLayer({
        // @ts-ignore
        title,
        visible,
        type,
        source: new XYZ({
            url: `https://mesonet.agron.iastate.edu/c/tile.py/1.0.0/${layername}/{z}/{x}/{y}.png`
        })
    });
}

/**
 * Initialize the OpenLayers map
 * @returns {Map} Initialized OpenLayers map
 */
export function initializeMap() {
    const map = new Map({
        target: 'map',
        controls: [],
        view: new View({
            enableRotation: false,
            center: transform([-94.5, 42.1], 'EPSG:4326', 'EPSG:3857'),
            zoom: 7,
            maxZoom: 16
        }),
        layers: [createBaseLayers()]
    });

    // Initialize base layers
    statesLayer = make_iem_tms('US States', 'usstates', true, '');
    map.addLayer(statesLayer);

    countiesLayer = make_iem_tms('US Counties', 'uscounties', false, '');
    map.addLayer(countiesLayer);

    // Initialize n0q radar layer
    n0q = new TileLayer({
        // @ts-ignore
        title: 'NEXRAD Base Reflectivity',
        visible: true,
        source: getRADARSource(getState(StateKeys.ETS))
    });
    map.addLayer(n0q);

    // Ensure map is visible and sized correctly
    map.updateSize();

    // Set up map click handling
    map.on('click', (evt) => {
        const feature = map.forEachFeatureAtPixel(evt.pixel,
            (feature2) => feature2);
        if (feature === undefined) {
            return;
        }
        if (feature.get("phenomena") !== undefined) {
            handleSBWClick(feature, map, getSBWTable());
            return;
        }
        handleLSRClick(feature, map, getLSRTable());
    });

    return map;
}

/**
 * Creates a RADAR source for the given date
 * @param {Date} dt - Date to get RADAR for
 * @returns {XYZ} XYZ source for RADAR tiles
 */
export function getRADARSource(dt) {
    // Format the date to the required format (YYYY-mm-dd-HHMM)
    const dateStr = `${dt.getUTCFullYear()}` +
        `${String(dt.getUTCMonth() + 1).padStart(2, '0')}` +
        `${String(dt.getUTCDate()).padStart(2, '0')}` +
        `${String(dt.getUTCHours()).padStart(2, '0')}` +
        `${String(dt.getUTCMinutes()).padStart(2, '0')}`;

    return new XYZ({
        url: `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-${dateStr}/{z}/{x}/{y}.png`
    });
}
