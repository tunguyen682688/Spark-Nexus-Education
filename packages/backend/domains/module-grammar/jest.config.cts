module.exports = {
  displayName: '@spark-nest-ed/module-grammar',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', isolatedModules: true }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!@spark-nest-ed/)'
  ],
  moduleNameMapper: {
    '^@spark-nest-ed/shared-libs$': '<rootDir>/src/lib/shared-libs.mock.ts',
    '^@spark-nest-ed/infrastructure-database$': '<rootDir>/../../../../packages/backend/infrastructure/database/src/index.ts',
    '^@spark-nest-ed/infrastructure-auth$': '<rootDir>/../../../../packages/backend/infrastructure/auth/src/index.ts',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
};
