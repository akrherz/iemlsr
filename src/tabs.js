/**
 * Initialize both Bootstrap-style and ARIA tabs in the application.
 * Handles both .nav-tabs links and [role="tab"] elements.
 */
export function initializeTabs() {
    // Initialize Bootstrap-style tabs
    const tabLinks = document.querySelectorAll('.nav-tabs a');
    const tabContents = document.querySelectorAll('.tab-pane');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all tabs and panes
            tabLinks.forEach(l => l.parentElement.classList.remove('active'));
            tabContents.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            link.parentElement.classList.add('active');
            const paneId = link.getAttribute('href').substring(1);
            document.getElementById(paneId)?.classList.add('active');
        });
    });

    // Initialize ARIA tabs
    const ariaTabs = document.querySelectorAll('[role="tab"]');
    const ariaTabPanels = document.querySelectorAll('[role="tabpanel"]');

    ariaTabs.forEach(tab => {
        tab.addEventListener('click', e => {
            e.preventDefault();
            
            // Deactivate all tabs
            ariaTabs.forEach(t => {
                t.setAttribute('aria-selected', 'false');
                t.classList.remove('active');
            });
            
            // Hide all tab panels
            ariaTabPanels.forEach(panel => {
                panel.setAttribute('hidden', 'true');
                panel.classList.remove('active');
            });
            
            // Activate the selected tab
            tab.setAttribute('aria-selected', 'true');
            tab.classList.add('active');
            
            // Show the associated panel
            const panelId = tab.getAttribute('aria-controls');
            document.getElementById(panelId)?.removeAttribute('hidden');
            document.getElementById(panelId)?.classList.add('active');
        });
    });

    // Activate first tabs by default
    if (tabLinks.length > 0) {
        tabLinks[0].click();
    }
    if (ariaTabs.length > 0 && tabLinks.length === 0) {
        ariaTabs[0].click();
    }
}