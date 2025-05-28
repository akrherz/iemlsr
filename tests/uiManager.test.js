import { describe, test, expect } from '@jest/globals';

describe('UI Manager', () => {
    test('should import module without errors', async () => {
        // Simple import test to ensure basic coverage
        const module = await import('../src/uiManager.js');
        expect(module).toBeDefined();
        expect(typeof module.initializeUI).toBe('function');
    });
});
