import { requireElement } from 'iemjs/domUtils';

/** Default application title displayed in the branding overlay */
const DEFAULT_TITLE = 'IEM LSR App';

/**
 * Updates the branding overlay with the given title.
 * @param {string} title - The title text to display in the overlay
 * @returns {void}
 */
export function updateBrandingOverlay(title) {
    const brandingOverlay = requireElement('branding-overlay');
    brandingOverlay.textContent = title;
}

/**
 * Initializes the branding overlay with the default application title.
 * @returns {void}
 */
export function initBrandingOverlay() {
    updateBrandingOverlay(DEFAULT_TITLE);
}
