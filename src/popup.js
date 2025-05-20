// Manages interactive popups for map features
import { Overlay } from 'ol';

let activePopups = [];

/**
 * Creates a new popup overlay for a feature
 * @param {string} content HTML content for the popup
 * @param {Array} coordinates Map coordinates for popup placement
 * @param {import("ol").Map} map OpenLayers map instance
 * @returns {Overlay} The created popup overlay
 */
export function createPopup(content, coordinates, map) {
    // Create popup container
    const container = document.createElement('div');
    container.className = 'feature-popup';

    // Add header
    const header = document.createElement('div');
    header.className = 'header';
    container.appendChild(header);

    // Add content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.innerHTML = content;
    container.appendChild(contentDiv);

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'popup-close-btn';
    closeBtn.setAttribute('aria-label', 'Close popup');
    closeBtn.onclick = () => removePopup(popup);
    header.appendChild(closeBtn);

    // Create overlay
    const popup = new Overlay({
        element: container,
        position: coordinates,
        positioning: 'bottom-center',
        offset: [0, -15],
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });

    // Make draggable
    makeDraggable(container, popup);

    // Add to map and tracking array
    map.addOverlay(popup);
    activePopups.push(popup);

    return popup;
}

/**
 * Remove a popup overlay from the map
 * @param {Overlay} popup The popup overlay to remove
 */
export function removePopup(popup) {
    const map = popup.getMap();
    if (map) {
        map.removeOverlay(popup);
    }
    activePopups = activePopups.filter(p => p !== popup);
}

/**
 * Remove all active popups from the map
 * @param {import("ol").Map} map The map instance
 */
export function removeAllPopups(map) {
    activePopups.forEach(popup => {
        map.removeOverlay(popup);
    });
    activePopups = [];
}

/**
 * Make a popup draggable
 * @param {HTMLElement} element The popup container element
 * @param {Overlay} popup The popup overlay
 */
function makeDraggable(element, popup) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call a function whenever the cursor moves
        document.onmousemove = elementDrag;
        element.classList.add('dragging');
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        // Get current position
        const position = popup.getPosition();
        const map = popup.getMap();
        const pixel = map.getPixelFromCoordinate(position);
        
        // Update position
        const newPixel = [pixel[0] - pos1, pixel[1] - pos2];
        const newPosition = map.getCoordinateFromPixel(newPixel);
        popup.setPosition(newPosition);
    }

    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
        element.classList.remove('dragging');
    }
}
