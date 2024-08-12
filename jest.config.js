const jestGeneralRules = {
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
      '^.+\\.css$': 'jest-transform-stub',
      '^.+\\.svg$': 'jest-transform-stub'
    },
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '\\.(gif|ttf|eot|svg)$': 'jest-transform-stub'
    },
    testEnvironment: 'jsdom'
  };

  export default jestGeneralRules;