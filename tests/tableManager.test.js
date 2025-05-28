import { describe, test, expect } from '@jest/globals';

describe('Table Manager', () => {
    test('should import module without errors', async () => {
        // Simple import test to ensure basic coverage
        const module = await import('../src/tableManager.js');
        expect(module).toBeDefined();
    });
});
