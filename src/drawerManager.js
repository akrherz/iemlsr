/**
 * Initialize drawer controls
 * @param {HTMLElement} controlsDrawer - The drawer element
 * @param {HTMLElement} leftDrawerToggle - The toggle button
 * @param {HTMLElement} leftDrawerClose - The close button
 * @param {Function} onDrawerStateChange - Callback when drawer state changes
 */
export function initializeDrawerControls(
    controlsDrawer, leftDrawerToggle, leftDrawerClose) {
    function toggleDrawer(drawer) {
        drawer.classList.toggle('open');
    }

    function closeDrawer(drawer) {
        drawer.classList.remove('open');
    }

    // Left Drawer Event Listeners
    leftDrawerToggle.addEventListener('click', () => toggleDrawer(controlsDrawer));
    leftDrawerClose.addEventListener('click', () => closeDrawer(controlsDrawer));

    // Handle outside clicks for left drawer
    document.addEventListener('click', (event) => {
        if (!event.target.closest('#controls-drawer') && 
            !event.target.closest('#drawer-toggle-left') &&
            controlsDrawer.classList.contains('open')) {
            closeDrawer(controlsDrawer);
        }
    });
}
