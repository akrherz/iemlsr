// @ts-ignore
import {
    getElement,
    requireElement,
    getInputElement,
    requireInputElement,
    getTomSelectElement,
    requireTomSelectElement
} from '../src/domUtils.js';
import { describe, test, expect, beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';

describe('DOM Utilities', () => {
    beforeEach(() => {
        // Clear the document body before each test
        document.body.innerHTML = '';
    });

    describe('getElement', () => {
        test('should return element when found', () => {
            document.body.innerHTML = '<div id="test-div">Test</div>';
            const element = getElement('test-div');
            expect(element).not.toBeNull();
            expect(element?.id).toBe('test-div');
        });

        test('should return null when element not found', () => {
            const element = getElement('nonexistent');
            expect(element).toBeNull();
        });

        test('should return element with correct type checking', () => {
            document.body.innerHTML = '<input id="test-input" type="text">';
            const element = getElement('test-input', HTMLInputElement);
            expect(element).toBeInstanceOf(HTMLInputElement);
        });

        test('should return null when type checking fails', () => {
            document.body.innerHTML = '<div id="test-div">Test</div>';
            const element = getElement('test-div', HTMLInputElement);
            expect(element).toBeNull();
        });
    });

    describe('requireElement', () => {
        test('should return element when found', () => {
            document.body.innerHTML = '<div id="test-div">Test</div>';
            const element = requireElement('test-div');
            expect(element).not.toBeNull();
            expect(element.id).toBe('test-div');
        });

        test('should throw error when element not found', () => {
            expect(() => requireElement('nonexistent')).toThrow("Required element 'nonexistent' not found or wrong type");
        });

        test('should throw error when type checking fails', () => {
            document.body.innerHTML = '<div id="test-div">Test</div>';
            expect(() => requireElement('test-div', HTMLInputElement)).toThrow("Required element 'test-div' not found or wrong type");
        });
    });

    describe('getInputElement', () => {
        test('should return input element when found', () => {
            document.body.innerHTML = '<input id="test-input" type="text">';
            const element = getInputElement('test-input');
            expect(element).toBeInstanceOf(HTMLInputElement);
            expect(element?.id).toBe('test-input');
        });

        test('should return null when element is not an input', () => {
            document.body.innerHTML = '<div id="test-div">Test</div>';
            const element = getInputElement('test-div');
            expect(element).toBeNull();
        });
    });

    describe('requireInputElement', () => {
        test('should return input element when found', () => {
            document.body.innerHTML = '<input id="test-input" type="text">';
            const element = requireInputElement('test-input');
            expect(element).toBeInstanceOf(HTMLInputElement);
            expect(element.id).toBe('test-input');
        });

        test('should throw error when element is not an input', () => {
            document.body.innerHTML = '<div id="test-div">Test</div>';
            expect(() => requireInputElement('test-div')).toThrow("Required element 'test-div' not found or wrong type");
        });
    });

    describe('TomSelect Elements', () => {
        test('getTomSelectElement should return element with tomselect property', () => {
            document.body.innerHTML = '<select id="test-select"></select>';
            const selectElement = requireTomSelectElement('test-select');
            
            // Mock TomSelect initialization by adding tomselect property
            const mockTomSelect = {
                getValue: jest.fn(() => []),
                setValue: jest.fn(),
                clear: jest.fn(),
                addOption: jest.fn()
            };
            selectElement.tomselect = mockTomSelect;

            const element = getTomSelectElement('test-select');
            expect(element).not.toBeNull();
            expect(element?.tomselect).toBe(mockTomSelect);
        });

        test('getTomSelectElement should return null when element has no tomselect property', () => {
            document.body.innerHTML = '<select id="test-select"></select>';
            const element = getTomSelectElement('test-select');
            expect(element).toBeNull();
        });

        test('requireTomSelectElement should throw error when element has no tomselect property', () => {
            document.body.innerHTML = '<select id="test-select"></select>';
            expect(() => requireTomSelectElement('test-select')).toThrow("Required TomSelect element 'test-select' not found or not initialized");
        });

        test('requireTomSelectElement should return element with tomselect property', () => {
            document.body.innerHTML = '<select id="test-select"></select>';
            const selectElement = document.getElementById('test-select');
            
            // Mock TomSelect initialization
            const mockTomSelect = {
                getValue: jest.fn(() => []),
                setValue: jest.fn(),
                clear: jest.fn(),
                addOption: jest.fn()
            };
            selectElement.tomselect = mockTomSelect;

            const element = requireTomSelectElement('test-select');
            expect(element).not.toBeNull();
            expect(element.tomselect).toBe(mockTomSelect);
        });
    });
});
