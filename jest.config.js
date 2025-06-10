/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': ['babel-jest', { rootMode: "upward" }]
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/tests/mocks/styleMock.js',
    '^ol/style$': '<rootDir>/tests/mocks/ol-style.js',
    '^ol/(.*)$': '<rootDir>/tests/mocks/olMock.js',
    '^ol$': '<rootDir>/tests/mocks/olMock.js',
    '^iemjs/iemdata$': '<rootDir>/node_modules/iemjs/src/iemdata.js',
    '^iemjs/domUtils$': '<rootDir>/node_modules/iemjs/src/domUtils.js'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(ol|color-space|@shoelace-style|@lit|lit|lit-html|lit-element|iemjs)/).*'
  ]
};

export default config;
