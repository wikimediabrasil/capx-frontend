import type { StorybookConfig } from '@storybook/nextjs';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const _dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    '../src/stories/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/stories/**/*.story.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  features: {
    experimentalRSC: true,
  },
  webpackFinal: async config => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/link': path.resolve(_dirname, '../__mocks__/next/link.tsx'),
      };
    }
    return config;
  },
  staticDirs: ['../public'],
};

export default config;
