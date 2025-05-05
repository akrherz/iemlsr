import './style.css';
import 'ol/ol.css'; // Import OpenLayers CSS
import 'ol-layerswitcher/src/ol-layerswitcher.css'; // Import OpenLayers LayerSwitcher CSS
import 'bootstrap/dist/css/bootstrap.css'; // Import Bootstrap CSS
import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.css';

import DataTable from 'datatables.net'; // Import DataTables
import 'datatables.net-dt/css/dataTables.dataTables.css'; // Correct DataTables CSS import
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map'; // Import OpenLayers Map
import View from 'ol/View'; // Import OpenLayers View
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ'; // Import OpenLayers XYZ source
import Overlay from 'ol/Overlay'; // Import OpenLayers Overlay
import { transform } from 'ol/proj'; // Import OpenLayers projection transform
import FullScreen from 'ol/control/FullScreen'; // Import OpenLayers FullScreen control
import { iemdata } from './iemdata.js'; // Import iemdata
import { initializeTimeSlider } from './timeslider.js';
import { parseHref, updateURL, migrateHashToParams } from './urlHandler.js';
import { initializeTabs } from './tabs.js';
import { createLSRLayer, createSBWLayer, initializeLayerSwitcher, make_iem_tms, createLSRTable } from './layerManager.js';

let olmap = null; // Openlayers map
let lsrtable = null; // LSR DataTable
let sbwtable = null; // SBW DataTable
let n0q = null; // RADAR Layer
let countiesLayer = null;
let statesLayer = null;
let lsrLayer = null;
let sbwLayer = null;
let wfoSelect = null;
let stateSelect = null;
let lsrtypefilter = null;
let sbwtypefilter = null;
let realtime = false;
const TABLE_FILTERED_EVENT = "tfe";
let nexradBaseTime = new Date();
nexradBaseTime.setUTCMinutes(nexradBaseTime.getUTCMinutes() - (nexradBaseTime.getUTCMinutes() % 5));


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

/**
 * Updates the start and end time inputs based on realtime mode
 */
function updateTimeInputs() {
    const stsInput = document.getElementById('sts');
    const etsInput = document.getElementById('ets');
    const now = new Date();
    
    if (realtime) {
        // In realtime mode, end time is now and start time is relative
        etsInput.value = now.toISOString().slice(0, 16);
        const sts = new Date(now);
        sts.setDate(sts.getDate() - 1); // Default to last 24 hours
        stsInput.value = sts.toISOString().slice(0, 16);
    } else if (!stsInput.value || !etsInput.value) {
        // Initial load or reset - set default time range
        etsInput.value = now.toISOString().slice(0, 16);
        const sts = new Date(now);
        sts.setDate(sts.getDate() - 1); // Default to last 24 hours
        stsInput.value = sts.toISOString().slice(0, 16);
    }
    
    // Ensure inputs stay within valid range
    const minDate = '2003-01-01T00:00';
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 3);
    const maxDateStr = maxDate.toISOString().slice(0, 16);
    
    stsInput.min = minDate;
    stsInput.max = maxDateStr;
    etsInput.min = minDate;
    etsInput.max = maxDateStr;
}

