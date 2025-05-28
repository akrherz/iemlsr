import { describe, test, expect } from '@jest/globals';

describe('Right Pane Manager', () => {
    test('should import module without errors', async () => {
        // Simple import test to ensure basic coverage
        const module = await import('../src/rightPaneManager.js');
        expect(module).toBeDefined();
    });
});
