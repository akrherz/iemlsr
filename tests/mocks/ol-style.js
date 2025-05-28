// Mock for ol/style module
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

export const Style = MockStyle;
export const Circle = MockCircle;
export const Fill = MockFill;
export const Stroke = MockStroke;
export const Text = MockText;
export const Icon = MockIcon;

export default {
  Style: MockStyle,
  Circle: MockCircle,
  Fill: MockFill,
  Stroke: MockStroke,
  Text: MockText,
  Icon: MockIcon
};
