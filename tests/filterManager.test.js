// @ts-ignore
import { describe, test, expect, beforeEach, jest } from "@jest/globals";

// Mock TomSelect before importing the module
const mockTomSelectInstance = {
  on: jest.fn(),
  addOption: jest.fn(),
  getValue: jest.fn(() => []),
  setValue: jest.fn(),
};

const mockTomSelect = jest.fn(() => mockTomSelectInstance);
jest.mock("tom-select", () => mockTomSelect);

// Mock other dependencies
jest.mock("../src/iemdata.js", () => ({
  iemdata: {
    wfos: [
      ["LOT", "CHICAGO"],
      ["DMX", "DES_MOINES"],
    ],
    states: [
      ["IA", "Iowa"],
      ["NE", "Nebraska"],
    ],
  },
}));

jest.mock("../src/tableManager.js", () => ({
  lsrtable: {
    column: jest.fn(() => ({
      search: jest.fn(() => ({
        draw: jest.fn(),
      })),
    })),
  },
  sbwtable: {
    column: jest.fn(() => ({
      search: jest.fn(() => ({
        draw: jest.fn(),
      })),
    })),
  },
}));

jest.mock("../src/state.js", () => ({
  setState: jest.fn(),
  getState: jest.fn(() => false),
  StateKeys: {
    WFO_FILTER: "wfoFilter",
    STATE_FILTER: "stateFilter",
    BY_STATE: "byState",
    LSR_TYPES: "lsrTypes",
    SBW_TYPES: "sbwTypes",
  },
}));

describe("Filter Manager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";

    // Create mock DOM elements with correct IDs matching the real application
    const wfoSelect = document.createElement("select");
    wfoSelect.id = "wfo";
    document.body.appendChild(wfoSelect);

    const stateSelect = document.createElement("select");
    stateSelect.id = "state";
    document.body.appendChild(stateSelect);

    const lsrSelect = document.createElement("select");
    lsrSelect.id = "lsrtypefilter";
    document.body.appendChild(lsrSelect);

    const sbwSelect = document.createElement("select");
    sbwSelect.id = "sbwtypefilter";
    document.body.appendChild(sbwSelect);

    // Create radio buttons
    const stateRadio = document.createElement("input");
    stateRadio.type = "radio";
    stateRadio.name = "by";
    stateRadio.value = "state";
    document.body.appendChild(stateRadio);

    const wfoRadio = document.createElement("input");
    wfoRadio.type = "radio";
    wfoRadio.name = "by";
    wfoRadio.value = "wfo";
    document.body.appendChild(wfoRadio);
  });

  test("should import module without errors", async () => {
    const module = await import("../src/filterManager.js");
    expect(module).toBeDefined();
    expect(typeof module.initializeFilters).toBe("function");
  });

  test("should configure TomSelect with searchField for location selects", async () => {
    const module = await import("../src/filterManager.js");

    // Initialize filters
    module.initializeFilters();

    // Verify TomSelect was called multiple times (for different selects)
    expect(mockTomSelect).toHaveBeenCalled();

    // Check that at least one TomSelect instance was configured with searchField
    const calls = mockTomSelect.mock.calls;
    const locationSelectCall = calls.find(
      (call) =>
        call[1] &&
        call[1].searchField &&
        Array.isArray(call[1].searchField) &&
        call[1].searchField.includes("value") &&
        call[1].searchField.includes("text")
    );

    expect(locationSelectCall).toBeDefined();
    expect(locationSelectCall[1].searchField).toEqual(["value", "text"]);
  });

  test("should configure location select with correct render functions", async () => {
    const module = await import("../src/filterManager.js");

    module.initializeFilters();

    // Find the location select configuration
    const calls = mockTomSelect.mock.calls;
    const locationCall = calls.find((call) => call[1] && call[1].searchField);

    expect(locationCall).toBeDefined();

    if (locationCall) {
      const config = locationCall[1];

      // Test render functions
      expect(config.render).toBeDefined();
      expect(config.render.item).toBeDefined();
      expect(config.render.option).toBeDefined();

      // Test the render output with sample data
      const testData = { value: "LOT", text: "CHICAGO" };
      const itemHtml = config.render.item(testData);
      const optionHtml = config.render.option(testData);

      expect(itemHtml).toBe("<div>[LOT] CHICAGO</div>");
      expect(optionHtml).toBe("<div>[LOT] CHICAGO</div>");
    }
  });

  test("should configure location select with correct base options", async () => {
    const module = await import("../src/filterManager.js");

    module.initializeFilters();

    // Find the location select configuration
    const calls = mockTomSelect.mock.calls;
    const locationCall = calls.find((call) => call[1] && call[1].searchField);

    if (locationCall) {
      const config = locationCall[1];

      // Verify base configuration properties
      expect(config.allowEmptyOption).toBe(true);
      expect(config.maxItems).toBe(null);
      expect(config.plugins).toBeDefined();
      expect(config.plugins.clear_button).toBeDefined();
    }
  });
});
