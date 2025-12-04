import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { SnackbarProvider, useSnackbar } from '@/app/providers/SnackbarProvider';

// Mock organization data
const createMockOrganizationData = () => ({
  email: 'test@organization.com',
  meta_page: 'https://meta.wikimedia.org/wiki/User:TestOrg',
  website: 'https://testorg.com',
  documents: [
    { id: 1, url: 'https://commons.wikimedia.org/wiki/File:Doc1.pdf' },
    { id: 0, url: 'https://commons.wikimedia.org/wiki/File:NewDoc.pdf' },
  ],
  projects: [
    { id: 1, display_name: 'Existing Project', url: 'https://project1.com' },
    { id: 0, display_name: 'New Project', url: 'https://newproject.com' },
  ],
  events: [
    { id: 1, title: 'Conference 2024', date: '2024-12-01' },
    { id: 0, title: 'New Workshop', date: '2024-12-15' },
  ],
  news: [
    { id: 1, tag: 'Community Update' },
    { id: 0, tag: 'Breaking News' },
  ],
  known_capacities: [1, 2, 3],
  available_capacities: [4, 5],
  wanted_capacities: [6, 7],
});

// Translation map for error messages
const ERROR_TRANSLATIONS: Record<string, string> = {
  'snackbar-edit-profile-organization-error': 'Error updating organization profile',
  'snackbar-invalid-document-url': 'Invalid document URL format',
};

// Component failure error messages
const COMPONENT_ERRORS: Record<string, string> = {
  contacts: 'Invalid email format in contacts',
  documents: 'snackbar-invalid-document-url',
  projects: 'Project name cannot be empty',
  capacities: 'Capacity cannot be in both known and available lists',
};

// General error messages by type
const ERROR_TYPE_MESSAGES: Record<string, string> = {
  validation: 'Validation error: Required fields are missing',
  translation: 'snackbar-edit-profile-organization-error',
  document: 'Document creation failed',
  project: 'Project creation failed',
};

type ComponentFailureType =
  | 'contacts'
  | 'documents'
  | 'projects'
  | 'events'
  | 'news'
  | 'capacities';
type ErrorType = 'general' | 'validation' | 'translation' | 'document' | 'project' | 'capacity';

interface OrganizationFormProps {
  shouldFail?: boolean;
  errorType?: ErrorType;
  componentFailure?: ComponentFailureType | null;
}

// Helper to check if error is a component-specific failure
function checkComponentFailure(componentFailure: ComponentFailureType | null, shouldFail: boolean) {
  if (!shouldFail || !componentFailure) {
    return null;
  }

  const errorMessage = COMPONENT_ERRORS[componentFailure];
  if (errorMessage) {
    throw new Error(errorMessage);
  }
  return null;
}

// Helper to check if error is a general failure type
function checkGeneralFailure(errorType: ErrorType, shouldFail: boolean) {
  if (!shouldFail) {
    return;
  }

  const errorMessage = ERROR_TYPE_MESSAGES[errorType] || 'Organization update failed';
  throw new Error(errorMessage);
}

// Helper to process new items (documents, projects, events)
function processNewItems(items: Array<{ id: number }>, itemType: string) {
  const newItems = items.filter(item => item.id === 0);
  if (newItems.length > 0) {
    console.log(`Creating new ${itemType}:`, newItems);
  }
}

// Helper to translate error messages
function translateErrorMessage(errorMessage: string): string {
  if (errorMessage.startsWith('snackbar-')) {
    return ERROR_TRANSLATIONS[errorMessage] || 'Translation error';
  }
  return errorMessage;
}

