import { describe, test, expect } from '@jest/globals';

describe('Time Utils', () => {
    test('should import module without errors', async () => {
        // Simple import test to ensure basic coverage
        const module = await import('../src/timeUtils.js');
        expect(module).toBeDefined();
        expect(typeof module.toLocaleString).toBe('function');
        expect(typeof module.updateTimeInputs).toBe('function');
        expect(typeof module.setupTimeEventHandlers).toBe('function');
        expect(typeof module.formatForDateTimeLocal).toBe('function');
    });

    test('should format dates correctly', async () => {
        const module = await import('../src/timeUtils.js');
        const testDate = new Date('2023-01-01T12:00:00Z');
        
        // Test formatForDateTimeLocal function
        const formatted = module.formatForDateTimeLocal(testDate);
        expect(typeof formatted).toBe('string');
        expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });
});
