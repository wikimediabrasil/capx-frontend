import type { Meta, StoryObj } from '@storybook/react';
import AuthButton from '@/components/AuthButton';
import MoveOutIcon from '@/public/static/images/move_item.svg';

const meta: Meta<typeof AuthButton> = {
  title: 'Components/AuthButton',
  component: AuthButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AuthButton>;

export const Login: Story = {
  args: {
    message: 'Login',
    isSignOut: false,
  },
};

export const Logout: Story = {
  args: {
    message: 'Logout',
    isSignOut: true,
    imageUrl: MoveOutIcon,
  },
};

export const MobileMenuLogin: Story = {
  args: {
    message: 'Login',
    isSignOut: false,
    isMobileMenu: true,
    imageUrl: MoveOutIcon,
  },
};

export const MobileMenuLogout: Story = {
  args: {
    message: 'Logout',
    isSignOut: true,
    isMobileMenu: true,
    imageUrl: MoveOutIcon,
  },
};

export const LongText: Story = {
  args: {
    message: 'Entrar com sua conta da Wikimedia para acessar todos os recursos',
    isSignOut: false,
  },
};

export const WithIcon: Story = {
  args: {
    message: 'Sign Out',
    isSignOut: true,
    imageUrl: '/static/images/move_item.svg',
    imageAlt: 'Sign out icon',
  },
};

export const Mobile: Story = {
  args: {
    message: 'Sign In',
    isSignOut: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const VeryLongText: Story = {
  args: {
    message:
      'Faça login com sua conta da Wikimedia para ter acesso a todos os recursos e funcionalidades disponíveis na plataforma de compartilhamento',
    isSignOut: false,
  },
};

export const RTLText: Story = {
  args: {
    message: 'تسجيل الدخول باستخدام حساب ويكيميديا الخاص بك للوصول إلى جميع الموارد المتاحة',
    isSignOut: false,
  },
};

export const MobileDefault: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    message: 'Sign in',
    isSignOut: false,
  },
};

export const MobileLongText: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    message: 'Entrar com sua conta da Wikimedia para acessar todos os recursos disponíveis',
    isSignOut: false,
  },
};

export const MobileRTL: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    message: 'تسجيل الدخول باستخدام حساب ويكيميديا الخاص بك',
    isSignOut: false,
  },
};

export const MobileVeryLongText: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    message:
      'Faça login com sua conta da Wikimedia para ter acesso a todos os recursos e funcionalidades disponíveis na plataforma de compartilhamento e colaboração',
    isSignOut: false,
  },
};

export const MobileMultipleLanguages: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    message:
      'Войдите в систему с помощью учетной записи Викимедиа для доступа ко всем доступным ресурсам',
    isSignOut: false,
  },
};

export const WithThemeToggle: Story = {
  decorators: [
    Story => (
      <div className="flex items-center gap-4 bg-gray-100 p-4">
        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full">🌙</div>
        <Story />
      </div>
    ),
  ],
  args: {
    message: 'Entrar com sua conta',
    isSignOut: false,
  },
};

export const MobileWithThemeToggle: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    Story => (
      <div className="flex items-center gap-2 bg-gray-100 p-4">
        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full">🌙</div>
        <Story />
      </div>
    ),
  ],
  args: {
    message: 'Entrar com sua conta da Wikimedia',
    isSignOut: false,
  },
};
