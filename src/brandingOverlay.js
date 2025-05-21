
/**
 * Update the branding overlay with the given title.
 * @param {text} title 
 */
export function updateBrandingOverlay(title) {
    const brandingOverlay = document.getElementById('branding-overlay');
    if (!brandingOverlay) {
        return;
    }
    brandingOverlay.textContent = title;
}

export function initBrandingOverlay() {

    updateBrandingOverlay("IEM LSR App");
}
