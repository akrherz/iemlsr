import { Style, Icon, Text, Fill, Stroke } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { lsrtable, sbwtable } from './tableManager.js';
import { updateURL } from './urlHandler.js';
import { iemdata } from './iemdata.js';
// Lookup tables for styling
// Define warning type priorities and colors
const sbwLookup = {
    "TO": '#FF0000',    // Tornado Warning (highest priority)
    "SV": 'yellow',     // Severe Thunderstorm Warning
    "FF": 'green',      // Flash Flood Warning
    "MA": 'purple',     // Marine Warning
    "EW": 'green',      // Extreme Wind Warning
    "FA": 'green',      // Flood Advisory
    "FL": 'green',      // Flood Warning
    "SQ": "#C71585",    // Snow Squall Warning
    "DS": "#FFE4C4"     // Dust Storm Warning
};

// Priority order for warning types (higher index = higher priority)
const sbwPriority = {
    "TO": 1000,  // Tornado (highest)
    "SV": 900,   // Severe Thunderstorm
    "FF": 800,   // Flash Flood
    "EW": 700,   // Extreme Wind
    "SQ": 600,   // Snow Squall
    "DS": 500,   // Dust Storm
    "MA": 400,   // Marine
    "FA": 300,   // Flood Advisory
    "FL": 200    // Flood
};

const lsrLookup = {
    "0": "/lsr/icons/tropicalstorm.gif",
    "1": "/lsr/icons/flood.png",
    "2": "/lsr/icons/other.png",
    "3": "/lsr/icons/other.png",
    "4": "/lsr/icons/other.png",
    "5": "/lsr/icons/ice.png",
    "6": "/lsr/icons/cold.png",
    "7": "/lsr/icons/cold.png",
    "8": "/lsr/icons/fire.png",
    "9": "/lsr/icons/other.png",
    "a": "/lsr/icons/other.png",
    "A": "/lsr/icons/wind.png",
    "B": "/lsr/icons/downburst.png",
    "C": "/lsr/icons/funnelcloud.png",
    "D": "/lsr/icons/winddamage.png",
    "E": "/lsr/icons/flood.png",
    "F": "/lsr/icons/flood.png",
    "v": "/lsr/icons/flood.png",
    "G": "/lsr/icons/wind.png",
    "h": "/lsr/icons/hail.png",
    "H": "/lsr/icons/hail.png",
    "I": "/lsr/icons/hot.png",
    "J": "/lsr/icons/fog.png",
    "K": "/lsr/icons/lightning.gif",
    "L": "/lsr/icons/lightning.gif",
    "M": "/lsr/icons/wind.png",
    "N": "/lsr/icons/wind.png",
    "O": "/lsr/icons/wind.png",
    "P": "/lsr/icons/other.png",
    "q": "/lsr/icons/downburst.png",
    "Q": "/lsr/icons/tropicalstorm.gif",
    "s": "/lsr/icons/sleet.png",
    "T": "/lsr/icons/tornado.png",
    "U": "/lsr/icons/fire.png",
    "V": "/lsr/icons/avalanche.gif",
    "W": "/lsr/icons/waterspout.png",
    "X": "/lsr/icons/funnelcloud.png",
    "x": "/lsr/icons/debrisflow.png",
    "Z": "/lsr/icons/blizzard.png"
};

// Base widths for warning polygon lines (these maintain the ratio between lines)
const BASE_OUTER_WIDTH = 4.5;
const BASE_INNER_WIDTH = 3;
const WIDTH_RATIO = BASE_INNER_WIDTH / BASE_OUTER_WIDTH;  // Maintain ratio between lines
let lineWidthScale = 1.0;  // Will be controlled by the slider

// Default styles
const sbwStyle = [new Style({
    stroke: new Stroke({
        color: '#000',
        width: BASE_OUTER_WIDTH
    }),
    zIndex: undefined  // Will be set dynamically
}), new Style({
    stroke: new Stroke({
        color: '#319FD3',
        width: BASE_INNER_WIDTH
    }),
    zIndex: undefined  // Will be set dynamically
})];

