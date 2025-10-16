import type { Meta, StoryObj } from '@storybook/react';
import MiniBio from '@/app/(auth)/profile/components/MiniBio';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';

const meta: Meta<typeof MiniBio> = {
  title: 'Components/MiniBio',
  component: MiniBio,
  decorators: [
    Story => (
      <AppProvider>
        <ThemeProvider>
          <div className="max-w-[600px] mx-auto p-4">
            <Story />
          </div>
        </ThemeProvider>
      </AppProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof MiniBio>;

export const Default: Story = {
  args: {
    about: 'This is a sample mini bio text that demonstrates how the component looks with content.',
    isEditing: false,
  },
};

export const Empty: Story = {
  args: {
    about: '',
    isEditing: false,
  },
};

export const LongText: Story = {
  args: {
    about:
      'This is a very long mini bio text that demonstrates how the component handles longer content. It includes multiple sentences and shows how text wrapping works in the component. The text should break properly and maintain good readability even with extensive content.',
    isEditing: false,
  },
};

export const WithLineBreaks: Story = {
  args: {
    about:
      'This is the first line of the mini bio.\n\nThis is the second paragraph.\n\nAnd this is the third paragraph with multiple lines.',
    isEditing: false,
  },
};

export const EditingMode: Story = {
  args: {
    about: 'This text can be edited in the textarea.',
    isEditing: true,
    onAboutChange: (value: string) => console.log('Bio changed:', value),
  },
};

export const EditingModeEmpty: Story = {
  args: {
    about: '',
    isEditing: true,
    onAboutChange: (value: string) => console.log('Bio changed:', value),
  },
};

export const CustomMaxLength: Story = {
  args: {
    about: 'This is a short bio with custom max length.',
    isEditing: true,
    maxLength: 100,
    onAboutChange: (value: string) => console.log('Bio changed:', value),
  },
};

export const DarkMode: Story = {
  args: {
    about: 'This mini bio is displayed in dark mode.',
    isEditing: false,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1a1a1a' }],
    },
  },
};

export const DarkModeEditing: Story = {
  args: {
    about: 'This mini bio is in editing mode with dark theme.',
    isEditing: true,
    onAboutChange: (value: string) => console.log('Bio changed:', value),
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1a1a1a' }],
    },
  },
};

export const MobileView: Story = {
  args: {
    about: 'This mini bio is displayed in mobile view with smaller text and icons.',
    isEditing: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const MobileEditing: Story = {
  args: {
    about: 'This mini bio is in editing mode on mobile.',
    isEditing: true,
    onAboutChange: (value: string) => console.log('Bio changed:', value),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const UnicodeText: Story = {
  args: {
    about: 'This mini bio contains unicode characters: 🚀 ✨ 🌟 💫 and emojis!',
    isEditing: false,
  },
};

export const Multilingual: Story = {
  args: {
    about:
      'This mini bio contains multiple languages: English, Español, Français, Deutsch, 中文, 日本語, 한국어, العربية, हिन्दी, Русский.',
    isEditing: false,
  },
};
