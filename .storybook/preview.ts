import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/app/globals.css';
import Image from 'next/image';
import { ImageProps } from 'next/image';

Image.propTypes = {
  unoptimized: undefined,
};

const OriginalNextImage = Image;

Object.defineProperty(Image, 'default', {
  configurable: true,
  value: (props: ImageProps) => {
    return React.createElement(OriginalNextImage, {
      ...props,
      unoptimized: true,
    });
  },
});

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [Story => React.createElement('div', null, React.createElement(Story, null))],
};

export default preview;
