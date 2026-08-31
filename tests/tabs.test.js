import { beforeEach, describe, expect, test } from '@jest/globals';
import { fireEvent } from '@testing-library/dom';
import { initializeTabs } from '../src/tabs.js';

describe('Tabs', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div role="tablist">
                <button class="tab-btn active" data-tab="lsr">LSRs</button>
                <button class="tab-btn" data-tab="sbw">Warnings</button>
                <button class="tab-btn" data-tab="help">Help</button>
            </div>
            <section class="tab-content active" id="lsr-tab"></section>
            <section class="tab-content" id="sbw-tab" hidden></section>
            <section class="tab-content" id="help-tab" hidden></section>
        `;
        initializeTabs();
    });

    test('updates tab and panel accessibility state when a tab is clicked', () => {
        const warningsTab = document.querySelector('[data-tab="sbw"]');
        const warningsPanel = document.getElementById('sbw-tab');

        fireEvent.click(warningsTab);

        expect(warningsTab).toHaveAttribute('aria-selected', 'true');
        expect(warningsTab).toHaveAttribute('tabindex', '0');
        expect(warningsPanel).not.toHaveAttribute('hidden');
        expect(document.getElementById('lsr-tab')).toHaveAttribute('hidden');
    });

    test('moves and activates tabs with arrow keys', () => {
        const lsrTab = document.querySelector('[data-tab="lsr"]');
        const warningsTab = document.querySelector('[data-tab="sbw"]');

        fireEvent.keyDown(lsrTab, { key: 'ArrowRight' });

        expect(warningsTab).toHaveFocus();
        expect(warningsTab).toHaveAttribute('aria-selected', 'true');
        expect(document.getElementById('sbw-tab')).not.toHaveAttribute('hidden');
    });
});
