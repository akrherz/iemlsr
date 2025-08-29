import { buildRequestOptions } from './optionsManager.js';
import { requireElement } from 'iemjs/domUtils';
import { getState, getStateETS, getStateSTS, StateKeys } from './state.js';


/**
 * Get shapefile download link with parameters
 * @param {string} base - Base type ("lsr" or "watchwarn")
 * @param {object} filters - Filter selections
 * @returns {string} URL for shapefile download
 */
function getShapefileLink(base, filters) {
    const params = new URLSearchParams();
    const byState = /** @type{boolean} */ getState(StateKeys.BY_STATE);
    const selectedWFOs = filters.wfoSelect.getValue();
    const selectedStates = filters.stateSelect.getValue();

    if (!byState) {
        selectedWFOs.forEach(wfo => {
            params.append('wfo', encodeURIComponent(wfo));
        });
    } else {
        selectedStates.forEach(state => {
            params.append('state', encodeURIComponent(state));
        });
    }

    const sts = getStateSTS();
    const ets = getStateETS();

    // Ensure we have valid Date objects and convert to UTC ISO strings for API compatibility
    if (!(sts instanceof Date) || !(ets instanceof Date)) {
        throw new Error('Invalid date objects in state');
    }
    
    params.append('sts', sts.toISOString());
    params.append('ets', ets.toISOString());

    return `https://mesonet.agron.iastate.edu/cgi-bin/request/gis/${base}.py?${params}`;
}

/**
 * Initialize export button handlers
 * @param {object} filters - Filter selections
 */
export function initializeExportHandlers(filters) {
    requireElement('lsrshapefile').addEventListener('click', () => {
        window.location.href = getShapefileLink("lsr", filters);
    });

    requireElement('lsrexcel').addEventListener('click', () => {
        window.location.href = `${getShapefileLink("lsr", filters)}&fmt=excel`;
    });

    requireElement('lsrkml').addEventListener('click', () => {
        window.location.href = `${getShapefileLink("lsr", filters)}&fmt=kml`;
    });

    const showClipboardNotification = () => {
        // Create or get notification element
        let notification = document.querySelector('.clipboard-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'clipboard-notification';
            document.body.appendChild(notification);
        }
        
        // Set message and show
        notification.textContent = 'URL copied to clipboard!';
        notification.classList.add('show');
        
        // Hide after 2 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    };

    requireElement('lsrgeojson').addEventListener('click', () => {
        const params = new URLSearchParams(buildRequestOptions());
        const url = `https://mesonet.agron.iastate.edu/geojson/lsr.geojson?${params}`;
        // Copy the URL to the clipboard
        navigator.clipboard.writeText(url)
            .then(showClipboardNotification)
            .catch(err => {
                console.error('Failed to copy URL: ', err);
                // Show error notification
                const notification = document.querySelector('.clipboard-notification') || document.createElement('div');
                notification.className = 'clipboard-notification';
                notification.textContent = 'Failed to copy URL to clipboard';
                document.body.appendChild(notification);
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 2000);
            });
    });

    requireElement('warnshapefile').addEventListener('click', () => {
        window.location.href = getShapefileLink("watchwarn", filters);
    });

    requireElement('warnexcel').addEventListener('click', () => {
        window.location.href = `${getShapefileLink("watchwarn", filters)}&accept=excel`;
    });

    requireElement('sbwshapefile').addEventListener('click', () => {
        window.location.href = `${getShapefileLink("watchwarn", filters)}&limit1=yes`;
    });

    requireElement('sbwgeojson').addEventListener('click', () => {
        const params = new URLSearchParams(buildRequestOptions());
        const url = `https://mesonet.agron.iastate.edu/geojson/sbw.geojson?${params}`;
        // Copy the URL to the clipboard
        navigator.clipboard.writeText(url)
            .then(showClipboardNotification)
            .catch(err => {
                console.error('Failed to copy URL: ', err);
                // Show error notification
                const notification = document.querySelector('.clipboard-notification') || document.createElement('div');
                notification.className = 'clipboard-notification';
                notification.textContent = 'Failed to copy URL to clipboard';
                document.body.appendChild(notification);
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 2000);
            });
    });
}
