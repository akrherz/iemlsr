// Handles LSR and SBW feature formatting and interactions
import { createPopup, removeAllPopups } from './popup.js';
import { iemdata } from './iemdata.js';
import { toLocaleString } from './timeUtils.js';

function revisedRandId() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

/**
 * Creates HTML for LSR feature popup
 * @param {import("ol").Feature} feature OpenLayers feature object
 * @returns {string} HTML content
 */
export function formatLSR(data) {
    const lines = [
        '<div class="panel panel-default">',
        '<div class="panel-heading">',
        '<div class="panel-title">Local Storm Report</div>',
        '</div>',
        '<div class="panel-body">',
        `<strong>Source:</strong> ${data.source}<br>`,
        `<strong>UTC Valid:</strong> ${data.valid}<br>`,
        `<strong>Remark:</strong> ${data.remark}`,
        '</div>',
        '</div>'
    ];
    return lines.join('\n');
}

/**
 * Creates HTML content for Storm Based Warning popup
 * @param {import("ol").Feature} feature OpenLayers feature object
 * @returns {string} HTML content
 */
export function formatSBW(feature) {
    const ph = feature.get("phenomena");
    const pph = ph in iemdata.vtec_phenomena ? iemdata.vtec_phenomena[ph] : ph;
    const sig = feature.get("significance");
    const ss = sig in iemdata.vtec_significance ? iemdata.vtec_significance[sig] : sig;
    
    const issue = new Date(feature.get("issue"));
    const expire = new Date(feature.get("expire"));
    const issueLdt = toLocaleString(issue);
    const issueZZ = issue.toISOString().slice(11, 16);
    const expireLdt = toLocaleString(expire);
    const expireZZ = expire.toISOString().slice(11, 16);
    
    const lines = [
        '<div class="panel panel-default">',
        '<div class="panel-heading">',
        `<div class="panel-title">${pph} ${ss}</div>`,
        '</div>',
        '<div class="panel-body">',
        `<strong>Issued:</strong> ${issueLdt} (${issueZZ}Z)<br>`,
        `<strong>Expires:</strong> ${expireLdt} (${expireZZ}Z)<br>`,
        `<strong>More Details:</strong> <a href='${feature.get("href")}' target='_blank'>VTEC Browser</a>`,
        '</div>',
        '</div>'
    ];
    return lines.join('\n');
}

/**
 * Formats LSR feature content for popup display
 * @param {import("ol").Feature} feature OpenLayers feature object
 * @returns {string} HTML content
 */
export function lsrHTML(feature) {
    const dt = new Date(feature.get("valid"));
    const ldt = toLocaleString(dt);
    const zz = dt.toISOString().slice(11, 16);
    
    const lines = [
        '<div class="panel panel-default">',
        '<div class="panel-heading">',
        `<div class="panel-title">${feature.get("city")}, ${feature.get("st")}</div>`,
        '</div>',
        '<div class="panel-body">'
    ];

    // Add data fields with null checks
    const fields = [
        ['Valid', `${ldt} (${zz}Z)`],
        ['Source', feature.get("source")],
        ['Type', feature.get("typetext")],
        ['Magnitude', feature.get("magnitude") ? `${feature.get("magnitude")} ${feature.get("unit") || ''}` : null],
        ['Remark', feature.get("remark")]
    ];

    fields.forEach(([label, value]) => {
        if (value) {
            lines.push(`<strong>${label}:</strong> ${value}<br>`);
        }
    });

    lines.push('</div></div>');
    return lines.join('\n');
}

/**
 * Handles click events on Storm Based Warning features
 * @param {import("ol").Feature} feature OpenLayers feature object
 * @param {import("ol").Map} map OpenLayers map object
 * @param {DataTable} sbwtable SBW DataTable instance
 */
export function handleSBWClick(feature, map, sbwtable) {
    removeAllPopups(map);
    const content = formatSBW(feature);
    const coordinates = feature.getGeometry().getFirstCoordinate();
    createPopup(content, coordinates, map);

    // Update table selection
    if (sbwtable.rows) {
        const id = feature.getId();
        sbwtable.rows().deselect();
        const rows = sbwtable.rows((idx, data) => data.id === id);
        if (rows.any()) {
            rows.select();
            sbwtable.row(rows.indexes()[0]).scrollTo();
        }
    }
}

/**
 * Handles click events on LSR features
 * @param {import("ol").Feature} feature OpenLayers feature object
 * @param {import("ol").Map} map OpenLayers map object
 * @param {DataTable} lsrtable LSR DataTable instance
 */
export function handleLSRClick(feature, map, lsrtable) {
    if (feature.get('magnitude') === undefined) return;
    
    removeAllPopups(map);
    const content = lsrHTML(feature);
    const coordinates = feature.getGeometry().getCoordinates();
    createPopup(content, coordinates, map);

    // Update table selection
    if (lsrtable.rows) {
        const id = feature.getId();
        lsrtable.rows().deselect();
        const rows = lsrtable.rows((idx, data) => data.id === id);
        if (rows.any()) {
            rows.select();
            lsrtable.row(rows.indexes()[0]).scrollTo();
        }
    }
}
