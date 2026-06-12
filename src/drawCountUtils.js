function isCoordinateInExtent(coordinate, extent) {
    if (!Array.isArray(coordinate) || coordinate.length < 2 || !Array.isArray(extent) || extent.length < 4) {
        return false;
    }
    const x = coordinate[0];
    const y = coordinate[1];
    return x >= extent[0] && x <= extent[2] && y >= extent[1] && y <= extent[3];
}

function isFeatureVisible(feature) {
    return feature && feature.hidden !== true;
}

function featureIntersectsExtent(feature, extent) {
    const geometry = feature?.getGeometry?.();
    if (!geometry) {
        return false;
    }

    if (typeof geometry.intersectsExtent === 'function') {
        return geometry.intersectsExtent(extent);
    }

    if (typeof geometry.getCoordinates === 'function') {
        return isCoordinateInExtent(geometry.getCoordinates(), extent);
    }

    return false;
}

function incrementTypeCount(typeCounts, typeKey) {
    typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;
}

function normalizeTypeKey(value) {
    if (value === undefined || value === null || value === '') {
        return 'UNK';
    }
    return String(value);
}

function getLSRTypeKey(feature) {
    const lsrTypeText = feature?.get?.('typetext');
    if (lsrTypeText !== undefined && lsrTypeText !== null && lsrTypeText !== '') {
        return String(lsrTypeText);
    }
    return normalizeTypeKey(feature?.get?.('type'));
}

function getSBWTypeKey(feature) {
    const phenomena = normalizeTypeKey(feature?.get?.('phenomena'));
    const significance = normalizeTypeKey(feature?.get?.('significance'));
    return `${phenomena}.${significance}`;
}

/**
 * Summarize counts for LSR and SBW features intersecting an extent.
 * @param {number[] | null} extent OpenLayers extent [minX, minY, maxX, maxY]
 * @param {Object} options Counting options
 * @param {Array} options.lsrFeatures LSR features to evaluate
 * @param {Array} options.sbwFeatures SBW features to evaluate
 * @param {boolean} options.lsrVisible Whether LSR layer is visible
 * @param {boolean} options.sbwVisible Whether SBW layer is visible
 * @returns {{lsrTotal:number,sbwTotal:number,lsrTypes:Object,sbwTypes:Object}}
 */
export function summarizeDrawCounts(
    extent,
    {
        lsrFeatures = [],
        sbwFeatures = [],
        lsrVisible = true,
        sbwVisible = true
    } = {}
) {
    const summary = {
        lsrTotal: 0,
        sbwTotal: 0,
        lsrTypes: {},
        sbwTypes: {}
    };

    if (!Array.isArray(extent) || extent.length < 4) {
        return summary;
    }

    if (lsrVisible) {
        lsrFeatures.forEach((feature) => {
            if (!isFeatureVisible(feature) || !featureIntersectsExtent(feature, extent)) {
                return;
            }
            summary.lsrTotal += 1;
            incrementTypeCount(summary.lsrTypes, getLSRTypeKey(feature));
        });
    }

    if (sbwVisible) {
        sbwFeatures.forEach((feature) => {
            if (!isFeatureVisible(feature) || !featureIntersectsExtent(feature, extent)) {
                return;
            }
            summary.sbwTotal += 1;
            incrementTypeCount(summary.sbwTypes, getSBWTypeKey(feature));
        });
    }

    return summary;
}

/**
 * Format abbreviation-heavy type counts for compact UI display.
 * @param {Object} typeCounts Map of type code to count
 * @returns {string}
 */
export function formatTypeCounts(typeCounts) {
    const entries = Object.entries(typeCounts || {});
    entries.sort((a, b) => {
        if (b[1] !== a[1]) {
            return b[1] - a[1];
        }
        return a[0].localeCompare(b[0]);
    });

    return entries;
}

export function formatTypeCountText(typeCounts) {
    const entries = formatTypeCounts(typeCounts);
    if (entries.length === 0) {
        return 'none';
    }

    return entries.map(([type, count]) => `${type}: ${count}`).join(' ');
}
