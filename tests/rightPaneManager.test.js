import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { initializeRightPane } from '../src/rightPaneManager.js';

describe('Right Pane Manager', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="map"></div>
            <div id="right-container"></div>
            <button id="right-pane-toggle"></button>
        `;
        window.matchMedia = jest.fn().mockReturnValue({
            matches: false,
            addEventListener: jest.fn()
        });
        const drawer = document.getElementById('right-container');
        drawer.show = jest.fn(() => drawer.setAttribute('open', ''));
        drawer.hide = jest.fn(() => drawer.removeAttribute('open'));
    });

    test('announces the drawer state when it opens and closes', () => {
        initializeRightPane();
        const drawer = document.getElementById('right-container');
        const toggle = document.getElementById('right-pane-toggle');

        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(toggle).toHaveAttribute('aria-label', 'Hide controls panel');

        drawer.dispatchEvent(new Event('sl-after-hide'));

        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(toggle).toHaveAttribute('aria-label', 'Show controls panel');
    });
});
