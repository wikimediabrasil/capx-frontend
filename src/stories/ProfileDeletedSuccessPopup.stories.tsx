import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ProfileDeletedSuccessPopup from '@/components/ProfileDeletedSuccessPopup';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import { useEffect } from 'react';

// Helper component to force theme mode
const ThemeWrapper = ({
  children,
  forceDarkMode,
}: {
  children: React.ReactNode;
  forceDarkMode: boolean;
}) => {
  const { setDarkMode } = useTheme();

  useEffect(() => {
    setDarkMode(forceDarkMode);
  }, [forceDarkMode, setDarkMode]);

  return <>{children}</>;
};

const meta: Meta<typeof ProfileDeletedSuccessPopup> = {
  title: 'Components/ProfileDeletedSuccessPopup',
  component: ProfileDeletedSuccessPopup,
  decorators: [
    Story => (
      <AppProvider>
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      </AppProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Success popup shown after profile deletion. Auto-closes after 3 seconds. Desktop stories require 1280px+ viewport width, mobile stories use 375px viewport.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the popup is visible',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when popup closes (auto or manual)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProfileDeletedSuccessPopup>;

// Helper component to manage state in stories
const _PopupWithState = (args: any) => {
  const [isOpen, setIsOpen] = useState(args.isOpen ?? true);

  return (
    <div>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          Show Delete Success Popup
        </button>
        <p style={{ marginTop: '10px', color: '#666' }}>
          Click the button to see the popup. It will auto-close after 3 seconds.
        </p>
      </div>
      <ProfileDeletedSuccessPopup
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          args.onClose?.();
        }}
      />
    </div>
  );
};

// ============================================
// DESKTOP STORIES
// ============================================

export const DesktopLightMode: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Popup closed - Desktop Light Mode'),
  },
  decorators: [
    Story => (
      <AppProvider>
        <ThemeProvider>
          <ThemeWrapper forceDarkMode={false}>
            <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
              <Story />
            </div>
          </ThemeWrapper>
        </ThemeProvider>
      </AppProvider>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
    chromatic: { viewports: [1280] },
    backgrounds: {
      default: 'light',
    },
    docs: {
      description: {
        story:
          'Desktop view in light mode with user_check_dark.svg icon. View at 1280px+ width to see full desktop layout.',
      },
    },
  },
};

export const DesktopDarkMode: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Popup closed - Desktop Dark Mode'),
  },
  decorators: [
    Story => (
      <AppProvider>
        <ThemeProvider>
          <ThemeWrapper forceDarkMode={true}>
            <div style={{ backgroundColor: '#04222F', minHeight: '100vh' }}>
              <Story />
            </div>
          </ThemeWrapper>
        </ThemeProvider>
      </AppProvider>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
    chromatic: { viewports: [1280] },
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story:
          'Desktop view in dark mode with user_check.svg icon. View at 1280px+ width to see full desktop layout.',
      },
    },
  },
};

// ============================================
// MOBILE STORIES
// ============================================

export const MobileLightMode: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Popup closed - Mobile Light Mode'),
  },
  decorators: [
    Story => (
      <AppProvider>
        <ThemeProvider>
          <ThemeWrapper forceDarkMode={false}>
            <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
              <Story />
            </div>
          </ThemeWrapper>
        </ThemeProvider>
      </AppProvider>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    backgrounds: {
      default: 'light',
    },
    docs: {
      description: {
        story: 'Mobile view in light mode.',
      },
    },
  },
};

export const MobileDarkMode: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Popup closed - Mobile Dark Mode'),
  },
  decorators: [
    Story => (
      <AppProvider>
        <ThemeProvider>
          <ThemeWrapper forceDarkMode={true}>
            <div style={{ backgroundColor: '#04222F', minHeight: '100vh' }}>
              <Story />
            </div>
          </ThemeWrapper>
        </ThemeProvider>
      </AppProvider>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Mobile view in dark mode.',
      },
    },
  },
};

export const WithBackdrop: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Popup closed'),
  },
  decorators: [
    Story => (
      <AppProvider>
        <ThemeProvider>
          <div style={{ position: 'relative', minHeight: '100vh' }}>
            <div
              style={{
                padding: '40px',
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              <h1>Profile Edit Page</h1>
              <p>This is example content behind the popup.</p>
              <p>The popup should appear on top with a backdrop overlay.</p>
              <div
                style={{
                  marginTop: '20px',
                  padding: '20px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                }}
              >
                <h2>Profile Information</h2>
                <p>Name: John Doe</p>
                <p>Email: john@example.com</p>
              </div>
            </div>
            <Story />
          </div>
        </ThemeProvider>
      </AppProvider>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
    chromatic: { viewports: [1280] },
    docs: {
      description: {
        story:
          'Shows the popup overlaying other page content with a backdrop. Desktop layout at 1280px+ width.',
      },
    },
  },
};

// Helper component for AutoCloseDemo story
const AutoCloseDemoComponent = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const handleOpen = () => {
    setIsOpen(true);
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <button
          onClick={handleOpen}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          Show Auto-Close Demo
        </button>
        {isOpen && countdown > 0 && (
          <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
            Popup will auto-close in {countdown} seconds...
          </p>
        )}
      </div>
      <ProfileDeletedSuccessPopup
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          args.onClose?.();
        }}
      />
    </div>
  );
};

export const AutoCloseDemo: Story = {
  render: args => <AutoCloseDemoComponent {...args} />,
  args: {
    isOpen: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
    chromatic: { viewports: [1280] },
    docs: {
      description: {
        story:
          'Demonstrates the auto-close functionality with a countdown timer. The popup automatically closes after 3 seconds. Desktop layout at 1280px+ width.',
      },
    },
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log('Popup closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the popup in closed state (nothing is rendered).',
      },
    },
  },
};

export const AccessibilityTest: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Popup closed'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
    chromatic: { viewports: [1280] },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'aria-allowed-attr',
            enabled: true,
          },
        ],
      },
    },
    docs: {
      description: {
        story:
          'Tests accessibility features: ARIA labels, keyboard navigation, focus management. Desktop layout at 1280px+ width.',
      },
    },
  },
};
