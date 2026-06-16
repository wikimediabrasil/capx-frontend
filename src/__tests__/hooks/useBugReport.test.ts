jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/services/bugReportService', () => ({
  BugReportService: {
    submitReport: jest.fn(),
  },
}));

import { renderHook, act } from '@testing-library/react';
import { useBugReport, ReportType } from '@/hooks/useBugReport';
import { useSession } from 'next-auth/react';
import { BugReportService } from '@/services/bugReportService';

const mockUseSession = useSession as jest.Mock;
const mockSubmitReport = BugReportService.submitReport as jest.Mock;

function setupHook() {
  return renderHook(() => useBugReport());
}

async function submitWith(result: any, report = { title: 'Test' }) {
  let response: any;
  await act(async () => {
    response = await result.current.submitBugReport(report);
  });
  return response;
}

describe('useBugReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { token: 'test-token' } },
      status: 'authenticated',
    });
  });

  it('returns initial state correctly', () => {
    const { result } = setupHook();

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.showTypeSelector).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.submitBugReport).toBe('function');
    expect(typeof result.current.setShowTypeSelector).toBe('function');
  });

  it('setShowTypeSelector toggles the value', () => {
    const { result } = setupHook();

    act(() => {
      result.current.setShowTypeSelector(true);
    });
    expect(result.current.showTypeSelector).toBe(true);

    act(() => {
      result.current.setShowTypeSelector(false);
    });
    expect(result.current.showTypeSelector).toBe(false);
  });

  it('sets isSubmitting to true during submission and false after', async () => {
    mockSubmitReport.mockResolvedValue({ id: 1, title: 'Bug Report' });
    const { result } = setupHook();

    let submissionPromise: Promise<any>;
    act(() => {
      submissionPromise = result.current.submitBugReport({ title: 'Test Bug' });
    });
    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      await submissionPromise;
    });
    expect(result.current.isSubmitting).toBe(false);
  });

  it('calls BugReportService.submitReport with correct args', async () => {
    mockSubmitReport.mockResolvedValue({ id: 42, title: 'Bug Report' });
    const { result } = setupHook();
    const bugReport = {
      title: 'Something broken',
      description: 'It is broken',
      type: ReportType.ERROR,
    };

    await submitWith(result, bugReport);

    expect(mockSubmitReport).toHaveBeenCalledWith({ bugReport, token: 'test-token' });
  });

  it('uses empty string token when no session', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    mockSubmitReport.mockResolvedValue({ id: 1 });
    const { result } = setupHook();

    await submitWith(result);

    expect(mockSubmitReport).toHaveBeenCalledWith(expect.objectContaining({ token: '' }));
  });

  it('returns response on successful submission', async () => {
    const mockResponse = { id: 10, title: 'Bug Report', type: ReportType.ERROR };
    mockSubmitReport.mockResolvedValue(mockResponse);
    const { result } = setupHook();

    const response = await submitWith(result);

    expect(response).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
  });

  it.each([
    ['response has no id', { message: 'no id here' }, 'Invalid project response from server'],
    ['service fails', null, 'Network failure'],
  ])('throws and sets error when %s', async (_label, resolvedValue, errorMsg) => {
    if (resolvedValue) {
      mockSubmitReport.mockResolvedValue(resolvedValue);
    } else {
      mockSubmitReport.mockRejectedValue(new Error(errorMsg));
    }
    const { result } = setupHook();

    await act(async () => {
      await expect(result.current.submitBugReport({ title: 'Test' })).rejects.toThrow(errorMsg);
    });

    expect(result.current.error).toBe(errorMsg);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('resets isSubmitting to false even after error', async () => {
    mockSubmitReport.mockRejectedValue(new Error('Server error'));
    const { result } = setupHook();

    await act(async () => {
      try {
        await result.current.submitBugReport({ title: 'Test' });
      } catch {
        /* expected */
      }
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it('ReportType enum has correct values', () => {
    expect(ReportType.ERROR).toBe('error');
    expect(ReportType.FEATURE).toBe('new_feature');
    expect(ReportType.IMPROVEMENT).toBe('improvement');
    expect(ReportType.TEST_CASE).toBe('test_case');
  });
});
