/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  displayName: 'module-reading',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        isolatedModules: true,
      },
    ],
  },
  // Map @spark-nest-ed/shared-libs to a local mock so that ESM .js extension
  // imports inside the real shared-libs package don't crash ts-jest / SWC.
  moduleNameMapper: {
    '^@spark-nest-ed/shared-libs$': '<rootDir>/src/lib/shared-libs.mock.ts',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
};
