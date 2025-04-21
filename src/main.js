import './style.css';
import 'ol/ol.css'; // Import OpenLayers CSS
import 'ol-layerswitcher/src/ol-layerswitcher.css'; // Import OpenLayers LayerSwitcher CSS
import 'bootstrap/dist/css/bootstrap.css'; // Import Bootstrap CSS
import select2 from 'select2';
import 'select2/dist/css/select2.css';

import $ from "jquery";

import DataTable from "datatables.net";
import 'datatables.net-dt/css/dataTables.dataTables.css'; // Correct DataTables CSS import
import 'jquery-datetimepicker'; // Correct import for datetimepicker
import 'jquery-datetimepicker/jquery.datetimepicker.css'; // Import CSS for datetimepicker
import Map from 'ol/Map'; // Import OpenLayers Map
import View from 'ol/View'; // Import OpenLayers View
import TileLayer from 'ol/layer/Tile'; // Import OpenLayers TileLayer
import VectorLayer from 'ol/layer/Vector'; // Import OpenLayers VectorLayer
import XYZ from 'ol/source/XYZ'; // Import OpenLayers XYZ source
import VectorSource from 'ol/source/Vector'; // Import OpenLayers Vector source
import GeoJSON from 'ol/format/GeoJSON'; // Import OpenLayers GeoJSON format
import Overlay from 'ol/Overlay'; // Import OpenLayers Overlay
import { Style, Stroke, Icon, Text, Fill } from 'ol/style'; // Import OpenLayers styles
import { transform } from 'ol/proj'; // Import OpenLayers projection transform
import FullScreen from 'ol/control/FullScreen'; // Import OpenLayers FullScreen control
import LayerSwitcher from 'ol-layerswitcher'; // Import OpenLayers LayerSwitcher
import { iemdata } from './iemdata.js'; // Import iemdata
import { initializeTimeSlider } from './timeslider.js';
import { parseHref, updateURL, migrateHashToParams } from './urlHandler.js';
import { initializeTabs } from './tabs.js';

let olmap = null; // Openlayers map
let lsrtable = null; // LSR DataTable
let sbwtable = null; // SBW DataTable
let n0q = null; // RADAR Layer
let countiesLayer = null;
let statesLayer = null;
let wfoSelect = null;
let stateSelect = null;
let lsrtypefilter = null;
let sbwtypefilter = null;
const dateFormat1 = "YYYYMMDDHHmm";
let realtime = false;
const TABLE_FILTERED_EVENT = "tfe";
let nexradBaseTime = new Date();
nexradBaseTime.setUTCMinutes(nexradBaseTime.getUTCMinutes() - (nexradBaseTime.getUTCMinutes() % 5));

// Use momentjs for formatting
$.datetimepicker.setDateFormatter({
    parseDate: (date, format) => new Date(date),
    formatDate: (date, format) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }
});


/**
 * Replace HTML special characters with their entity equivalents
 * @param string val 
 * @returns string converted string
 */
function escapeHTML(val) {
    return val.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

function cronMinute() {
    if (!realtime) return;
    // Compute the delta
    const stsElement = document.getElementById("sts");
    const etsElement = document.getElementById("ets");
    const sts = new Date(stsElement.value);
    const ets = new Date(etsElement.value);
    etsElement.value = new Date().toLocaleString();
    const seconds = (ets - sts) / 1000;  // seconds
    stsElement.value = new Date(Date.now() - seconds * 1000).toLocaleString();
    setTimeout(loadData, 0);
}
function getRADARSource(dt) {
    const prod = dt.getUTCFullYear() < 2011 ? 'N0R' : 'N0Q';
    const formattedDate = dt.toISOString().replace(/[-:T]/g, '').slice(0, 12);
    return new XYZ({
        url: `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-${prod}-${formattedDate}/{z}/{x}/{y}.png`
    });
}

function make_iem_tms(title, layername, visible, type) {
    return new TileLayer({
        title,
        visible,
        type,
        source: new XYZ({
            url: `https://mesonet.agron.iastate.edu/c/tile.py/1.0.0/${layername}/{z}/{x}/{y}.png`
        })
    })
}

const sbwLookup = {
    "TO": 'red',
    "MA": 'purple',
    "FF": 'green',
    "EW": 'green',
    "FA": 'green',
    "FL": 'green',
    "SV": 'yellow',
    "SQ": "#C71585",
    "DS": "#FFE4C4"
};

// Lookup 'table' for styling
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
})
];
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

