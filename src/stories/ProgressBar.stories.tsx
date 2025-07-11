import type { Meta, StoryObj } from '@storybook/react';
import ProgressBar from '@/components/ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    progress: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Progress percentage (0-100)',
    },
    darkMode: {
      control: 'boolean',
      description: 'Dark mode theme',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    progress: 75,
    darkMode: false,
  },
};

export const DarkMode: Story = {
  args: {
    progress: 75,
    darkMode: true,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

export const Empty: Story = {
  args: {
    progress: 0,
    darkMode: false,
  },
};

export const Full: Story = {
  args: {
    progress: 100,
    darkMode: false,
  },
};
