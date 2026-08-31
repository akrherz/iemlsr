// Manages the right side pane with LSR and SBW tables

/**
 * @typedef {import('@shoelace-style/shoelace/dist/components/drawer/drawer.js').default} SlDrawer
 */

import { requireElement } from 'iemjs/domUtils';

/**
 * Initializes the right pane functionality
 */
export function initializeRightPane() {
    // Type assertion to treat the element as a Shoelace drawer component
    const rightContainer = /** @type {SlDrawer} */ (requireElement('right-container'));
    const mapContainer = requireElement('map');
    const toggleBtn = requireElement('right-pane-toggle');
    const mobileQuery = window.matchMedia('(max-width: 768px)');

    function setToggleState(isOpen) {
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
        const label = `${isOpen ? 'Hide' : 'Show'} controls panel`;
        toggleBtn.setAttribute('aria-label', label);
        toggleBtn.setAttribute('title', label);
    }

    // Initial state - start expanded on desktop, collapsed on mobile
    const isMobile = mobileQuery.matches;

    // Set initial state
    if (isMobile) {
        rightContainer.hide();
        mapContainer.classList.remove('with-right-pane');
        toggleBtn.textContent = '▲';
        setToggleState(false);
    } else {
        rightContainer.show();
        mapContainer.classList.add('with-right-pane');
        toggleBtn.textContent = '▶';
        setToggleState(true);
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
        setToggleState(!isCurrentlyOpen);
        
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
        setToggleState(true);
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
        setToggleState(false);
        window.dispatchEvent(new Event('resize'));
    });
    
    // Handle mobile responsiveness
    function handleMobileChange(e) {
        // Elements are guaranteed to be non-null due to the check above
        const container = /** @type {SlDrawer} */ (rightContainer);
        const map = /** @type {HTMLElement} */ (mapContainer);
        const toggle = /** @type {HTMLElement} */ (toggleBtn);
        
        if (e.matches) {
            // Mobile view - start collapsed
            container.hide();
            map.classList.remove('with-right-pane');
            toggle.textContent = '▲';  // Point up when closed on mobile
            setToggleState(false);
        } else {
            // Desktop view - start expanded
            container.show();
            map.classList.add('with-right-pane');
            toggle.textContent = '▶';  // Point right when open on desktop
            setToggleState(true);
        }
        // Trigger OpenLayers map resize
        window.dispatchEvent(new Event('resize'));
    }
    mobileQuery.addEventListener('change', handleMobileChange);
}
