import { describe, test, expect } from '@jest/globals';

describe('IEM Data', () => {
    test('should import module without errors', async () => {
        // Simple import test to ensure basic coverage
        const module = await import('../src/iemdata.js');
        expect(module).toBeDefined();
        expect(module.iemdata).toBeDefined();
        expect(Array.isArray(module.iemdata.states)).toBe(true);
        expect(Array.isArray(module.iemdata.wfos)).toBe(true);
    });

    test('should have valid data structures', async () => {
        const module = await import('../src/iemdata.js');
        const { iemdata } = module;
        
        // Test states data structure
        expect(iemdata.states.length).toBeGreaterThan(0);
        const firstState = iemdata.states[0];
        expect(Array.isArray(firstState)).toBe(true);
        expect(firstState.length).toBe(2);
        
        // Test WFOs data structure  
        expect(iemdata.wfos.length).toBeGreaterThan(0);
        const firstWfo = iemdata.wfos[0];
        expect(Array.isArray(firstWfo)).toBe(true);
        expect(firstWfo.length).toBe(2);
    });
});
