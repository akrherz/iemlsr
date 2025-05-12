import DataTable from "datatables.net";
import { Style, Icon, Text, Fill, Stroke } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import LayerSwitcher from 'ol-layerswitcher';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
// Lookup tables for styling
const sbwLookup = {
    "TO": '#FF0000',
    "MA": 'purple',
    "FF": 'green',
    "EW": 'green',
    "FA": 'green',
    "FL": 'green',
    "SV": 'yellow',
    "SQ": "#C71585",
    "DS": "#FFE4C4"
};

const lsrLookup = {
    "0": "icons/tropicalstorm.gif",
    "1": "icons/flood.png",
    "2": "icons/other.png",
    "3": "icons/other.png",
    "4": "icons/other.png",
    "5": "icons/ice.png",
    "6": "icons/cold.png",
    "7": "icons/cold.png",
    "8": "icons/fire.png",
    "9": "icons/other.png",
    "a": "icons/other.png",
    "A": "icons/wind.png",
    "B": "icons/downburst.png",
    "C": "icons/funnelcloud.png",
    "D": "icons/winddamage.png",
    "E": "icons/flood.png",
    "F": "icons/flood.png",
    "v": "icons/flood.png",
    "G": "icons/wind.png",
    "h": "icons/hail.png",
    "H": "icons/hail.png",
    "I": "icons/hot.png",
    "J": "icons/fog.png",
    "K": "icons/lightning.gif",
    "L": "icons/lightning.gif",
    "M": "icons/wind.png",
    "N": "icons/wind.png",
    "O": "icons/wind.png",
    "P": "icons/other.png",
    "q": "icons/downburst.png",
    "Q": "icons/tropicalstorm.gif",
    "s": "icons/sleet.png",
    "T": "icons/tornado.png",
    "U": "icons/fire.png",
    "V": "icons/avalanche.gif",
    "W": "icons/waterspout.png",
    "X": "icons/funnelcloud.png",
    "x": "icons/debrisflow.png",
    "Z": "icons/blizzard.png"
};

// Default styles
const sbwStyle = [new Style({
    stroke: new Stroke({
        color: '#000',
        width: 4.5
    })
}), new Style({
    stroke: new Stroke({
        color: '#319FD3',
        width: 3
    })
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

/**
 * Helper function to get selected values from a select element
 * @param {HTMLSelectElement} selectElement 
 * @returns {string[]} Array of selected values
 */
function getSelectedValues(selectElement) {
    return Array.from(selectElement.selectedOptions).map(option => option.value);
}

/**
 * Helper function to set selected values on a select element
 * @param {HTMLSelectElement} selectElement 
 * @param {string[]} values 
 */
function setSelectedValues(selectElement, values) {
    // Clear current selections
    selectElement.querySelectorAll('option').forEach(option => option.selected = false);
    // Set new selections
    values.forEach(value => {
        const option = selectElement.querySelector(`option[value="${value}"]`);
        if (option) option.selected = true;
    });
    // Dispatch change event
    selectElement.dispatchEvent(new Event('change'));
}

/**
 * Creates and initializes the Local Storm Reports DataTable
 * @returns {DataTable} The initialized DataTable instance
 */
export function createLSRTable() {
    const table = document.getElementById('lsrtable');
    return new DataTable(table, {
        select: {
            style: 'single',
            info: false
        },
        rowId: 'id',
        columns: [
            {
                "data": "valid",
                "visible": false
            }, {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            }, {
                "data": "wfo"
            }, {
                "data": "valid",
                "type": "datetime",
                "orderData": [0]
            }, {
                "data": "county"
            }, {
                "data": "city"
            }, {
                "data": "st"
            }, {
                "data": "typetext"
            }, {
                "data": "magnitude"
            }
        ],
        columnDefs: [
            {
                targets: 3,
                render(data) {
                    const date = new Date(data);
                    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
                    const day = date.getUTCDate().toString().padStart(2, '0');
                    const year = date.getUTCFullYear().toString().slice(2);
                    const hours = date.getUTCHours().toString().padStart(2, '0');
                    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                    return `${month}/${day}/${year} ${hours}:${minutes}`;
                }
            }
        ]
    });
}

export function createLSRLayer(updateURLWrapper, TABLE_FILTERED_EVENT, lsrtable, olmap) {
    const lsrLayer = new VectorLayer({
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
            if (mag !== "") {
                textStyle.getText().setText(mag);
                textStyle.getText().getBackgroundFill().setColor(
                    lsrTextBackgroundColor[typ] || 'black'
                );
                return textStyle;
            }
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
        lsrtable.rows({ "search": "removed" }).every(function() {
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
        lsrLayer.getSource().getFeatures().forEach((feat) => {
            const props = feat.getProperties();
            props.id = feat.getId();
            data.push(props);
        });
        lsrtable.rows.add(data).draw();
    });

    lsrLayer.on('change:visible', updateURLWrapper);

    return lsrLayer;
}

export function createSBWLayer(updateURLWrapper, TABLE_FILTERED_EVENT, sbwtable) {
    const sbwLayer = new VectorLayer({
        title: "Storm Based Warnings",
        source: new VectorSource({
            format: new GeoJSON()
        }),
        visible: true,
        style(feature) {
            if (feature.hidden === true) {
                return new Style();
            }
            const color = sbwLookup[feature.get('phenomena')];
            if (color === undefined) return sbwStyle;
            sbwStyle[1].getStroke().setColor(color);
            return sbwStyle;
        }
    });

    // Add event listeners
    sbwLayer.on('change:visible', updateURLWrapper);
    sbwLayer.addEventListener(TABLE_FILTERED_EVENT, () => {
        // Turn all features back on
        sbwLayer.getSource().getFeatures().forEach((feat) => {
            feat.hidden = false;
        });
        // Filter out the map too
        sbwtable.rows({ "search": "removed" }).every(function() {
            sbwLayer.getSource().getFeatureById(this.data().id).hidden = true;
        });
        sbwLayer.changed();
    });

    return sbwLayer;
}

export function make_iem_tms(title, layername, visible, type) {
    return new TileLayer({
        title,
        visible,
        type,
        source: new XYZ({
            url: `https://mesonet.agron.iastate.edu/c/tile.py/1.0.0/${layername}/{z}/{x}/{y}.png`
        })
    });
}

export function initializeLayerSwitcher(map) {
    const ls = new LayerSwitcher();
    map.addControl(ls);
    return ls;
}
