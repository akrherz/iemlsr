import { beforeEach, describe, expect, test } from '@jest/globals';
import { announceStatus } from '../src/accessibilityManager.js';

describe('Accessibility Manager', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="app-status" role="status"></div>';
    });

    test('announces a status message through the live region', () => {
        announceStatus('Selected local storm report.');

        expect(document.getElementById('app-status')).toHaveTextContent(
            'Selected local storm report.'
        );
    });

    test('does not throw when the live region is unavailable', () => {
        document.body.innerHTML = '';

        expect(() => announceStatus('Selected local storm report.')).not.toThrow();
    });
});