// create vector layer
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
lsrLayer.addEventListener(TABLE_FILTERED_EVENT, () => {
    // Turn all features back on
    lsrLayer.getSource().getFeatures().forEach((feat) => {
        feat.hidden = false;
    });
    // Filter out the map too
    lsrtable.rows({ "search": "removed" }).every(function () { // this
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

    // Build type filter
    lsrtable.column(7).data().unique().sort().each((d) => {
        lsrtypefilter.append(`<option value="${d}">${d}</option`);
    });
});
lsrLayer.on('change:visible', updateURLWrapper);

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
sbwLayer.on('change:visible', updateURLWrapper);
sbwLayer.addEventListener(TABLE_FILTERED_EVENT, () => {
    // Turn all features back on
    sbwLayer.getSource().getFeatures().forEach((feat) => {
        feat.hidden = false;
    });
    // Filter out the map too
    sbwtable.rows({ "search": "removed" }).every(function() {  // this
        sbwLayer.getSource().getFeatureById(this.data().id).hidden = true;
    });
    sbwLayer.changed();
});
sbwLayer.getSource().on('change', () => {
    sbwtable.rows().remove();
    const data = [];
    sbwLayer.getSource().getFeatures().forEach((feat) => {
        const props = feat.getProperties();
        props.id = feat.getId();
        data.push(props);
    });
    sbwtable.rows.add(data).draw();

    // Build type filter
    sbwtable.column(3).data().unique().sort().each((d) => {
        sbwtypefilter.append(`<option value="${iemdata.vtec_phenomena[d]}">${iemdata.vtec_phenomena[d]}</option`);
    });

});

function formatLSR(data) {
    // Format what is presented
    return `<div><strong>Source:</strong> ${data.source} &nbsp; <strong>UTC Valid:</strong> ${data.valid}<br /><strong>Remark:</strong> ${data.remark}</div>`;
}

function revisedRandId() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}
function lsrHTML(feature) {
    const lines = [];
    const dt = new Date(feature.get("valid"));
    const ldt = dt.toLocaleString();
    const zz = dt.toISOString().slice(11, 16);
    lines.push(`<strong>Valid:</strong> ${ldt} (${zz}Z)`);
    let vv = feature.get("source");
    if (vv !== null) {
        lines.push(`<strong>Source:</strong> ${vv}`);
    }
    vv = feature.get("typetext");
    if (vv !== null) {
        lines.push(`<strong>Type:</strong> ${vv}`);
    }
    vv = feature.get("magnitude");
    if (vv !== null && vv !== "") {
        let unit = feature.get("unit");
        if (unit === null) {
            unit = "";
        }
        lines.push(`<strong>Magnitude:</strong> ${vv} ${unit}`);
    }
    vv = feature.get("remark");
    if (vv !== null) {
        lines.push(`<strong>Remark:</strong> ${vv}`);
    }
    return lines.join("<br />");
}

function formatSBW(feature) {
    const lines = [];
    const ph = feature.get("phenomena");
    const pph = ph in iemdata.vtec_phenomena ? iemdata.vtec_phenomena[ph] : ph;
    const sig = feature.get("significance");
    const ss = sig in iemdata.vtec_significance ? iemdata.vtec_significance[sig] : sig;
    lines.push(`<strong>${pph} ${ss}</strong>`);
    const issue = new Date(feature.get("issue"));
    const expire = new Date(feature.get("expire"));
    let ldt = issue.toLocaleString();
    let zz = issue.toISOString().slice(11, 16);
    lines.push(`<strong>Issued:</strong> ${ldt} (${zz}Z)`);
    ldt = expire.toLocaleString();
    zz = expire.toISOString().slice(11, 16);
    lines.push(`<strong>Expired:</strong> ${ldt} (${zz}Z)`);
    lines.push(`<strong>More Details:</strong> <a href='${feature.get("href")}' target='_blank'>VTEC Browser</a>`);
    return lines.join("<br />");
}

function handleSBWClick(feature) {
    const divid = revisedRandId();
    const div = document.createElement("div");
    const title = `${feature.get("wfo")} ${feature.get("phenomena")}.${feature.get("significance")} #${feature.get("eventid")}`;
    div.innerHTML = `<div class="panel panel-primary panel-popup" id="${divid}"><div class="panel-heading">${title} &nbsp; <button type="button" class="close" data-target="#${divid}" data-dismiss="alert"> <span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button></div><div class="panel-body">${formatSBW(feature)}</div></div>`;
    const coordinates = feature.getGeometry().getFirstCoordinate();
    const marker = new Overlay({
        position: coordinates,
        positioning: 'center-center',
        element: div,
        stopEvent: false,
        dragging: false
    });
    olmap.addOverlay(marker);
    div.addEventListener('mousedown', () => {
        marker.set('dragging', true);
    });
    olmap.on('pointermove', (evt) => {
        if (marker.get('dragging') === true) {
            marker.setPosition(evt.coordinate);
        }
    });
    olmap.on('pointerup', () => {
        if (marker.get('dragging') === true) {
            marker.set('dragging', false);
        }
    });
    const id = feature.getId();
    sbwtable.rows().deselect();
    sbwtable.row(
        sbwtable.rows((idx, data) => {
            if (data.id === id) {
                sbwtable.row(idx).select();
                return true;
            }
            return false;
        })
    ).show().draw(false);

}
function copyToClipboard(ttext, msg) {
    const $temp = $("<input>");
    $("body").append($temp);
    $temp.val(ttext).select();
    document.execCommand("copy");
    $temp.remove();
    alert(msg);  // skipcq
}
 
function initUI() {
    // Generate UI components of the page
    const handle = $("#radartime");
    initializeTimeSlider('timeslider', (value) => {
        const dt = new Date(nexradBaseTime);
        dt.setUTCMinutes(dt.getUTCMinutes() + value * 5);
        n0q.setSource(getRADARSource(dt));
    });
    n0q = new TileLayer({
        title: 'NEXRAD Base Reflectivity',
        visible: true,
        source: getRADARSource(nexradBaseTime)
    });
    n0q.on('change:visible', updateURLWrapper);
    lsrtypefilter = $("#lsrtypefilter").select2({
        placeholder: "Filter LSRs by Event Type",
        width: 300,
        multiple: true
    });
    lsrtypefilter.on("change", function() { // this
        const vals = $(this).val();
        const val = vals ? vals.join("|") : null;
        lsrtable.column(7).search(val ? `^${val}$` : '', true, false).draw();
    });
    sbwtypefilter = $("#sbwtypefilter").select2({
        placeholder: "Filter SBWs by Event Type",
        width: 300,
        multiple: true
    });
    sbwtypefilter.on("change", function() { // this
        const vals = $(this).val();
        const val = vals ? vals.join("|") : null;
        sbwtable.column(3).search(val ? `^${val}$` : '', true, false).draw();
    });
    wfoSelect = $("#wfo").select2({
        templateSelection(state) {
            return state.id;
        }
    });
    stateSelect = $("#state").select2({
        templateSelection(state) {
            return state.id;
        }
    });
    $.each(iemdata.wfos, (_idx, entry) => {
        const opt = new Option(`[${entry[0]}] ${entry[1]}`, entry[0], false, false);
        wfoSelect.append(opt);
    });
    $.each(iemdata.states, (_idx, entry) => {
        const opt = new Option(`[${entry[0]}] ${entry[1]}`, entry[0], false, false);
        stateSelect.append(opt);
    });

    $(".iemdtp").datetimepicker({
        format: "m/d/Y H:i", // Correct datetimepicker format
        step: 1,
        maxDate: '+1970/01/03',
        minDate: '2003/01/01',
        onClose() {
            setTimeout(loadData, 0);
        }
    });
    const stsInput = document.getElementById('sts');
    const etsInput = document.getElementById('ets');

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    stsInput.value = yesterday.toISOString().slice(0, 16);
    etsInput.value = now.toISOString().slice(0, 16);

    stsInput.addEventListener('change', () => {
        setTimeout(loadData, 0);
    });

    etsInput.addEventListener('change', () => {
        setTimeout(loadData, 0);
    });

    updateRADARTimes();

    $("#load").click(() => {
        setTimeout(loadData, 0);
    });
    $("#lsrshapefile").click(() => {
        window.location.href = getShapefileLink("lsr");
    });
    $("#lsrexcel").click(() => {
        window.location.href = `${getShapefileLink("lsr")}&fmt=excel`;
    });
    $("#lsrkml").click(() => {
        window.location.href = `${getShapefileLink("lsr")}&fmt=kml`;
    });
    $("#lsrgeojson").click(() => {
        const opts = buildOpts();
        const url = `https://mesonet.agron.iastate.edu/geojson/lsr.geojson?${$.param(opts)}`;
        copyToClipboard(url, "GeoJSON URL copied to clipboard");
    });
    $("#warnshapefile").click(() => {
        window.location.href = getShapefileLink("watchwarn");
    });
    $("#warnexcel").click(() => {
        window.location.href = `${getShapefileLink("watchwarn")}&accept=excel`;
    });
    $("#sbwshapefile").click(() => {
        window.location.href = `${getShapefileLink("watchwarn")}&limit1=yes`;
    });
    $("#sbwgeojson").click(() => {
        const opts = buildOpts();
        const url = `https://mesonet.agron.iastate.edu/geojson/sbw.geojson?${$.param(opts)}`;
        copyToClipboard(url, "GeoJSON URL copied to clipboard");
    });
    $("#realtime").click(function() {
        realtime = this.checked;
        if (realtime) {
            setTimeout(loadData, 0);
        }
    });
    statesLayer = make_iem_tms('US States', 'usstates', true, '');
    statesLayer.on('change:visible', updateURLWrapper);
    countiesLayer = make_iem_tms('US Counties', 'uscounties', false, '');
    countiesLayer.on('change:visible', updateURLWrapper);

    olmap = new Map({
        target: 'map',
        controls: [new FullScreen()],
        view: new View({
            enableRotation: false,
            center: transform([-94.5, 42.1], 'EPSG:4326', 'EPSG:3857'),
            zoom: 7,
            maxZoom: 16
        }),
        layers: [
            new TileLayer({
                title: 'OpenStreetMap',
                visible: true,
                type: 'base',
                source: new XYZ({
                    url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                })
            }),
            new TileLayer({
                title: "MapTiler Toner (Black/White)",
                type: 'base',
                visible: false,
                source: new XYZ({
                    url: 'https://api.maptiler.com/maps/toner/tiles.json?key=d7EdAVvDI3ocoa9OUt9Z',
                    tileSize: 512,
                    crossOrigin: 'anonymous'
                })
            }),
            new TileLayer({
                title: "MapTiler Pastel",
                type: 'base',
                visible: false,
                source: new XYZ({
                    url: 'https://api.maptiler.com/maps/pastel/tiles.json?key=d7EdAVvDI3ocoa9OUt9Z',
                    tileSize: 512,
                    crossOrigin: 'anonymous'
                })
            }),
            n0q,
            statesLayer,
            countiesLayer,
            sbwLayer,
            lsrLayer
        ]
    });
    const ls = new LayerSwitcher();
    olmap.addControl(ls);

    olmap.on('click', (evt) => {
        const feature = olmap.forEachFeatureAtPixel(evt.pixel,
            (feature2) => {
                return feature2;
            });
        if (feature === undefined) {
            return;
        }
        if (feature.get("phenomena") !== undefined) {
            handleSBWClick(feature);
            return;
        }
        if (feature.get('magnitude') === undefined) return;
        // evt.originalEvent.x
        const divid = revisedRandId();
        const div = document.createElement("div");
        div.innerHTML = `<div class="panel panel-primary panel-popup" id="${divid}"><div class="panel-heading">${feature.get("city")}, ${feature.get("st")} &nbsp; <button type="button" class="close" data-target="#${divid}" data-dismiss="alert"> <span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button></div><div class="panel-body">${lsrHTML(feature)}</div></div>`;
        const coordinates = feature.getGeometry().getCoordinates();
        const marker = new Overlay({
            position: coordinates,
            positioning: 'center-center',
            element: div,
            stopEvent: false,
            dragging: false
        });
        olmap.addOverlay(marker);
        div.addEventListener('mousedown', () => {
            marker.set('dragging', true);
        });
        olmap.on('pointermove', (evt2) => {
            if (marker.get('dragging') === true) {
                marker.setPosition(evt2.coordinate);
            }
        });
        olmap.on('pointerup', () => {
            if (marker.get('dragging') === true) {
                marker.set('dragging', false);
            }
        });
        const id = feature.getId();
        lsrtable.rows().deselect();
        lsrtable.row(
            lsrtable.rows((idx, data) => {
                if (data.id === id) {
                    lsrtable.row(idx).select();
                    return true;
                }
                return false;
            })
        ).show().draw(false);


    });

    lsrtable = $("#lsrtable").DataTable({
        select: true,
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
                    return new Date(data).toLocaleString();
                }
            }
        ]
    });
    lsrtable.on("search.dt", () => {
        lsrLayer.dispatchEvent(TABLE_FILTERED_EVENT);
    });
    // Add event listener for opening and closing details
    $('#lsrtable tbody').on('click', 'td.details-control', function() { // this
        const tr = $(this).closest('tr');
        const row = lsrtable.row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child(formatLSR(row.data())).show();
            tr.addClass('shown');
        }
    });
    sbwtable = $("#sbwtable").DataTable({
        columns: [
            {
                "data": "issue",
                "visible": false
            }, {
                "data": "expire",
                "visible": false
            }, {
                "data": "wfo"
            }, {
                "data": "phenomena"
            }, {
                "data": "significance"
            }, {
                "data": "eventid"
            }, {
                "data": "issue",
                "orderData": [0]
            }, {
                "data": "expire",
                "orderData": [1]
            }
        ],
        columnDefs: [
            {
                targets: 3,
                render(data) {
                    return data in iemdata.vtec_phenomena ? iemdata.vtec_phenomena[data] : data;
                }
            }, {
                targets: 4,
                render(data) {
                    return data in iemdata.vtec_significance ? iemdata.vtec_significance[data] : data;
                }
            }, {
                targets: 5,
                render(_data, type, row) {
                    if (type === 'display') {
                        return `<a href="${row.href}">${row.eventid}</a>`;
                    }
                    return row.eventid;
                }
            }, {
                targets: [6, 7],
                render(data) {
                    return new Date(data).toLocaleString();
                }
            }
        ]
    });
    sbwtable.on("search.dt", () => {
        sbwLayer.dispatchEvent(TABLE_FILTERED_EVENT);
    });
}

