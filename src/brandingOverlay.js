import { requireElement } from 'iemjs/domUtils';

/**
 * Update the branding overlay with the given title.
 * @param {string} title 
 */
export function updateBrandingOverlay(title) {
    const brandingOverlay = requireElement('branding-overlay');
    brandingOverlay.textContent = title;
}

export function initBrandingOverlay() {

    updateBrandingOverlay("IEM LSR App");
}
