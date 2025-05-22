import { migrateHashToParams } from '../src/urlHandler.js';

// Mock dependencies
jest.mock('../src/state.js', () => ({
  getState: jest.fn(),
  setState: jest.fn(),
  StateKeys: {
    BY_STATE: 'byState',
    WFO_FILTER: 'wfoFilter',
    STATE_FILTER: 'stateFilter',
    REALTIME: 'realtime',
    SECONDS: 'seconds',
    STS: 'sts',
    ETS: 'ets'
  }
}));

jest.mock('../src/settingsManager.js', () => ({
  generateSettings: jest.fn()
}));

describe('URL Handler', () => {
  beforeEach(() => {
    // Reset the URL and clear any existing parameters
    window.history.replaceState({}, '', '/');
    jest.clearAllMocks();
  });

  test('should correctly migrate hash URL to parameters', () => {
    // Set up test hash URL
    const testHash = '#AKQ,BMX,CAE,CHS,EYW,FFC,GSP,HUN,ILM,JAX,LWX,MFL,MHX,MLB,MOB,MRX,RAH,RNK,JSJ,TAE,TBW/202505220400/202505220359/010010';
    window.history.replaceState({}, '', `/${testHash}`);

    // Run migration
    migrateHashToParams();

    // Get the current URL parameters
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    // Verify parameters
    expect(params.get('by')).toBe('wfo');
    expect(params.get('wfo')).toBe('AKQ,BMX,CAE,CHS,EYW,FFC,GSP,HUN,ILM,JAX,LWX,MFL,MHX,MLB,MOB,MRX,RAH,RNK,JSJ,TAE,TBW');
    expect(params.get('sts')).toBe('202505220400');
    expect(params.get('ets')).toBe('202505220359');
    expect(params.get('settings')).toBe('010010');

    // Verify the hash has been removed
    expect(window.location.hash).toBe('');
  });
});
