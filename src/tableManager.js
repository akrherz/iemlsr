import DataTable from 'datatables.net';
import { iemdata } from './iemdata.js';

let lsrtable = null;
let sbwtable = null;

export { lsrtable, sbwtable };

/**
 * Initialize the LSR DataTable
 * @param {HTMLElement} lsrtableEl - The table element 
 * @param {Function} onSearch - Callback for search events
 * @param {Function} onRowClick - Callback for row click events
 * @returns {DataTable} Initialized DataTable instance
 */
export function initializeLSRTable(lsrtableEl) {
    lsrtable = new DataTable(lsrtableEl, {
        select: {
            style: 'single',
            info: false
        },
        columns: [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            { "data": "valid", "visible": false },
            { "data": "wfo" },
            { "data": "city" },
            { "data": "county" },
            { "data": "st" },
            { "data": "magnitude" },
            { "data": "typetext" },
            { "data": "source" },
            {
                "data": "valid",
                "orderData": [1]
            }
        ],
        order: [[1, 'asc']],
        columnDefs: [
            {
                targets: [9],
                render(data) {
                    return new Date(data).toLocaleString();
                }
            }
        ]
    });
    const onSearch = null;
    const onRowClick = null;
    if (onSearch) {
        lsrtable.on("search.dt", onSearch);
    }

    if (onRowClick && lsrtableEl) {
        const tbody = lsrtableEl.querySelector('tbody');
        if (tbody) {
            tbody.addEventListener('click', (event) => {
                const td = event.target.closest('td.details-control');
                if (!td) return;
                onRowClick(td.closest('tr'), lsrtable);
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
export function initializeSBWTable(sbwtableEl) {
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
    const onSearch = null;
    if (onSearch) {
        sbwtable.on("search.dt", onSearch);
    }
}
