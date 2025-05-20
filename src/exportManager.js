import * as timeUtils from './timeUtils.js';
import { buildRequestOptions } from './optionsManager.js';


/**
 * Get shapefile download link with parameters
 * @param {string} base - Base type ("lsr" or "watchwarn")
 * @param {object} filters - Filter selections
 * @returns {string} URL for shapefile download
 */
function getShapefileLink(base, filters) {
    const params = new URLSearchParams();
    const byStateRadio = document.querySelector('input[type=radio][name=by][value=state]');
    const by = byStateRadio.checked ? 'state' : 'wfo';
    const selectedWFOs = filters.wfoSelect.getValue();
    const selectedStates = filters.stateSelect.getValue();

    if (by === 'wfo') {
        selectedWFOs.forEach(wfo => {
            params.append('wfo', encodeURIComponent(wfo));
        });
    } else {
        selectedStates.forEach(state => {
            params.append('state', encodeURIComponent(state));
        });
    }

    const stsElement = document.getElementById("sts");
    const etsElement = document.getElementById("ets");
    const sts = new Date(stsElement.value);
    const ets = new Date(etsElement.value);

    const stsParams = timeUtils.getShapefileDateParams(sts);
    const etsParams = timeUtils.getShapefileDateParams(ets);

    params.append('year1', stsParams.year);
    params.append('month1', stsParams.month);
    params.append('day1', stsParams.day);
    params.append('hour1', stsParams.hour);
    params.append('minute1', stsParams.minute);
    params.append('year2', etsParams.year);
    params.append('month2', etsParams.month);
    params.append('day2', etsParams.day);
    params.append('hour2', etsParams.hour);
    params.append('minute2', etsParams.minute);

    return `https://mesonet.agron.iastate.edu/cgi-bin/request/gis/${base}.py?${params}`;
}

/**
 * Initialize export button handlers
 * @param {object} filters - Filter selections
 */
export function initializeExportHandlers(filters) {
    document.getElementById('lsrshapefile').addEventListener('click', () => {
        window.location.href = getShapefileLink("lsr", filters);
    });

    document.getElementById('lsrexcel').addEventListener('click', () => {
        window.location.href = `${getShapefileLink("lsr", filters)}&fmt=excel`;
    });

    document.getElementById('lsrkml').addEventListener('click', () => {
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

    document.getElementById('lsrgeojson').addEventListener('click', () => {
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
                notification.style.backgroundColor = '#dc3545'; // Error red color
                notification.textContent = 'Failed to copy URL to clipboard';
                document.body.appendChild(notification);
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 2000);
            });
    });

    document.getElementById('warnshapefile').addEventListener('click', () => {
        window.location.href = getShapefileLink("watchwarn", filters);
    });

    document.getElementById('warnexcel').addEventListener('click', () => {
        window.location.href = `${getShapefileLink("watchwarn", filters)}&accept=excel`;
    });

    document.getElementById('sbwshapefile').addEventListener('click', () => {
        window.location.href = `${getShapefileLink("watchwarn", filters)}&limit1=yes`;
    });

    document.getElementById('sbwgeojson').addEventListener('click', () => {
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
                notification.style.backgroundColor = '#dc3545';
                notification.textContent = 'Failed to copy URL to clipboard';
                document.body.appendChild(notification);
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 2000);
            });
    });
}