const lsrStyle = new Style({
    image: new Icon({ src: lsrLookup['9'] })
});

const textStyle = new Style({
    text: new Text({
        font: 'bold 11px "Open Sans", "Arial Unicode MS", "sans-serif"',
        fill: new Fill({
            color: 'white'
        }),
        placement: 'point',
        backgroundFill: new Fill({
            color: "black"
        }),
        padding: [2, 2, 2, 2]
    })
});

const lsrTextBackgroundColor = {
    'S': 'purple',
    'R': 'blue',
    '5': 'pink'
};
let lsrLayer = null;
let sbwLayer = null;

/**
 * Get the LSR layer instance
 * @returns {VectorLayer} The LSR layer
 */
export function getLSRLayer() {
    return lsrLayer;
}

/**
 * Get the SBW layer instance
 * @returns {VectorLayer} The SBW layer
 */
export function getSBWLayer() {
    return sbwLayer;
}

// Track if we should use icons instead of magnitude for LSR labels
let useLSRIcons = false;

export function setLSRIconMode(useIcons) {
    useLSRIcons = useIcons;
    if (lsrLayer) {
        lsrLayer.changed(); // Trigger style refresh
    }
}

export function createLSRLayer(TABLE_FILTERED_EVENT, olmap) {
    lsrLayer = new VectorLayer({
        title: "Local Storm Reports",
        source: new VectorSource({
            format: new GeoJSON()
        }),
        style(feature) {
            if (feature.hidden === true) {
                return new Style();
            }
            const mag = feature.get('magnitude').toString();
            const typ = feature.get('type');
            
            // If we want to use magnitude and it's available (unless icons are forced)
            if (!useLSRIcons && mag !== "") {
                textStyle.getText().setText(mag);
                textStyle.getText().getBackgroundFill().setColor(
                    lsrTextBackgroundColor[typ] || 'black'
                );
                return textStyle;
            }
            
            // Use icons for everything else
            const url = lsrLookup[typ];
            if (url) {
                const icon = new Icon({
                    src: url
                });
                lsrStyle.setImage(icon);
            }
            return lsrStyle;
        }
    });

    // Add event listeners
    lsrLayer.addEventListener(TABLE_FILTERED_EVENT, () => {
        // Turn all features back on
        lsrLayer.getSource().getFeatures().forEach((feat) => {
            feat.hidden = false;
        });
        // Filter out the map too
        lsrtable.rows({ "search": "removed" }).every(function() { // skipcq
            lsrLayer.getSource().getFeatureById(this.data().id).hidden = true;
        });
        lsrLayer.changed();
    });

    lsrLayer.getSource().on('change', () => {
        lsrtable.rows().remove().draw();
        if (lsrLayer.getSource().isEmpty()) {
            return;
        }
        if (lsrLayer.getSource().getState() === 'ready') {
            olmap.getView().fit(
                lsrLayer.getSource().getExtent(),
                {
                    size: olmap.getSize(),
                    padding: [50, 50, 50, 50]
                }
            );
        }
        const data = [];
        const types = new Set();
        lsrLayer.getSource().getFeatures().forEach((feat) => {
            const props = feat.getProperties();
            props.id = feat.getId();
            if (props.typetext) {
                types.add(props.typetext);
            }
            data.push(props);
        });
        
        // Update LSR type filter
        const lsrTypeFilter = document.getElementById('lsrtypefilter');
        if (lsrTypeFilter?.tomselect) {
            const currentSelection = lsrTypeFilter.tomselect.getValue();
            lsrTypeFilter.tomselect.clear();
            lsrTypeFilter.tomselect.clearOptions();
            Array.from(types).sort().forEach(type => {
                lsrTypeFilter.tomselect.addOption({ value: type, text: type });
            });
            // Restore previous selection if options still exist
            if (currentSelection.length) {
                const validSelections = currentSelection.filter(value => types.has(value));
                if (validSelections.length) {
                    lsrTypeFilter.tomselect.setValue(validSelections);
                }
            }
        }
        
        lsrtable.rows.add(data).draw();
    });

    lsrLayer.on('change:visible', updateURL);
    return lsrLayer;
}

