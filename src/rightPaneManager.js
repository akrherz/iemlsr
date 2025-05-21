// Manages the right side pane with LSR and SBW tables

/**
 * Initializes the right pane functionality
 */
export function initializeRightPane() {
    const rightContainer = document.getElementById('right-container');
    const mapContainer = document.getElementById('map');
    const toggleBtn = document.getElementById('right-pane-toggle');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const mobileQuery = window.matchMedia('(max-width: 768px)');

    // Initial state - start expanded on desktop, collapsed on mobile
    const isMobile = mobileQuery.matches;

    // Set initial state
    if (isMobile) {
        // Start with panel hidden but ready to slide up
        rightContainer.hide();  // Use the Shoelace method directly
        mapContainer.classList.remove('with-right-pane');
        toggleBtn.textContent = '▲';
    } else {
        rightContainer.show();  // Use the Shoelace method directly
        mapContainer.classList.add('with-right-pane');
        toggleBtn.textContent = '▶';
    }

    // Toggle pane visibility
    toggleBtn.addEventListener('click', () => {
        const isCurrentlyOpen = rightContainer.hasAttribute('open');
        
        if (mobileQuery.matches) {
            // Mobile behavior - use show/hide methods directly
            if (isCurrentlyOpen) {
                rightContainer.hide();
            } else {
                rightContainer.show();
            }
            toggleBtn.textContent = isCurrentlyOpen ? '▲' : '▼';
        } else {
            // Desktop behavior - unchanged
            if (isCurrentlyOpen) {
                rightContainer.hide();
            } else {
                rightContainer.show();
            }
            toggleBtn.textContent = isCurrentlyOpen ? '◀' : '▶';
        }
        
        if (isCurrentlyOpen) {
            mapContainer.classList.remove('with-right-pane');
        } else {
            mapContainer.classList.add('with-right-pane');
        }
        
        // Trigger OpenLayers map resize after animation completes
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 300);
    });

    // Handle drawer opening/closing events
    rightContainer.addEventListener('sl-after-show', () => {
        mapContainer.classList.add('with-right-pane');
        // Set arrow direction based on viewport
        toggleBtn.textContent = mobileQuery.matches ? '▼' : '◀';
        // Force redraw for mobile
        if (mobileQuery.matches) {
            rightContainer.style.display = 'none';
            rightContainer.offsetHeight; // Force reflow
            rightContainer.style.display = '';
        }
        window.dispatchEvent(new Event('resize'));
    });

    rightContainer.addEventListener('sl-after-hide', () => {
        mapContainer.classList.remove('with-right-pane');
        // Set arrow direction based on viewport
        toggleBtn.textContent = mobileQuery.matches ? '▲' : '▶';
        window.dispatchEvent(new Event('resize'));
    });
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update button states
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update content visibility
            const tabId = btn.dataset.tab + '-tab';
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Handle mobile responsiveness
    function handleMobileChange(e) {
        if (e.matches) {
            // Mobile view - start collapsed
            rightContainer.hide?.() || rightContainer.removeAttribute('open');
            mapContainer.classList.remove('with-right-pane');
            toggleBtn.textContent = '▲';  // Point up when closed on mobile
        } else {
            // Desktop view - start expanded
            rightContainer.show?.() || rightContainer.setAttribute('open', '');
            mapContainer.classList.add('with-right-pane');
            toggleBtn.textContent = '▶';  // Point right when open on desktop
        }
        // Trigger OpenLayers map resize
        window.dispatchEvent(new Event('resize'));
    }
    mobileQuery.addEventListener('change', handleMobileChange);
}
