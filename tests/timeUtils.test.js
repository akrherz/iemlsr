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

    test('renderDateTime should handle different type parameters correctly', async () => {
        const module = await import('../src/timeUtils.js');
        const testDate = new Date('2023-06-15T10:30:00Z');
        const testISOString = '2023-06-15T10:30:00.000Z';
        
        // Test with Date object input
        const sortResult = module.renderDateTime(testDate, 'sort');
        expect(sortResult instanceof Date).toBe(true);
        
        const typeResult = module.renderDateTime(testDate, 'type');
        expect(typeResult instanceof Date).toBe(true);
        
        const displayResult = module.renderDateTime(testDate, 'display');
        expect(typeof displayResult).toBe('string');
        expect(displayResult).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{1,2}:\d{2} (AM|PM)$/);
        
        // Test with ISO string input
        const sortResultFromString = module.renderDateTime(testISOString, 'sort');
        expect(sortResultFromString instanceof Date).toBe(true);
        
        const displayResultFromString = module.renderDateTime(testISOString, 'display');
        expect(typeof displayResultFromString).toBe('string');
        expect(displayResultFromString).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{1,2}:\d{2} (AM|PM)$/);
    });

    test('renderDateTime should default to display format for unknown types', async () => {
        const module = await import('../src/timeUtils.js');
        const testDate = new Date('2023-06-15T10:30:00Z');
        
        const result = module.renderDateTime(testDate, 'unknown');
        expect(typeof result).toBe('string');
        expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{1,2}:\d{2} (AM|PM)$/);
        
    });
});
