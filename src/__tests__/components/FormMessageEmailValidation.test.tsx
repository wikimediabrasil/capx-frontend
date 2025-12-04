import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MessageService } from '@/services/messageService';
import { useSession } from 'next-auth/react';

// Mock dependencies
jest.mock('@/services/messageService');
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

const mockedMessageService = MessageService as jest.Mocked<typeof MessageService>;
const mockedUseSession = useSession as jest.MockedFunction<typeof useSession>;

interface EmailStatus {
  sender_emailable: boolean;
  receiver_emailable: boolean;
  can_send_email: boolean;
}

interface EmailValidationProps {
  receiverUsername: string;
  senderUsername: string;
  token: string;
}

// Test component that simulates the email validation logic
const EmailValidationComponent = ({
  receiverUsername,
  senderUsername,
  token,
}: EmailValidationProps) => {
  const [emailStatus, setEmailStatus] = React.useState<EmailStatus | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkEmail = async () => {
      if (!receiverUsername || receiverUsername.length < 3) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await MessageService.checkEmailable(receiverUsername, token, senderUsername);
        setEmailStatus(result);
      } catch (err) {
        setError('Failed to check email');
      } finally {
        setLoading(false);
      }
    };

    checkEmail();
  }, [receiverUsername, senderUsername, token]);

  return (
    <div>
      {loading && <div data-testid="loading">Checking email...</div>}
      {error && <div data-testid="error">{error}</div>}
      {emailStatus && (
        <div data-testid="email-status">
          <div data-testid="sender-status">
            Sender: {emailStatus.sender_emailable ? 'Available' : 'Unavailable'}
          </div>
          <div data-testid="receiver-status">
            Receiver: {emailStatus.receiver_emailable ? 'Available' : 'Unavailable'}
          </div>
          <div data-testid="can-send">Can send: {emailStatus.can_send_email ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

// Helper function to get email error message
function getEmailErrorMessage(emailCheck: EmailStatus): string {
  if (!emailCheck.sender_emailable && !emailCheck.receiver_emailable) {
    return 'Neither you nor the receiver have email enabled';
  }
  if (!emailCheck.sender_emailable) {
    return 'You do not have email enabled';
  }
  if (!emailCheck.receiver_emailable) {
    return 'The receiver does not accept emails';
  }
  return '';
}

// Helper to create mock email status
function createMockEmailStatus(
  senderEmailable: boolean,
  receiverEmailable: boolean,
  canSendEmail: boolean
): EmailStatus {
  return {
    sender_emailable: senderEmailable,
    receiver_emailable: receiverEmailable,
    can_send_email: canSendEmail,
  };
}

// Helper to render component with default props
function renderEmailValidation(overrides?: Partial<EmailValidationProps>) {
  const defaultProps: EmailValidationProps = {
    receiverUsername: 'TestReceiver',
    senderUsername: 'TestSender',
    token: 'test-token',
  };

  return render(<EmailValidationComponent {...defaultProps} {...overrides} />);
}

describe('FormMessage Email Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSession.mockReturnValue({
      data: {
        user: {
          name: 'TestSender',
          token: 'test-token',
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    } as any);
  });

  describe('Email availability checking', () => {
    it('should show loading state while checking email', async () => {
      const delayedResponse = new Promise<EmailStatus>(resolve => {
        const mockStatus = createMockEmailStatus(true, true, true);
        setTimeout(() => resolve(mockStatus), 100);
      });
      mockedMessageService.checkEmailable.mockImplementation(() => delayedResponse);

      renderEmailValidation();

      expect(screen.getByTestId('loading')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('should display available status when both users have email', async () => {
      mockedMessageService.checkEmailable.mockResolvedValueOnce(
        createMockEmailStatus(true, true, true)
      );

      renderEmailValidation();

      await waitFor(() => {
        expect(screen.getByTestId('sender-status')).toHaveTextContent('Sender: Available');
        expect(screen.getByTestId('receiver-status')).toHaveTextContent('Receiver: Available');
        expect(screen.getByTestId('can-send')).toHaveTextContent('Can send: Yes');
      });
    });

    it('should display unavailable when sender does not have email', async () => {
      mockedMessageService.checkEmailable.mockResolvedValueOnce(
        createMockEmailStatus(false, true, false)
      );

      renderEmailValidation();

      await waitFor(() => {
        expect(screen.getByTestId('sender-status')).toHaveTextContent('Sender: Unavailable');
        expect(screen.getByTestId('receiver-status')).toHaveTextContent('Receiver: Available');
        expect(screen.getByTestId('can-send')).toHaveTextContent('Can send: No');
      });
    });

    it('should display unavailable when receiver does not have email', async () => {
      mockedMessageService.checkEmailable.mockResolvedValueOnce(
        createMockEmailStatus(true, false, false)
      );

      renderEmailValidation();

      await waitFor(() => {
        expect(screen.getByTestId('sender-status')).toHaveTextContent('Sender: Available');
        expect(screen.getByTestId('receiver-status')).toHaveTextContent('Receiver: Unavailable');
        expect(screen.getByTestId('can-send')).toHaveTextContent('Can send: No');
      });
    });

    it('should display unavailable when both do not have email', async () => {
      mockedMessageService.checkEmailable.mockResolvedValueOnce(
        createMockEmailStatus(false, false, false)
      );

      renderEmailValidation();

      await waitFor(() => {
        expect(screen.getByTestId('sender-status')).toHaveTextContent('Sender: Unavailable');
        expect(screen.getByTestId('receiver-status')).toHaveTextContent('Receiver: Unavailable');
        expect(screen.getByTestId('can-send')).toHaveTextContent('Can send: No');
      });
    });

    it('should handle API errors gracefully', async () => {
      mockedMessageService.checkEmailable.mockRejectedValueOnce(new Error('Network error'));

      renderEmailValidation();

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to check email');
      });
    });

    it('should not check email for usernames shorter than 3 characters', async () => {
      renderEmailValidation({ receiverUsername: 'AB' });

      await waitFor(() => {
        expect(mockedMessageService.checkEmailable).not.toHaveBeenCalled();
      });
    });

    it('should pass sender username to API', async () => {
      mockedMessageService.checkEmailable.mockResolvedValueOnce(
        createMockEmailStatus(true, true, true)
      );

      renderEmailValidation();

      await waitFor(() => {
        expect(mockedMessageService.checkEmailable).toHaveBeenCalledWith(
          'TestReceiver',
          'test-token',
          'TestSender'
        );
      });
    });
  });

  describe('Error messages', () => {
    it('should generate correct message when sender has no email', () => {
      const emailCheck = createMockEmailStatus(false, true, false);
      expect(getEmailErrorMessage(emailCheck)).toBe('You do not have email enabled');
    });

    it('should generate correct message when receiver has no email', () => {
      const emailCheck = createMockEmailStatus(true, false, false);
      expect(getEmailErrorMessage(emailCheck)).toBe('The receiver does not accept emails');
    });

    it('should generate correct message when both have no email', () => {
      const emailCheck = createMockEmailStatus(false, false, false);
      expect(getEmailErrorMessage(emailCheck)).toBe(
        'Neither you nor the receiver have email enabled'
      );
    });
  });
});
