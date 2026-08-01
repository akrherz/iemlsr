import { readFileSync } from 'node:fs';
import { describe, test, expect } from '@jest/globals';

describe('Table Manager', () => {
    test('should import module without errors', async () => {
        // Simple import test to ensure basic coverage
        const module = await import('../src/tableManager.js');
        expect(module).toBeDefined();
    });

    test('should use DataTables packages aligned with the current release line', () => {
        const packageJson = JSON.parse(
            readFileSync(`${process.cwd()}/package.json`, 'utf8')
        );
        const dependencies = packageJson.dependencies;

        expect(dependencies['datatables.net']).toBeDefined();
        expect(dependencies['datatables.net-dt']).toBeDefined();
        expect(dependencies['datatables.net-scroller-dt']).toBeDefined();
        expect(dependencies['datatables.net-select-dt']).toBeDefined();
        expect(dependencies['datatables.net-select-dt']).toMatch(/(^\^|^~)?4(\.|$)/);
    });
});
