export function initializeTabs(tabContainerId) {
    const container = document.getElementById(tabContainerId);
    const tabs = container.querySelectorAll('.tab-item');
    const tabContents = container.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Activate the clicked tab and corresponding content
            tab.classList.add('active');
            const contentId = tab.getAttribute('data-tab');
            const content = container.querySelector(`[data-tab-content="${contentId}"]`);
            if (content) {
                content.classList.add('active');
            }
        });
    });
}