export function createSBWLayer(TABLE_FILTERED_EVENT) {
    sbwLayer = new VectorLayer({
        title: "Storm Based Warnings",
        source: new VectorSource({
            format: new GeoJSON()
        }),
        visible: true,
        style(feature) {
            if (feature.hidden === true) {
                return new Style();
            }
            const phenomena = feature.get('phenomena');
            const color = sbwLookup[phenomena];
            if (color === undefined) return sbwStyle;
            
            // Set the color and zIndex based on priority
            const zIndex = sbwPriority[phenomena] || 100; // Default priority 100 for unknown types
            sbwStyle[0].setZIndex(zIndex);
            sbwStyle[1].setZIndex(zIndex + 1);
            sbwStyle[1].getStroke().setColor(color);
            
            return sbwStyle;
        }
    });

    sbwLayer.getSource().on('change', () => {
        sbwtable.rows().remove().draw();
        if (sbwLayer.getSource().isEmpty()) {
            return;
        }
        const data = [];
        const types = new Set();
        sbwLayer.getSource().getFeatures().forEach((feat) => {
            const props = feat.getProperties();
            props.id = feat.getId();
            if (props.phenomena) {
                const phenText = iemdata.vtec_phenomena[props.phenomena] || props.phenomena;
                types.add(phenText);
            }
            data.push(props);
        });
        
        // Update SBW type filter
        const sbwTypeFilter = document.getElementById('sbwtypefilter');
        if (sbwTypeFilter?.tomselect) {
            const currentSelection = sbwTypeFilter.tomselect.getValue();
            sbwTypeFilter.tomselect.clear();
            sbwTypeFilter.tomselect.clearOptions();
            Array.from(types).sort().forEach(type => {
                sbwTypeFilter.tomselect.addOption({ value: type, text: type });
            });
            // Restore previous selection if options still exist
            if (currentSelection.length) {
                const validSelections = currentSelection.filter(value => types.has(value));
                if (validSelections.length) {
                    sbwTypeFilter.tomselect.setValue(validSelections);
                }
            }
        }
        
        sbwtable.rows.add(data).draw();
    });


    // Add event listeners
    sbwLayer.on('change:visible', updateURL);
    sbwLayer.addEventListener(TABLE_FILTERED_EVENT, () => {
        // Turn all features back on
        sbwLayer.getSource().getFeatures().forEach((feat) => {
            feat.hidden = false;
        });
        // Filter out the map too
        sbwtable.rows({ "search": "removed" }).every(function() { // skipcq
            sbwLayer.getSource().getFeatureById(this.data().id).hidden = true;
        });
        sbwLayer.changed();
    });
    return sbwLayer;
}

/**
 * Update the line width of Storm Based Warning polygons
 * @param {number} scale - Scale factor from 0.1 to 10 for line width
 */
/**
 * Update the line width of Storm Based Warning polygons
 * @param {number} scale - Scale value from 0-100 from the slider
 */
export function updateSBWLineWidth(scale) {
    // Convert 0-100 range to 0.1-10 range logarithmically
    lineWidthScale = Math.exp(Math.log(0.1) + (Math.log(10) - Math.log(0.1)) * (scale / 100));
    const outerWidth = BASE_OUTER_WIDTH * lineWidthScale;
    
    sbwStyle[0].getStroke().setWidth(outerWidth);
    sbwStyle[1].getStroke().setWidth(outerWidth * WIDTH_RATIO);  // Maintain ratio
    if (sbwLayer) {
        sbwLayer.changed();  // Trigger redraw
    }
}
