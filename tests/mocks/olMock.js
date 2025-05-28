
// Mock classes for OpenLayers components
class MockMap {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockView {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockTile {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockVectorLayer {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockXYZ {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockVectorSource {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockOverlay {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockFeature {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockStyle {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockCircle {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockFill {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockStroke {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockText {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockIcon {
  constructor(options = {}) {
    this.options = options;
  }
}
class MockGeoJSON {
  constructor(options = {}) {
    this.options = options;
  }
}

// Mock functions
const mockFromLonLat = () => [0, 0];
const mockToLonLat = () => [0, 0];

const olMock = {
  Map: MockMap,
  View: MockView,
  layer: {
    Tile: MockTile,
    Vector: MockVectorLayer
  },
  source: {
    XYZ: MockXYZ,
    Vector: MockVectorSource
  },
  Overlay: MockOverlay,
  Feature: MockFeature,
  proj: {
    fromLonLat: mockFromLonLat,
    toLonLat: mockToLonLat
  },
  style: {
    Style: MockStyle,
    Circle: MockCircle,
    Fill: MockFill,
    Stroke: MockStroke,
    Text: MockText,
    Icon: MockIcon
  },
  format: {
    GeoJSON: MockGeoJSON
  }
};

export default olMock;
export const Map = olMock.Map;
export const View = olMock.View;
export const layer = olMock.layer;
export const source = olMock.source;
export const Overlay = olMock.Overlay;
export const Feature = olMock.Feature;
export const proj = olMock.proj;
export const style = olMock.style;
export const format = olMock.format;

// Export individual style components for direct imports
export const Style = MockStyle;
export const Circle = MockCircle;
export const Fill = MockFill;
export const Stroke = MockStroke;
export const Text = MockText;
export const Icon = MockIcon;

// Export other commonly imported components
export const GeoJSON = MockGeoJSON;
export const VectorLayer = MockVectorLayer;
export const VectorSource = MockVectorSource;
