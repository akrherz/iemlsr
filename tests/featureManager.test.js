import { describe, test, expect, jest } from '@jest/globals';

// Mock dependencies
jest.mock('ol', () => ({}), { virtual: true });

describe('Feature Manager', () => {
    test('should import module without errors', async () => {
        // Simple import test to ensure basic coverage
        const module = await import('../src/featureManager.js');
        expect(module).toBeDefined();
    });
});
