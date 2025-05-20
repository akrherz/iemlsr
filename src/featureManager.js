// Handles LSR and SBW feature formatting and interactions
import { Overlay } from 'ol';
import { iemdata } from './iemdata.js';

function revisedRandId() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

/**
 * Creates HTML for LSR feature popup
 * @param {Feature} feature OpenLayers feature object
 * @returns {string} HTML content
 */
export function formatLSR(data) {
    return `<div><strong>Source:</strong> ${data.source} &nbsp; <strong>UTC Valid:</strong> ${data.valid}<br /><strong>Remark:</strong> ${data.remark}</div>`;
}

/**
 * Creates HTML content for Storm Based Warning popup
 * @param {Feature} feature OpenLayers feature object
 * @returns {string} HTML content
 */
export function formatSBW(feature) {
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

/**
 * Formats LSR feature content for popup display
 * @param {Feature} feature OpenLayers feature object
 * @returns {string} HTML content
 */
export function lsrHTML(feature) {
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

/**
 * Handles click events on Storm Based Warning features
 * @param {Feature} feature OpenLayers feature object
 * @param {Map} olmap OpenLayers map object
 * @param {DataTable} sbwtable SBW DataTable instance
 */
export function handleSBWClick(feature, olmap, sbwtable) {
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

/**
 * Handles click events on LSR features
 * @param {Feature} feature OpenLayers feature object
 * @param {Map} olmap OpenLayers map object
 * @param {DataTable} lsrtable LSR DataTable instance
 */
export function handleLSRClick(feature, olmap, lsrtable) {
    if (feature.get('magnitude') === undefined) return;
    
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
}
