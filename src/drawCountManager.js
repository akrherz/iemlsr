import DragBox from 'ol/interaction/DragBox';
import { always } from 'ol/events/condition';
import Feature from 'ol/Feature';
import { fromExtent } from 'ol/geom/Polygon';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { transformExtent } from 'ol/proj';
import { getLSRLayer, getSBWLayer } from './layerManager.js';
import { summarizeDrawCounts, formatTypeCounts, formatTypeCountText } from './drawCountUtils.js';

function makeSelectionLayer() {
    return new VectorLayer({
        source: new VectorSource(),
        style: new Style({
            fill: new Fill({ color: 'rgba(33, 150, 243, 0.2)' }),
            stroke: new Stroke({ color: '#0d47a1', width: 2 })
        }),
        zIndex: 2000
    });
}

function createStatsElement() {
    const wrapper = document.createElement('div');
    wrapper.className = 'draw-count-stats';

    const header = document.createElement('div');
    header.className = 'draw-count-stats-header';

    const title = document.createElement('span');
    title.textContent = 'Selection Counts';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'draw-count-stats-close';
    closeButton.setAttribute('aria-label', 'Close draw count selection');
    closeButton.textContent = 'x';

    header.append(title, closeButton);

    const body = document.createElement('div');
    body.className = 'draw-count-stats-body';

    const lsrTotal = document.createElement('div');
    const lsrTypes = document.createElement('div');
    const sbwTotal = document.createElement('div');
    const sbwTypes = document.createElement('div');

    lsrTotal.className = 'draw-count-stats-line';
    lsrTypes.className = 'draw-count-stats-line draw-count-stats-types';
    sbwTotal.className = 'draw-count-stats-line';
    sbwTypes.className = 'draw-count-stats-line draw-count-stats-types';

    [lsrTotal, lsrTypes, sbwTotal, sbwTypes].forEach((row) => {
        const label = document.createElement('span');
        const value = document.createElement('span');
        label.className = 'draw-count-stats-badge draw-count-stats-label';
        value.className = 'draw-count-stats-values';
        row.append(label, value);
    });

    body.append(lsrTotal, lsrTypes, sbwTotal, sbwTypes);
    wrapper.append(header, body);

    return {
        element: wrapper,
        header,
        title,
        closeButton,
        lsrTotal,
        lsrTypes,
        sbwTotal,
        sbwTypes
    };
}

function makeStatsElementDraggable(statsElements) {
    let dragState = null;

    const handleDrag = (event) => {
        if (!dragState) {
            return;
        }

        const nextLeft = dragState.startLeft + (event.clientX - dragState.startX);
        const nextTop = dragState.startTop + (event.clientY - dragState.startY);
        statsElements.element.style.left = `${Math.max(10, nextLeft)}px`;
        statsElements.element.style.top = `${Math.max(10, nextTop)}px`;
    };

    const stopDragging = () => {
        dragState = null;
        statsElements.element.classList.remove('dragging');
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDragging);
    };


    statsElements.header.addEventListener('mousedown', (event) => {
        if (event.target === statsElements.closeButton) {
            return;
        }

        event.preventDefault();
        const rect = statsElements.element.getBoundingClientRect();
        dragState = {
            startX: event.clientX,
            startY: event.clientY,
            startLeft: rect.left,
            startTop: rect.top
        };
        statsElements.element.classList.add('dragging');
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDragging);
    });
}

function formatSelectionTitle(extent) {
    if (!extent || extent.length < 4) {
        return 'Selection Counts';
    }

    const geographicExtent = transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
    const [west, south, east, north] = geographicExtent;
    const formatCoordinate = (value) => Number(value).toFixed(2);

    return `Selection Counts within: ${formatCoordinate(west)} ${formatCoordinate(south)} ${formatCoordinate(east)} ${formatCoordinate(north)}`;
}

