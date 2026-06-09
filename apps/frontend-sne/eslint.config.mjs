import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
            // Allow static imports from frontend-core-api (needed for initialization in main.tsx)
            '^@spark-nest-ed/frontend-core-api$',
            // Allow imports from hooks subpath (designed for static imports)
            '^@spark-nest-ed/frontend-core-api/hooks$',
          ],
        },
      ],
    },
  },
];
