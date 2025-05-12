export function initializeTabs() {
    const tabs = document.querySelectorAll('[role="tab"]');
    const tabPanels = document.querySelectorAll('[role="tabpanel"]');

    // Add click event handlers to tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', e => {
            e.preventDefault();
            
            // Deactivate all tabs
            tabs.forEach(t => {
                t.setAttribute('aria-selected', 'false');
                t.classList.remove('active');
            });
            
            // Hide all tab panels
            tabPanels.forEach(panel => {
                panel.setAttribute('hidden', 'true');
                panel.classList.remove('active');
            });
            
            // Activate the selected tab
            tab.setAttribute('aria-selected', 'true');
            tab.classList.add('active');
            
            // Show the associated panel
            const panelId = tab.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.removeAttribute('hidden');
                panel.classList.add('active');
            }
        });
    });

    // Activate first tab by default
    if (tabs.length > 0) {
        tabs[0].click();
    }
}