import { describe, test, expect, beforeEach } from '@jest/globals';
import { updateBrandingOverlay, initBrandingOverlay } from '../src/brandingOverlay.js';

describe('Branding Overlay', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="branding-overlay"></div>';
    });

    test('should export all expected functions', () => {
        expect(typeof updateBrandingOverlay).toBe('function');
        expect(typeof initBrandingOverlay).toBe('function');
    });

    describe('updateBrandingOverlay', () => {
        test('should update the branding overlay text content', () => {
            updateBrandingOverlay('Test Title');

            const element = document.getElementById('branding-overlay');
            expect(element.textContent).toBe('Test Title');
        });

        test('should handle empty string title', () => {
            updateBrandingOverlay('');

            const element = document.getElementById('branding-overlay');
            expect(element.textContent).toBe('');
        });
    });

    describe('initBrandingOverlay', () => {
        test('should initialize with default application title', () => {
            initBrandingOverlay();

            const element = document.getElementById('branding-overlay');
            expect(element.textContent).toBe('IEM LSR App');
        });
    });
});
