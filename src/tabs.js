export function initializeTabs() {
    const tabItems = document.querySelectorAll('.tab .tab-item');
    const tabContents = document.querySelectorAll('.tab-content .tab-pane');
    
    // First deactivate all tabs and contents
    tabItems.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabItems.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab content
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show content for active tab
            const contentId = tab.getAttribute('data-tab');
            const content = document.querySelector(`[data-tab-content="${contentId}"]`);
            if (content) {
                content.classList.add('active');
            }
        });
    });
    
    // Activate first tab and its content by default
    const firstTab = tabItems[0];
    if (firstTab) {
        firstTab.click();
    }
}