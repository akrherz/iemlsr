import { parseHref } from '../src/urlHandler.js';
import { getState, setState, StateKeys } from '../src/state.js';

// Mock dependencies to avoid loading complex UI components
jest.mock('../src/mapManager.js', () => ({
  getN0QLayer: jest.fn(() => ({ setVisible: jest.fn(), getVisible: jest.fn(() => true) })),
  getStatesLayer: jest.fn(() => ({ setVisible: jest.fn(), getVisible: jest.fn(() => true) })),
  getCountiesLayer: jest.fn(() => ({ setVisible: jest.fn(), getVisible: jest.fn(() => true) }))
}));

jest.mock('../src/layerManager.js', () => ({
  getLSRLayer: jest.fn(() => ({ setVisible: jest.fn(), getVisible: jest.fn(() => true) })),
  getSBWLayer: jest.fn(() => ({ setVisible: jest.fn(), getVisible: jest.fn(() => true) })),
  setLSRIconMode: jest.fn()
}));

describe('Settings URL Parameter Bug Fix', () => {
  beforeEach(() => {
    // Reset the URL and clear any existing parameters
    window.history.replaceState({}, '', '/');
    jest.clearAllMocks();
    
    // Reset state
    setState(StateKeys.LAYER_SETTINGS, '');
  });

  test('should properly set LAYER_SETTINGS state from URL parameter', () => {
    // Set up test URL with settings parameter
    window.history.replaceState({}, '', '/?settings=1010101');

    // Parse URL parameters (this should set the state)
    parseHref();

    // Verify the state was set correctly
    const settingsState = getState(StateKeys.LAYER_SETTINGS);
    expect(settingsState).toBe('1010101');
  });

  test('should handle different settings values correctly', () => {
    // Test with different settings value
    window.history.replaceState({}, '', '/?settings=0101010');
    parseHref();
    
    expect(getState(StateKeys.LAYER_SETTINGS)).toBe('0101010');
  });

  test('should handle missing settings parameter', () => {
    // Test with no settings parameter
    window.history.replaceState({}, '', '/');
    parseHref();
    
    // Should remain empty/undefined when no settings in URL
    expect(getState(StateKeys.LAYER_SETTINGS)).toBeFalsy();
  });
});