describe('Organization Profile Form Submission', () => {
  const OrganizationFormComponent = ({
    shouldFail = false,
    errorType = 'general',
    componentFailure = null,
  }: OrganizationFormProps) => {
    const { showSnackbar } = useSnackbar();
    const mockOrganizationData = createMockOrganizationData();

    const handleSubmit = async () => {
      try {
        checkComponentFailure(componentFailure, shouldFail);
        checkGeneralFailure(errorType, shouldFail);

        await new Promise(resolve => setTimeout(resolve, 100));

        processNewItems(mockOrganizationData.documents, 'documents');
        processNewItems(mockOrganizationData.projects, 'projects');
        processNewItems(mockOrganizationData.events, 'events');

        showSnackbar('Organization profile updated successfully!', 'success');
      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';
        const translatedMessage = translateErrorMessage(errorMessage);
        showSnackbar(translatedMessage, 'error');
      }
    };

    return (
      <div data-testid="organization-form">
        <div data-testid="contacts-section">
          <h3>Contacts</h3>
          <input type="email" value={mockOrganizationData.email} placeholder="Email" readOnly />
          <input
            type="url"
            value={mockOrganizationData.meta_page}
            placeholder="Meta Page"
            readOnly
          />
          <input type="url" value={mockOrganizationData.website} placeholder="Website" readOnly />
        </div>

        <div data-testid="documents-section">
          <h3>Documents ({mockOrganizationData.documents.length})</h3>
          {mockOrganizationData.documents.map((doc, index) => (
            <input key={index} type="url" value={doc.url} placeholder="Document URL" readOnly />
          ))}
        </div>

        <div data-testid="projects-section">
          <h3>Projects ({mockOrganizationData.projects.length})</h3>
          {mockOrganizationData.projects.map((project, index) => (
            <div key={index}>
              <input type="text" value={project.display_name} placeholder="Project Name" readOnly />
              <input type="url" value={project.url} placeholder="Project URL" readOnly />
            </div>
          ))}
        </div>

        <div data-testid="events-section">
          <h3>Events ({mockOrganizationData.events.length})</h3>
          {mockOrganizationData.events.map((event, index) => (
            <div key={index}>
              <input type="text" value={event.title} placeholder="Event Title" readOnly />
              <input type="date" value={event.date} readOnly />
            </div>
          ))}
        </div>

        <div data-testid="news-section">
          <h3>News ({mockOrganizationData.news.length})</h3>
          {mockOrganizationData.news.map((news, index) => (
            <input key={index} type="text" value={news.tag} placeholder="News Tag" readOnly />
          ))}
        </div>

        <div data-testid="capacities-section">
          <h3>Capacities</h3>
          <div>Known: {mockOrganizationData.known_capacities.join(', ')}</div>
          <div>Available: {mockOrganizationData.available_capacities.join(', ')}</div>
          <div>Wanted: {mockOrganizationData.wanted_capacities.join(', ')}</div>
        </div>

        <button onClick={handleSubmit} data-testid="submit-button">
          Save Organization Profile
        </button>
      </div>
    );
  };

  const renderWithSnackbar = (component: React.ReactNode) => {
    return render(<SnackbarProvider>{component}</SnackbarProvider>);
  };

  it('shows success snackbar when organization profile is saved successfully', async () => {
    renderWithSnackbar(<OrganizationFormComponent />);

    expect(screen.getByTestId('contacts-section')).toBeInTheDocument();
    expect(screen.getByTestId('documents-section')).toBeInTheDocument();
    expect(screen.getByTestId('projects-section')).toBeInTheDocument();
    expect(screen.getByTestId('events-section')).toBeInTheDocument();
    expect(screen.getByTestId('news-section')).toBeInTheDocument();
    expect(screen.getByTestId('capacities-section')).toBeInTheDocument();

    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Organization profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('shows error snackbar when organization profile save fails', async () => {
    renderWithSnackbar(<OrganizationFormComponent shouldFail={true} />);

    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Organization update failed')).toBeInTheDocument();
    });
  });

  it('shows specific error for contacts validation failure', async () => {
    renderWithSnackbar(<OrganizationFormComponent shouldFail={true} componentFailure="contacts" />);

    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid email format in contacts')).toBeInTheDocument();
    });
  });

  it('shows specific error for document validation failure', async () => {
    renderWithSnackbar(
      <OrganizationFormComponent shouldFail={true} componentFailure="documents" />
    );

    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid document URL format')).toBeInTheDocument();
    });
  });

  it('shows specific error for projects validation failure', async () => {
    renderWithSnackbar(<OrganizationFormComponent shouldFail={true} componentFailure="projects" />);

    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Project name cannot be empty')).toBeInTheDocument();
    });
  });

  it('shows specific error for capacities validation failure', async () => {
    renderWithSnackbar(
      <OrganizationFormComponent shouldFail={true} componentFailure="capacities" />
    );

    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(
        screen.getByText('Capacity cannot be in both known and available lists')
      ).toBeInTheDocument();
    });
  });

  it('shows translated error message for backend translation keys', async () => {
    renderWithSnackbar(<OrganizationFormComponent shouldFail={true} errorType="translation" />);

    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Error updating organization profile')).toBeInTheDocument();
    });
  });

  it('handles document creation failures', async () => {
    renderWithSnackbar(<OrganizationFormComponent shouldFail={true} errorType="document" />);

    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Document creation failed')).toBeInTheDocument();
    });
  });

  it('handles project creation failures', async () => {
    renderWithSnackbar(<OrganizationFormComponent shouldFail={true} errorType="project" />);

    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Project creation failed')).toBeInTheDocument();
    });
  });

  it('renders all organization form sections correctly', async () => {
    renderWithSnackbar(<OrganizationFormComponent />);

    expect(screen.getByDisplayValue('test@organization.com')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('https://meta.wikimedia.org/wiki/User:TestOrg')
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://testorg.com')).toBeInTheDocument();

    expect(screen.getByText('Documents (2)')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('https://commons.wikimedia.org/wiki/File:Doc1.pdf')
    ).toBeInTheDocument();

    expect(screen.getByText('Projects (2)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New Project')).toBeInTheDocument();

    expect(screen.getByText('Events (2)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Conference 2024')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New Workshop')).toBeInTheDocument();

    expect(screen.getByText('News (2)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Community Update')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Breaking News')).toBeInTheDocument();

    expect(screen.getByText('Known: 1, 2, 3')).toBeInTheDocument();
    expect(screen.getByText('Available: 4, 5')).toBeInTheDocument();
    expect(screen.getByText('Wanted: 6, 7')).toBeInTheDocument();
  });

  it('displays snackbar messages with correct content', async () => {
    renderWithSnackbar(<OrganizationFormComponent />);
    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      const successMessage = screen.getByText('Organization profile updated successfully!');
      expect(successMessage).toBeInTheDocument();
      expect(successMessage.parentElement).toBeTruthy();
    });
  });

  it('auto-hides snackbar messages after timeout', async () => {
    jest.useFakeTimers();

    renderWithSnackbar(<OrganizationFormComponent />);
    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Organization profile updated successfully!')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(
        screen.queryByText('Organization profile updated successfully!')
      ).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
