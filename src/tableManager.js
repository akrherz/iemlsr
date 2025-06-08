import DataTable from 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-select-dt';
import 'datatables.net-scroller-dt';
import { vtec_phenomena, vtec_significance } from 'iemjs/iemdata';
import { formatLSR } from "./featureManager.js";
import { getLSRLayer, getSBWLayer } from './layerManager.js';
import { renderDateTime } from './timeUtils.js';

let lsrtable = null;
let sbwtable = null;

export { lsrtable, sbwtable };

/**
 * Initialize the LSR DataTable
 * @param {string} TABLE_FILTERED_EVENT - Event to dispatch when table is filtered
 * @param {HTMLElement} lsrtableEl - The table element
 * @param {import('ol/Map').default} olmap - OpenLayers map instance 
 */
export function initializeLSRTable(TABLE_FILTERED_EVENT, lsrtableEl, olmap) {
    // Destroy existing table if it exists
    if (lsrtable) {
        lsrtable.destroy();
    }
    
    lsrtable = new DataTable(lsrtableEl, {
        select: {
            style: 'single',
            info: false
        },
        rowId: 'id',
        columns: [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            { "data": "wfo" },
            {
                "data": "valid",
                "type": "datetime"
            },
            { "data": "typetext" },
            { "data": "magnitude" },
            { "data": "city" },
            { "data": "county" },
            { "data": "st" },
        ],
        order: [[2, 'desc']],
        columnDefs: [
            {
                targets: 2,
                type: 'datetime',
                render: renderDateTime
            }
        ]
    });

    lsrtable.on("search.dt", () => {
        getLSRLayer().dispatchEvent(TABLE_FILTERED_EVENT);
    });

    if (lsrtableEl) {
        const tbody = lsrtableEl.querySelector('tbody');
        if (tbody) {
            tbody.addEventListener('click', (event) => {
                const target = event.target;
                if (!(target instanceof HTMLTableCellElement)) {
                    // If the clicked element is not a table cell, exit
                    return;
                }
                const td = target.closest('td');
                if (!td) {
                    return;
                }
                const tr = td.closest('tr');
                const row = lsrtable.row(tr);
                // Zoom to the selected feature
                olmap.getView().fit(row.data().geometry.getExtent(), {
                    duration: 500,
                    maxZoom: 10,
                    nearest: true
                });
                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                } else {
                    // Open this row
                    row.child(formatLSR(row.data())).show();
                }
            });
        }
    }
}

/**
 * Initialize the SBW DataTable
 * @param {string} TABLE_FILTERED_EVENT - Event to dispatch when table is filtered
 * @param {HTMLElement} sbwtableEl - The table element
 * @param {import('ol/Map').default} olmap - OpenLayers map instance
 */
export function initializeSBWTable(TABLE_FILTERED_EVENT, sbwtableEl, olmap) {
    // Destroy existing table if it exists
    if (sbwtable) {
        sbwtable.destroy();
    }
    
    sbwtable = new DataTable(sbwtableEl, {
        select: {
            style: 'single',
            info: false
        },
        columns: [
            {
                "data": "wfo"
            }, {
                "data": "phenomena"
            }, {
                "data": "significance"
            }, {
                "data": "eventid"
            }, {
                "data": "issue",
                "type": "datetime"
            }, {
                "data": "expire",
                "type": "datetime"
            }
        ],
        columnDefs: [
            {
                targets: 1,
                render(data) {
                    return data in vtec_phenomena ? vtec_phenomena[data] : data;
                }
            }, {
                targets: 2,
                render(data) {
                    return data in vtec_significance ? vtec_significance[data] : data;
                }
            }, {
                targets: 3,
                render(_data, type, row) {
                    if (type === 'display') {
                        return `<a href="${row.href}">${row.eventid}</a>`;
                    }
                    return row.eventid;
                }
            }, {
                targets: [4, 5],
                render: renderDateTime
            }
        ]
    });
    if (sbwtableEl) {
        const tbody = sbwtableEl.querySelector('tbody');
        if (tbody) {
            tbody.addEventListener('click', (event) => {
                const target = event.target;
                if (!(target instanceof HTMLTableCellElement)) {
                    // If the clicked element is not a table cell, exit
                    return;
                }
                const td = target.closest('td');
                if (!td) {
                    return;
                }
                const tr = td.closest('tr');
                const row = sbwtable.row(tr);
                // Zoom to the selected feature
                olmap.getView().fit(row.data().geometry.getExtent(), {
                    duration: 500,
                    maxZoom: 8,
                    nearest: true
                });
            });
        }
    }
    sbwtable.on("search.dt", () => {
        getSBWLayer().dispatchEvent(TABLE_FILTERED_EVENT);
    });
}
