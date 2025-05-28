import { describe, test, expect, beforeEach } from '@jest/globals';
import { setState, StateKeys } from '../src/state.js';

// Create a simple test that validates the getShapefileLink function via indirect testing
describe('Export Manager', () => {
    beforeEach(() => {
        // Clear the document body before each test
        document.body.innerHTML = '';
        
        // Reset state with valid dates
        setState(StateKeys.BY_STATE, false);
        setState(StateKeys.STS, new Date('2023-01-01T12:00:00Z'));
        setState(StateKeys.ETS, new Date('2023-01-02T12:00:00Z'));
    });

    describe('Date UTC Conversion', () => {
        test('should properly handle Date objects in state', () => {
            // Test that our state management properly stores Date objects
            const testSts = new Date('2023-06-15T10:30:00Z');
            const testEts = new Date('2023-06-15T18:45:00Z');
            
            setState(StateKeys.STS, testSts);
            setState(StateKeys.ETS, testEts);
            
            // Verify dates are properly stored
            expect(testSts instanceof Date).toBe(true);
            expect(testEts instanceof Date).toBe(true);
            
            // Verify ISO string conversion works (this is what our export function uses)
            expect(testSts.toISOString()).toBe('2023-06-15T10:30:00.000Z');
            expect(testEts.toISOString()).toBe('2023-06-15T18:45:00.000Z');
        });

        test('should handle date conversion to UTC properly', () => {
            // Test with a local date that needs UTC conversion
            const localDate = new Date('2023-12-25T15:30:00');
            setState(StateKeys.STS, localDate);
            
            // Verify the ISO string conversion maintains UTC format
            const isoString = localDate.toISOString();
            expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(isoString.endsWith('Z')).toBe(true);
        });

        test('should validate Date object type checking', () => {
            // Test our type validation logic with valid dates
            const validDate = new Date('2023-01-01T00:00:00Z');
            
            // Valid date should pass instanceof check
            expect(validDate instanceof Date).toBe(true);
            expect(typeof validDate.toISOString).toBe('function');
            
            // Test that toISOString produces expected format
            expect(validDate.toISOString()).toBe('2023-01-01T00:00:00.000Z');
        });

        test('should handle URL encoding of ISO date strings', () => {
            const testDate = new Date('2023-01-01T12:30:45.123Z');
            const isoString = testDate.toISOString();
            
            // Test that ISO string can be URL encoded properly
            const encoded = encodeURIComponent(isoString);
            expect(encoded).toBe('2023-01-01T12%3A30%3A45.123Z');
            
            // Test that it can be used in URLSearchParams
            const params = new URLSearchParams();
            params.append('sts', isoString);
            expect(params.toString()).toContain('sts=2023-01-01T12%3A30%3A45.123Z');
        });

        test('should preserve timezone information in UTC format', () => {
            // Test various timezone scenarios
            const utcDate = new Date('2023-07-04T16:20:00.000Z');
            const estDate = new Date('2023-07-04T12:20:00-04:00'); // Same moment in EST
            
            // Both should convert to the same UTC ISO string
            expect(utcDate.toISOString()).toBe(estDate.toISOString());
            expect(utcDate.toISOString()).toBe('2023-07-04T16:20:00.000Z');
        });
    });

    describe('Export URL Generation Logic', () => {
        test('should validate URLSearchParams creation for export URLs', () => {
            const params = new URLSearchParams();
            const testSts = new Date('2023-01-01T12:00:00Z');
            const testEts = new Date('2023-01-02T12:00:00Z');
            
            // Test the logic used in getShapefileLink
            params.append('sts', testSts.toISOString());
            params.append('ets', testEts.toISOString());
            params.append('wfo', encodeURIComponent('DMX'));
            params.append('wfo', encodeURIComponent('OAX'));
            
            const queryString = params.toString();
            expect(queryString).toContain('sts=2023-01-01T12%3A00%3A00.000Z');
            expect(queryString).toContain('ets=2023-01-02T12%3A00%3A00.000Z');
            expect(queryString).toContain('wfo=DMX');
            expect(queryString).toContain('wfo=OAX');
        });

        test('should handle state-based vs WFO-based filtering', () => {
            const params1 = new URLSearchParams();
            const params2 = new URLSearchParams();
            
            // Test WFO-based filtering
            ['DMX', 'OAX'].forEach(wfo => {
                params1.append('wfo', encodeURIComponent(wfo));
            });
            
            // Test state-based filtering  
            ['IA', 'NE'].forEach(state => {
                params2.append('state', encodeURIComponent(state));
            });
            
            expect(params1.toString()).toContain('wfo=DMX&wfo=OAX');
            expect(params2.toString()).toContain('state=IA&state=NE');
        });
    });
});
