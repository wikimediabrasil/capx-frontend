import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { SnackbarProvider, useSnackbar } from '@/app/providers/SnackbarProvider';

describe('Organization Profile Form Submission', () => {
  // Comprehensive form component that simulates organization profile editing
  const OrganizationFormComponent = ({
    shouldFail = false,
    errorType = 'general',
    componentFailure = null,
  }: {
    shouldFail?: boolean;
    errorType?: 'general' | 'validation' | 'translation' | 'document' | 'project' | 'capacity';
    componentFailure?:
      | 'contacts'
      | 'documents'
      | 'projects'
      | 'events'
      | 'news'
      | 'capacities'
      | null;
  }) => {
    const { showSnackbar } = useSnackbar();

    const mockOrganizationData = {
      // Contacts
      email: 'test@organization.com',
      meta_page: 'https://meta.wikimedia.org/wiki/User:TestOrg',
      website: 'https://testorg.com',

      // Documents
      documents: [
        { id: 1, url: 'https://commons.wikimedia.org/wiki/File:Doc1.pdf' },
        { id: 0, url: 'https://commons.wikimedia.org/wiki/File:NewDoc.pdf' }, // New document
      ],

      // Projects
      projects: [
        { id: 1, display_name: 'Existing Project', url: 'https://project1.com' },
        { id: 0, display_name: 'New Project', url: 'https://newproject.com' }, // New project
      ],

      // Events
      events: [
        { id: 1, title: 'Conference 2024', date: '2024-12-01' },
        { id: 0, title: 'New Workshop', date: '2024-12-15' }, // New event
      ],

      // News/Tags
      news: [
        { id: 1, tag: 'Community Update' },
        { id: 0, tag: 'Breaking News' }, // New tag
      ],

      // Capacities
      known_capacities: [1, 2, 3],
      available_capacities: [4, 5],
      wanted_capacities: [6, 7],
    };

    const handleSubmit = async () => {
      try {
        // Simulate component-specific failures
        if (componentFailure === 'contacts' && shouldFail) {
          throw new Error('Invalid email format in contacts');
        }

        if (componentFailure === 'documents' && shouldFail) {
          throw new Error('snackbar-invalid-document-url');
        }

        if (componentFailure === 'projects' && shouldFail) {
          throw new Error('Project name cannot be empty');
        }

        if (componentFailure === 'capacities' && shouldFail) {
          throw new Error('Capacity cannot be in both known and available lists');
        }

        // General failure types
        if (shouldFail) {
          if (errorType === 'validation') {
            throw new Error('Validation error: Required fields are missing');
          } else if (errorType === 'translation') {
            throw new Error('snackbar-edit-profile-organization-error');
          } else if (errorType === 'document') {
            throw new Error('Document creation failed');
          } else if (errorType === 'project') {
            throw new Error('Project creation failed');
          } else {
            throw new Error('Organization update failed');
          }
        }

        // Simulate successful form processing
        await new Promise(resolve => setTimeout(resolve, 100));

        // Simulate creating new documents
        const newDocuments = mockOrganizationData.documents.filter(doc => doc.id === 0);
        if (newDocuments.length > 0) {
          console.log('Creating new documents:', newDocuments);
        }

        // Simulate creating new projects
        const newProjects = mockOrganizationData.projects.filter(project => project.id === 0);
        if (newProjects.length > 0) {
          console.log('Creating new projects:', newProjects);
        }

        // Simulate creating new events
        const newEvents = mockOrganizationData.events.filter(event => event.id === 0);
        if (newEvents.length > 0) {
          console.log('Creating new events:', newEvents);
        }

        showSnackbar('Organization profile updated successfully!', 'success');
      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';

        // Check if it's a translation key
        if (errorMessage.startsWith('snackbar-')) {
          const translatedMessages: Record<string, string> = {
            'snackbar-edit-profile-organization-error': 'Error updating organization profile',
            'snackbar-invalid-document-url': 'Invalid document URL format',
          };
          const translatedMessage = translatedMessages[errorMessage] || 'Translation error';
          showSnackbar(translatedMessage, 'error');
        } else {
          showSnackbar(errorMessage, 'error');
        }
      }
    };

    return (
      <div data-testid="organization-form">
        {/* Contacts Section */}
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

        {/* Documents Section */}
        <div data-testid="documents-section">
          <h3>Documents ({mockOrganizationData.documents.length})</h3>
          {mockOrganizationData.documents.map((doc, index) => (
            <input key={index} type="url" value={doc.url} placeholder="Document URL" readOnly />
          ))}
        </div>

        {/* Projects Section */}
        <div data-testid="projects-section">
          <h3>Projects ({mockOrganizationData.projects.length})</h3>
          {mockOrganizationData.projects.map((project, index) => (
            <div key={index}>
              <input type="text" value={project.display_name} placeholder="Project Name" readOnly />
              <input type="url" value={project.url} placeholder="Project URL" readOnly />
            </div>
          ))}
        </div>

        {/* Events Section */}
        <div data-testid="events-section">
          <h3>Events ({mockOrganizationData.events.length})</h3>
          {mockOrganizationData.events.map((event, index) => (
            <div key={index}>
              <input type="text" value={event.title} placeholder="Event Title" readOnly />
              <input type="date" value={event.date} readOnly />
            </div>
          ))}
        </div>

        {/* News Section */}
        <div data-testid="news-section">
          <h3>News ({mockOrganizationData.news.length})</h3>
          {mockOrganizationData.news.map((news, index) => (
            <input key={index} type="text" value={news.tag} placeholder="News Tag" readOnly />
          ))}
        </div>

        {/* Capacities Section */}
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

    // Verify all sections are rendered
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

    // Contacts section
    expect(screen.getByDisplayValue('test@organization.com')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('https://meta.wikimedia.org/wiki/User:TestOrg')
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://testorg.com')).toBeInTheDocument();

    // Documents section
    expect(screen.getByText('Documents (2)')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('https://commons.wikimedia.org/wiki/File:Doc1.pdf')
    ).toBeInTheDocument();

    // Projects section
    expect(screen.getByText('Projects (2)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New Project')).toBeInTheDocument();

    // Events section
    expect(screen.getByText('Events (2)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Conference 2024')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New Workshop')).toBeInTheDocument();

    // News section
    expect(screen.getByText('News (2)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Community Update')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Breaking News')).toBeInTheDocument();

    // Capacities section
    expect(screen.getByText('Known: 1, 2, 3')).toBeInTheDocument();
    expect(screen.getByText('Available: 4, 5')).toBeInTheDocument();
    expect(screen.getByText('Wanted: 6, 7')).toBeInTheDocument();
  });

  it('displays snackbar messages with correct content', async () => {
    // Test success message
    renderWithSnackbar(<OrganizationFormComponent />);
    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      const successMessage = screen.getByText('Organization profile updated successfully!');
      expect(successMessage).toBeInTheDocument();
      // Just verify the snackbar container exists
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

    // Fast-forward time by 3 seconds
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
