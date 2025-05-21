/**
 * Initialize tab functionality for the application.
 * Handles tab switching and content display.
 */
export function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Event listeners for tab buttons
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update button states
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update content visibility
            const tabId = btn.dataset.tab + '-tab';
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId)?.classList.add('active');
        });
    });

    // Show LSR tab by default
    const defaultTab = document.querySelector('.tab-btn[data-tab="lsr"]');
    if (defaultTab) {
        defaultTab.click();
    }
}