function cronMinute() {
    if (!realtime) return;
    const stsInput = document.getElementById('sts');
    const etsInput = document.getElementById('ets');
    const now = new Date();
    
    // Update end time to now
    etsInput.value = now.toISOString().slice(0, 16);
    
    // Maintain the same time difference for start time
    const sts = new Date(stsInput.value);
    const timeDiff = now - new Date(etsInput.value);
    sts.setTime(sts.getTime() + timeDiff);
    stsInput.value = sts.toISOString().slice(0, 16);
    
    setTimeout(loadData, 0);
}
function getRADARSource(dt) {
    const prod = dt.getUTCFullYear() < 2011 ? 'N0R' : 'N0Q';
    const formattedDate = dt.toISOString().replace(/[-:T]/g, '').slice(0, 12);
    return new XYZ({
        url: `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-${prod}-${formattedDate}/{z}/{x}/{y}.png`
    });
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
function copyToClipboard(text, msg) {
    navigator.clipboard.writeText(text).then(() => {
        alert(msg);
    });
}
 
// Helper function to initialize tom-select
function initTomSelect(element, options) {
    return new TomSelect(element, {
        ...options,
        allowEmptyOption: true,
        plugins: {
            clear_button: {
                title: 'Remove all selected options'
            }
        }
    });
}

function initUI() {
    // Initialize the LSR DataTable first
    lsrtable = createLSRTable();
    lsrtable.on("search.dt", () => {
        lsrLayer.dispatchEvent(TABLE_FILTERED_EVENT);
    });
    
    // Add event listener for opening and closing details
    document.querySelector('#lsrtable tbody').addEventListener('click', (event) => {
        const td = event.target.closest('td.details-control');
        if (!td) return;
        
        const tr = td.closest('tr');
        const row = lsrtable.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.classList.remove('shown');
        } else {
            row.child(formatLSR(row.data())).show();
            tr.classList.add('shown');
        }
    });

    // Generate UI components of the page
    const radarTimeEl = document.getElementById('radartime');
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

    // Initialize tom-select dropdowns
    const lsrTypeFilterEl = document.getElementById('lsrtypefilter');
    lsrtypefilter = initTomSelect(lsrTypeFilterEl, {
        placeholder: "Filter LSRs by Event Type",
        maxItems: null, // Allow multiple selections
    });
    lsrtypefilter.on('change', () => {
        const vals = lsrtypefilter.getValue();
        const val = vals.length ? vals.join("|") : null;
        lsrtable.column(7).search(val ? `^${val}$` : '', true, false).draw();
    });

    const sbwTypeFilterEl = document.getElementById('sbwtypefilter');
    sbwtypefilter = initTomSelect(sbwTypeFilterEl, {
        placeholder: "Filter SBWs by Event Type",
        maxItems: null, // Allow multiple selections
    });
    sbwtypefilter.on('change', () => {
        const vals = sbwtypefilter.getValue();
        const val = vals.length ? vals.join("|") : null;
        sbwtable.column(3).search(val ? `^${val}$` : '', true, false).draw();
    });

    const wfoEl = document.getElementById('wfo');
    wfoSelect = initTomSelect(wfoEl, {
        maxItems: null,
        render: {
            item: (data) => `<div>[${data.value}] ${data.text}</div>`,
            option: (data) => `<div>[${data.value}] ${data.text}</div>`
        }
    });

    const stateEl = document.getElementById('state');
    stateSelect = initTomSelect(stateEl, {
        maxItems: null,
        render: {
            item: (data) => `<div>[${data.value}] ${data.text}</div>`,
            option: (data) => `<div>[${data.value}] ${data.text}</div>`
        }
    });

    // Populate select options
    iemdata.wfos.forEach(entry => {
        wfoSelect.addOption({
            value: entry[0],
            text: entry[1]
        });
    });

    iemdata.states.forEach(entry => {
        stateSelect.addOption({
            value: entry[0],
            text: entry[1]
        });
    });

    const stsInput = document.getElementById('sts');
    const etsInput = document.getElementById('ets');
    
    // Initialize time inputs
    updateTimeInputs();
    
    // Add change event listeners
    stsInput.addEventListener('change', (event) => {
        // Ensure end time is not before start time
        if (new Date(etsInput.value) < new Date(event.target.value)) {
            etsInput.value = event.target.value;
        }
        if (!realtime) {
            setTimeout(loadData, 0);
        }
    });
    
    etsInput.addEventListener('change', (event) => {
        // Ensure start time is not after end time
        if (new Date(stsInput.value) > new Date(event.target.value)) {
            stsInput.value = event.target.value;
        }
        if (!realtime) {
            setTimeout(loadData, 0);
        }
    });
    
    // Handle realtime toggle
    document.getElementById('realtime').addEventListener('change', function() {
        realtime = this.checked;
        if (realtime) {
            updateTimeInputs();
            setTimeout(loadData, 0);
        }
    });

    updateRADARTimes();

    document.getElementById('load').addEventListener('click', () => {
        setTimeout(loadData, 0);
    });

    document.getElementById('lsrshapefile').addEventListener('click', () => {
        window.location.href = getShapefileLink("lsr");
    });

    document.getElementById('lsrexcel').addEventListener('click', () => {
        window.location.href = `${getShapefileLink("lsr")}&fmt=excel`;
    });

    document.getElementById('lsrkml').addEventListener('click', () => {
        window.location.href = `${getShapefileLink("lsr")}&fmt=kml`;
    });

    document.getElementById('lsrgeojson').addEventListener('click', () => {
        const opts = buildOpts();
        const params = new URLSearchParams(opts);
        const url = `https://mesonet.agron.iastate.edu/geojson/lsr.geojson?${params}`;
        copyToClipboard(url, "GeoJSON URL copied to clipboard");
    });

    document.getElementById('warnshapefile').addEventListener('click', () => {
        window.location.href = getShapefileLink("watchwarn");
    });

    document.getElementById('warnexcel').addEventListener('click', () => {
        window.location.href = `${getShapefileLink("watchwarn")}&accept=excel`;
    });

    document.getElementById('sbwshapefile').addEventListener('click', () => {
        window.location.href = `${getShapefileLink("watchwarn")}&limit1=yes`;
    });

    document.getElementById('sbwgeojson').addEventListener('click', () => {
        const opts = buildOpts();
        const params = new URLSearchParams(opts);
        const url = `https://mesonet.agron.iastate.edu/geojson/sbw.geojson?${params}`;
        copyToClipboard(url, "GeoJSON URL copied to clipboard");
    });
    statesLayer = make_iem_tms('US States', 'usstates', true, '');
    statesLayer.on('change:visible', updateURLWrapper);

    countiesLayer = make_iem_tms('US Counties', 'uscounties', false, '');
    countiesLayer.on('change:visible', updateURLWrapper);

    // Initialize map first
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
            countiesLayer
        ]
    });

    // Ensure map is visible and sized correctly
    olmap.updateSize();

    // Create layers using the new layer manager
    lsrLayer = createLSRLayer(updateURLWrapper, TABLE_FILTERED_EVENT, lsrtable, olmap);
    olmap.addLayer(lsrLayer);
    sbwLayer = createSBWLayer(updateURLWrapper, TABLE_FILTERED_EVENT, sbwtable);
    olmap.addLayer(sbwLayer);
    initializeLayerSwitcher(olmap);

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

    const sbwtableEl = document.getElementById('sbwtable');
    sbwtable = new DataTable(sbwtableEl, {
        select: {
            style: 'single',
            info: false
        },
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

    // Left Drawer Controls
    const leftDrawerToggle = document.getElementById('drawer-toggle-left');
    const leftDrawerClose = document.getElementById('drawer-close-left');
    const controlsDrawer = document.getElementById('controls-drawer');

    // Right Drawer Controls
    const rightDrawerToggle = document.getElementById('drawer-toggle-right');
    const rightDrawerClose = document.getElementById('drawer-close-right');
    const tabsDrawer = document.getElementById('tabs-drawer');

    function toggleDrawer(drawer) {
        drawer.classList.toggle('open');
        setTimeout(() => olmap.updateSize(), 300);
    }

    function closeDrawer(drawer) {
        drawer.classList.remove('open');
        setTimeout(() => olmap.updateSize(), 300);
    }

    // Left Drawer Event Listeners
    leftDrawerToggle.addEventListener('click', () => toggleDrawer(controlsDrawer));
    leftDrawerClose.addEventListener('click', () => closeDrawer(controlsDrawer));

    // Right Drawer Event Listeners
    rightDrawerToggle.addEventListener('click', () => toggleDrawer(tabsDrawer));
    rightDrawerClose.addEventListener('click', () => closeDrawer(tabsDrawer));

    // Handle outside clicks for both drawers
    document.addEventListener('click', (event) => {
        if (!event.target.closest('#controls-drawer') && 
            !event.target.closest('#drawer-toggle-left') &&
            controlsDrawer.classList.contains('open')) {
            closeDrawer(controlsDrawer);
        }
        if (!event.target.closest('#tabs-drawer') && 
            !event.target.closest('#drawer-toggle-right') &&
            tabsDrawer.classList.contains('open')) {
            closeDrawer(tabsDrawer);
        }
    });

    // Initialize tabs
    const tabLinks = document.querySelectorAll('.nav-tabs a');
    const tabContents = document.querySelectorAll('.tab-pane');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all tabs and panes
            tabLinks.forEach(l => l.parentElement.classList.remove('active'));
            tabContents.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            link.parentElement.classList.add('active');
            const paneId = link.getAttribute('href').substring(1);
            document.getElementById(paneId).classList.add('active');
        });
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
        document.getElementById("realtime").checked = true;
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
    const wfoEl = document.getElementById('wfo');
    const stateEl = document.getElementById('state');
    const byStateRadio = document.querySelector('input[type=radio][name=by][value=state]');
    const wfos = Array.from(wfoEl.selectedOptions).map(opt => opt.value);
    const states = Array.from(stateEl.selectedOptions).map(opt => opt.value);
    const by = byStateRadio.checked ? 'state' : 'wfo';
    
    const stsInput = document.getElementById("sts");
    const etsInput = document.getElementById("ets");
    const sts = new Date(stsInput.value).toISOString();
    const ets = new Date(etsInput.value).toISOString();
    
    const opts = { sts, ets };
    if (by === "state") {
        opts.states = states.length ? escapeHTML(states.join(",")) : "";
    } else {
        opts.wfos = wfos.length ? escapeHTML(wfos.join(",")) : "";
    }
    return opts;
}
function loadData() {
    // Load up the data please!
    const activeTab = document.querySelector(".tab .active > a");
    if (activeTab && activeTab.getAttribute("href") !== "#2a") {
        document.getElementById("lsrs").click();
    }
    updateRADARTimes();

    lsrLayer.getSource().clear(true);
    sbwLayer.getSource().clear(true);
    const opts = buildOpts();
    const params = new URLSearchParams(opts);

    // Load LSR data
    fetch(`https://mesonet.agron.iastate.edu/geojson/lsr.geojson?${params}`)
        .then(response => response.json())
        .then(data => {
            if (data.features.length === 10000) {
                alert("App limit of 10,000 LSRs reached.");
            }
            lsrLayer.getSource().addFeatures(
                (new GeoJSON({ featureProjection: 'EPSG:3857' }))
                .readFeatures(data)
            );
        });

    // Load SBW data
    fetch(`https://mesonet.agron.iastate.edu/geojson/sbw.geojson?${params}`)
        .then(response => response.json())
        .then(data => {
            sbwLayer.getSource().addFeatures(
                (new GeoJSON({ featureProjection: 'EPSG:3857' }))
                .readFeatures(data)
            );
        });

    updateURLWrapper();
}

