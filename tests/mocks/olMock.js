const olMock = {
  Map: class Map {},
  View: class View {},
  layer: {
    Tile: class Tile {},
    Vector: class Vector {}
  },
  source: {
    XYZ: class XYZ {},
    Vector: class Vector {}
  },
  Overlay: class Overlay {},
  Feature: class Feature {},
  proj: {
    fromLonLat: jest.fn(),
    toLonLat: jest.fn()
  },
  style: {
    Style: class Style {},
    Circle: class Circle {},
    Fill: class Fill {},
    Stroke: class Stroke {},
    Text: class Text {}
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
