import { describe, test, expect, jest } from '@jest/globals';

// Mock dependencies
jest.mock('ol', () => ({}), { virtual: true });

describe('Main', () => {
    test('should import module without errors', async () => {
        // Simple import test to ensure basic coverage
        const module = await import('../src/main.js');
        expect(module).toBeDefined();
    });
});