function genSettings() {
    let res = "";
    res += (n0q.isVisible() ? "1" : "0");
    res += (lsrLayer.isVisible() ? "1" : "0");
    res += (sbwLayer.isVisible() ? "1" : "0");
    res += (realtime ? "1" : "0");
    res += (statesLayer.isVisible() ? "1" : "0");
    res += (countiesLayer.isVisible() ? "1" : "0");
    return res;
}

function updateURLWrapper() {
    updateURL(wfoSelect, stateSelect, genSettings);
}

function applySettings(opts) {
    if (opts[0] !== undefined) { // Show RADAR
        n0q.setVisible(opts[0] === "1");
    }
    if (opts[1] !== undefined) { // Show LSRs
        lsrLayer.setVisible(opts[1] === "1");
    }
    if (opts[2] !== undefined) { // Show SBWs
        sbwLayer.setVisible(opts[2] === "1");
    }
    if (opts[3] === "1") { // Realtime
        realtime = true;
        $("#realtime").prop('checked', true);
    }
    if (opts[4] !== undefined) {
        statesLayer.setVisible(opts[4] === "1");
    }
    if (opts[5] !== undefined) {
        countiesLayer.setVisible(opts[5] === "1");
    }
}
function updateRADARTimes() {
    // Figure out what our time slider should look like
    const stsElement = document.getElementById("sts");
    const etsElement = document.getElementById("ets");
    const sts = new Date(stsElement.value);
    const ets = new Date(etsElement.value);
    sts.setUTCMinutes(sts.getUTCMinutes() - (sts.getUTCMinutes() % 5));
    ets.setUTCMinutes(ets.getUTCMinutes() + (5 - (ets.getUTCMinutes() % 5)));
    const times = (ets - sts) / (5 * 60 * 1000);  // 5 minute bins
    nexradBaseTime = sts;
}
function buildOpts() {
    const wfos = $("#wfo").val();  // null for all or array
    const states = $("#state").val();  // null for all or array
    const by = $("input[type=radio][name=by]:checked").val();
    const stsElement = document.getElementById("sts");
    const etsElement = document.getElementById("ets");
    const sts = new Date(stsElement.value).toISOString().replace(/[-:]/g, '').slice(0, 12);
    const ets = new Date(etsElement.value).toISOString().replace(/[-:]/g, '').slice(0, 12);
    const opts = {
        sts,
        ets
    };
    if (by === "state"){
        opts.states = (states === null) ? "" : escapeHTML(states.join(","));
    } else {
        opts.wfos = (wfos === null) ? "" : escapeHTML(wfos.join(","));
    }
    return opts;
}
function loadData() {
    // Load up the data please!
    if ($(".tab .active > a").attr("href") !== "#2a") {
        $("#lsrtab").click();
    }
    updateRADARTimes();

    lsrLayer.getSource().clear(true);
    sbwLayer.getSource().clear(true);
    const opts = buildOpts();
    $.ajax({
        method: "GET",
        url: `https://mesonet.agron.iastate.edu/geojson/lsr.geojson?${$.param(opts)}`,
        dataType: 'json',
        success(data) {
            if (data.features.length === 10000) {
                alert("App limit of 10,000 LSRs reached.");  // skipcq
            }
            lsrLayer.getSource().addFeatures(
                (new GeoJSON({ featureProjection: 'EPSG:3857' })
                ).readFeatures(data)
            );
        }
    });
    $.ajax({
        method: "GET",
        url: `https://mesonet.agron.iastate.edu/geojson/sbw.geojson?${$.param(opts)}`,
        dataType: 'json',
        success(data) {
            sbwLayer.getSource().addFeatures(
                (new GeoJSON({ featureProjection: 'EPSG:3857' })
                ).readFeatures(data)
            );
        }
    });
    updateURLWrapper();
}

