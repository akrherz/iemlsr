import DataTable from 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-select-dt';
import 'datatables.net-scroller-dt';
import { iemdata } from './iemdata.js';
import { formatLSR } from "./featureManager.js";
import { getLSRLayer, getSBWLayer } from './layerManager.js';
import { toLocaleString } from './timeUtils.js';

let lsrtable = null;
let sbwtable = null;

export { lsrtable, sbwtable };

/**
 * Initialize the LSR DataTable
 * @param {HTMLElement} lsrtableEl - The table element 
 * @returns {DataTable} Initialized DataTable instance
 */
export function initializeLSRTable(TABLE_FILTERED_EVENT, lsrtableEl) {
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
                render(data) {
                    return toLocaleString(new Date(data));
                }
            }
        ]
    });

    lsrtable.on("search.dt", () => {
        getLSRLayer().dispatchEvent(TABLE_FILTERED_EVENT)
    });

    if (lsrtableEl) {
        const tbody = lsrtableEl.querySelector('tbody');
        if (tbody) {
            tbody.addEventListener('click', (event) => {
                const td = event.target.closest('td.details-control');
                if (!td) return;
                const tr = td.closest('tr');
                const row = lsrtable.row(tr);
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
 * @param {HTMLElement} sbwtableEl - The table element
 * @param {Function} onSearch - Callback for search events
 * @returns {DataTable} Initialized DataTable instance
 */
export function initializeSBWTable(TABLE_FILTERED_EVENT, sbwtableEl) {
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
                    return toLocaleString(new Date(data));
                }
            }
        ]
    });
    sbwtable.on("search.dt", () => {
        getSBWLayer().dispatchEvent(TABLE_FILTERED_EVENT)
    });
}