function getShapefileLink(base) {
    const params = new URLSearchParams();
    const byStateRadio = document.querySelector('input[type=radio][name=by][value=state]');
    const by = byStateRadio.checked ? 'state' : 'wfo';
    const wfoEl = document.getElementById('wfo');
    const stateEl = document.getElementById('state');

    if (by === 'wfo') {
        Array.from(wfoEl.selectedOptions).forEach(opt => {
            params.append('wfo', escapeHTML(opt.value));
        });
    } else {
        Array.from(stateEl.selectedOptions).forEach(opt => {
            params.append('state', escapeHTML(opt.value));
        });
    }

    const stsElement = document.getElementById("sts");
    const etsElement = document.getElementById("ets");
    const sts = new Date(stsElement.value);
    const ets = new Date(etsElement.value);

    params.append('year1', sts.getUTCFullYear());
    params.append('month1', sts.getUTCMonth() + 1);
    params.append('day1', sts.getUTCDate());
    params.append('hour1', sts.getUTCHours());
    params.append('minute1', sts.getUTCMinutes());
    params.append('year2', ets.getUTCFullYear());
    params.append('month2', ets.getUTCMonth() + 1);
    params.append('day2', ets.getUTCDate());
    params.append('hour2', ets.getUTCHours());
    params.append('minute2', ets.getUTCMinutes());

    return `/cgi-bin/request/gis/${base}.py?${params}`;
}

// Initialize the tabs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // First migrate any hash parameters to URL parameters
    migrateHashToParams();
    
    initializeTabs();
    initUI();
    parseHref(wfoSelect, stateSelect, realtime, loadData, updateRADARTimes, applySettings);
    window.setInterval(cronMinute, 60000);
});