function updateStatsText(statsElements, summary) {
    const setTotalRowText = (rowElement, labelText, valueText) => {
        const labelElement = rowElement.children[0];
        const valueElement = rowElement.children[1];
        if (labelElement) {
            labelElement.textContent = labelText;
        }
        if (valueElement) {
            valueElement.replaceChildren();
            const badge = document.createElement('span');
            badge.className = 'draw-count-stats-badge draw-count-stats-value';
            badge.textContent = valueText;
            valueElement.appendChild(badge);
        }
    };

    const setTypeRowText = (rowElement, labelText, typeCounts) => {
        rowElement.replaceChildren();

        const labelBadge = document.createElement('span');
        labelBadge.className = 'draw-count-stats-badge draw-count-stats-label';
        labelBadge.textContent = labelText;
        rowElement.appendChild(labelBadge);

        const entries = formatTypeCounts(typeCounts);
        if (entries.length === 0) {
            const badge = document.createElement('span');
            badge.className = 'draw-count-stats-badge draw-count-stats-value';
            badge.textContent = formatTypeCountText(typeCounts);
            rowElement.appendChild(badge);
            return;
        }

        entries.forEach(([type, count]) => {
            const badge = document.createElement('span');
            badge.className = 'draw-count-stats-badge draw-count-stats-value';
            badge.textContent = `${type}: ${count}`;
            rowElement.appendChild(badge);
        });
    };

    setTotalRowText(statsElements.lsrTotal, 'LSR Total', String(summary.lsrTotal));
    setTypeRowText(statsElements.lsrTypes, 'LSR Types', summary.lsrTypes);
    setTotalRowText(statsElements.sbwTotal, 'Warning Total', String(summary.sbwTotal));
    setTypeRowText(statsElements.sbwTypes, 'Warning Types', summary.sbwTypes);
}

function getLayerFeatures(layer) {
    if (!layer || !layer.getSource) {
        return [];
    }
    return layer.getSource()?.getFeatures?.() || [];
}

/**
 * Initialize the draw-to-count rectangle tool.
 * @param {import('ol/Map').default} map OpenLayers map instance
 */
export function initializeDrawCountTool(map) {
    const mapTarget = map.getTargetElement();
    if (!mapTarget) {
        return;
    }

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'draw-count-toggle';
    toggleButton.textContent = 'Draw to Count';
    mapTarget.appendChild(toggleButton);

    const statsElements = createStatsElement();
    mapTarget.appendChild(statsElements.element);
    makeStatsElementDraggable(statsElements);

    const selectionLayer = makeSelectionLayer();
    map.addLayer(selectionLayer);

    const dragBox = new DragBox({
        condition: always,
        className: 'draw-count-dragbox'
    });
    dragBox.setActive(false);
    map.addInteraction(dragBox);

    let toolActive = false;
    let currentExtent = null;

    const clearSelection = () => {
        currentExtent = null;
        selectionLayer.getSource()?.clear();
        statsElements.element.classList.remove('visible');
    };

    const drawSelection = (extent) => {
        const geometry = fromExtent(extent);
        const feature = new Feature({ geometry });
        const source = selectionLayer.getSource();
        source?.clear();
        source?.addFeature(feature);
    };

    const positionStatsBox = (extent) => {
        if (!extent) {
            return;
        }
        const pixel = map.getPixelFromCoordinate([extent[0], extent[3]]);
        if (!pixel) {
            return;
        }
        const left = Math.max(10, pixel[0]);
        const top = Math.max(10, pixel[1] - 8);
        statsElements.element.style.left = `${left}px`;
        statsElements.element.style.top = `${top}px`;
    };

    const refreshSummary = (extent) => {
        const lsrLayer = getLSRLayer();
        const sbwLayer = getSBWLayer();

        const summary = summarizeDrawCounts(extent, {
            lsrFeatures: getLayerFeatures(lsrLayer),
            sbwFeatures: getLayerFeatures(sbwLayer),
            lsrVisible: Boolean(lsrLayer?.getVisible?.()),
            sbwVisible: Boolean(sbwLayer?.getVisible?.())
        });

        updateStatsText(statsElements, summary);
        statsElements.title.textContent = formatSelectionTitle(extent);
        positionStatsBox(extent);
        statsElements.element.classList.add('visible');
    };

    const setToolActive = (nextActive) => {
        toolActive = nextActive;
        dragBox.setActive(nextActive);
        toggleButton.classList.toggle('active', nextActive);
        toggleButton.textContent = nextActive ? 'Stop Draw Count' : 'Draw to Count';
        mapTarget.classList.toggle('draw-count-active', nextActive);
    };

    toggleButton.addEventListener('click', () => {
        setToolActive(!toolActive);
    });

    statsElements.closeButton.addEventListener('click', () => {
        setToolActive(false);
        clearSelection();
    });

    dragBox.on('boxstart', () => {
        clearSelection();
    });

    dragBox.on('boxdrag', () => {
        const extent = dragBox.getGeometry()?.getExtent?.();
        if (!extent) {
            return;
        }
        currentExtent = extent.slice();
        drawSelection(currentExtent);
        refreshSummary(currentExtent);
    });

    dragBox.on('boxend', () => {
        const extent = dragBox.getGeometry()?.getExtent?.();
        if (!extent) {
            clearSelection();
            return;
        }
        currentExtent = extent.slice();
        drawSelection(currentExtent);
        refreshSummary(currentExtent);
    });
}
