import baseConfig from '../../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
          // These packages are genuinely used in source files but the Nx dependency-checks
          // AST scanner can miss them in certain import styles or transitive re-exports:
          // - 'express': used as `import express from 'express'` in reading.controller.ts
          // - 'rxjs': used as `import { Observable, ... } from 'rxjs'` in reading.saga.ts
          // - '@spark-nest-ed/infrastructure-auth': used via `import * as auth from '...'` in reading.controller.ts
          ignoredDependencies: [
            'express',
            'rxjs',
            '@spark-nest-ed/infrastructure-auth',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    ignores: ['**/out-tsc'],
  },
];
