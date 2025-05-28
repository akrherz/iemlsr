// @ts-ignore
import {
    getElement,
    requireElement,
    getInputElement,
    requireInputElement
} from '../src/domUtils.js';
import { describe, test, expect, beforeEach } from '@jest/globals';

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

});
