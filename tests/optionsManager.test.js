import { describe, test, expect } from '@jest/globals';

describe('Options Manager', () => {
    test('should import module without errors', async () => {
        // Simple import test to ensure basic coverage
        const module = await import('../src/optionsManager.js');
        expect(module).toBeDefined();
        expect(typeof module.buildRequestOptions).toBe('function');
    });
});
