import { describe, test, expect } from '@jest/globals';
import { summarizeDrawCounts, formatTypeCounts, formatTypeCountText } from '../src/drawCountUtils.js';

function makeFeature({
    hidden = false,
    intersects = false,
    type,
    typetext,
    phenomena,
    significance,
    coordinate
} = {}) {
    return {
        hidden,
        get(key) {
            if (key === 'type') {
                return type;
            }
            if (key === 'typetext') {
                return typetext;
            }
            if (key === 'phenomena') {
                return phenomena;
            }
            if (key === 'significance') {
                return significance;
            }
            return undefined;
        },
        getGeometry() {
            return {
                intersectsExtent() {
                    return intersects;
                },
                getCoordinates() {
                    return coordinate;
                }
            };
        }
    };
}

describe('drawCountUtils', () => {
    test('summarizeDrawCounts respects visibility and hidden flags', () => {
        const extent = [0, 0, 10, 10];
        const lsrFeatures = [
            makeFeature({ intersects: true, type: 'T', typetext: 'TORNADO' }),
            makeFeature({ intersects: true, type: 'H', typetext: 'HAIL', hidden: true }),
            makeFeature({ intersects: false, type: 'H', typetext: 'HAIL' })
        ];
        const sbwFeatures = [
            makeFeature({ intersects: true, phenomena: 'TO', significance: 'W' }),
            makeFeature({ intersects: true, phenomena: 'SV', significance: 'W' })
        ];

        const summary = summarizeDrawCounts(extent, {
            lsrFeatures,
            sbwFeatures,
            lsrVisible: true,
            sbwVisible: false
        });

        expect(summary.lsrTotal).toBe(1);
        expect(summary.sbwTotal).toBe(0);
        expect(summary.lsrTypes).toEqual({ TORNADO: 1 });
        expect(summary.sbwTypes).toEqual({});
    });

    test('summarizeDrawCounts counts intersecting SBW types', () => {
        const extent = [0, 0, 10, 10];
        const summary = summarizeDrawCounts(extent, {
            lsrFeatures: [],
            sbwFeatures: [
                makeFeature({ intersects: true, phenomena: 'TO', significance: 'W' }),
                makeFeature({ intersects: true, phenomena: 'TO', significance: 'W' }),
                makeFeature({ intersects: true, phenomena: 'SV', significance: 'W' }),
                makeFeature({ intersects: false, phenomena: 'FF', significance: 'W' })
            ],
            lsrVisible: false,
            sbwVisible: true
        });

        expect(summary.sbwTotal).toBe(3);
        expect(summary.sbwTypes).toEqual({ 'TO.W': 2, 'SV.W': 1 });
    });

    test('summarizeDrawCounts falls back to coordinate checks when needed', () => {
        const extent = [0, 0, 10, 10];
        const feature = {
            hidden: false,
            get(key) {
                if (key === 'typetext') {
                    return 'TSTM WND GST';
                }
                return 'A';
            },
            getGeometry() {
                return {
                    getCoordinates() {
                        return [5, 5];
                    }
                };
            }
        };

        const summary = summarizeDrawCounts(extent, {
            lsrFeatures: [feature],
            sbwFeatures: [],
            lsrVisible: true,
            sbwVisible: false
        });

        expect(summary.lsrTotal).toBe(1);
        expect(summary.lsrTypes).toEqual({ 'TSTM WND GST': 1 });
    });

    test('formatTypeCounts returns compact sorted output', () => {
        expect(formatTypeCounts({ TO: 2, FF: 4, SV: 4 })).toEqual([
            ['FF', 4],
            ['SV', 4],
            ['TO', 2]
        ]);
        expect(formatTypeCountText({ TO: 2, FF: 4, SV: 4 })).toBe('FF: 4 SV: 4 TO: 2');
        expect(formatTypeCountText({})).toBe('none');
    });
});
