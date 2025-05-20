

export function updateBrandingOverlay() {
    const brandingOverlay = document.getElementById('branding-overlay');
    if (!brandingOverlay) {
        return;
    }
    const title = 'IEM LSR App';
    brandingOverlay.textContent = title;
}

export function initBrandingOverlay() {

    updateBrandingOverlay();
}
