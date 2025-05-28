import { describe, test, expect } from '@jest/globals';

describe('Cron Manager', () => {
    test('should import module without errors', async () => {
        // Simple import test to ensure basic coverage
        const module = await import('../src/cronManager.js');
        expect(module).toBeDefined();
        expect(typeof module.cronMinute).toBe('function');
        expect(typeof module.startCronTasks).toBe('function');
    });
});
