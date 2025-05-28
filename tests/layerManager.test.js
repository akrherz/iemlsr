import { describe, test, expect, jest } from '@jest/globals';

// Mock dependencies
jest.mock('ol', () => ({}), { virtual: true });

describe('Layer Manager', () => {
    test('should import module without errors', async () => {
        // Simple import test to ensure basic coverage
        const module = await import('../src/layerManager.js');
        expect(module).toBeDefined();
    });
});
