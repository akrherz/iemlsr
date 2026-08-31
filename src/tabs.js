/**
 * Initialize tab functionality for the application.
 * Handles tab switching and content display.
 */
export function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    function activateTab(tab) {
        tabBtns.forEach(button => {
            const isActive = button === tab;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', String(isActive));
            button.tabIndex = isActive ? 0 : -1;
        });

        const tabId = `${tab.dataset.tab}-tab`;
        tabContents.forEach(content => {
            const isActive = content.id === tabId;
            content.classList.toggle('active', isActive);
            content.hidden = !isActive;
        });
    }

    tabBtns.forEach((tab, index) => {
        tab.addEventListener('click', () => activateTab(tab));
        tab.addEventListener('keydown', event => {
            let targetIndex;
            if (event.key === 'ArrowRight') {
                targetIndex = (index + 1) % tabBtns.length;
            } else if (event.key === 'ArrowLeft') {
                targetIndex = (index - 1 + tabBtns.length) % tabBtns.length;
            } else if (event.key === 'Home') {
                targetIndex = 0;
            } else if (event.key === 'End') {
                targetIndex = tabBtns.length - 1;
            } else {
                return;
            }
            event.preventDefault();
            const targetTab = tabBtns[targetIndex];
            activateTab(targetTab);
            targetTab.focus();
        });
    });
}