function getShapefileLink(base) {
    let uri = `/cgi-bin/request/gis/${base}.py?`;
    const by = $("input[type=radio][name=by]:checked").val();
    const wfos = $("#wfo").val();
    if (wfos && by === "wfo") {
        for (let i = 0; i < wfos.length; i++) {
            uri += `&wfo=${escapeHTML(wfos[i])}`;
        }
    }
    const states = $("#state").val();
    if (states && by === "state") {
        for (let i = 0; i < states.length; i++) {
            uri += `&state=${escapeHTML(states[i])}`;
        }
    }
    const stsElement = document.getElementById("sts");
    const etsElement = document.getElementById("ets");
    const sts = new Date(stsElement.value);
    const ets = new Date(etsElement.value);
    uri += `&year1=${sts.getUTCFullYear()}`;
    uri += `&month1=${sts.getUTCMonth() + 1}`;
    uri += `&day1=${sts.getUTCDate()}`;
    uri += `&hour1=${sts.getUTCHours()}`;
    uri += `&minute1=${sts.getUTCMinutes()}`;
    uri += `&year2=${ets.getUTCFullYear()}`;
    uri += `&month2=${ets.getUTCMonth() + 1}`;
    uri += `&day2=${ets.getUTCDate()}`;
    uri += `&hour2=${ets.getUTCHours()}`;
    uri += `&minute2=${ets.getUTCMinutes()}`;
    return uri;
}

// Initialize the tabs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // First migrate any hash parameters to URL parameters
    migrateHashToParams();
    
    initializeTabs('rightside');
    // hook up select2 with jquery
    select2($);
    initUI();
    parseHref(wfoSelect, stateSelect, realtime, loadData, updateRADARTimes, applySettings);
    window.setInterval(cronMinute, 60000);
});

