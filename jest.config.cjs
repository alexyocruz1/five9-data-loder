module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.jsx?$': '<rootDir>/jest-esm-transformer.cjs',
    '^.+\\.css$': 'jest-transform-stub',
    '^.+\\.svg$': 'jest-transform-stub'
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg)$': 'jest-transform-stub'
  },
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    '/node_modules/(?!axios)' // Add any other modules that need to be transformed here
  ]
};