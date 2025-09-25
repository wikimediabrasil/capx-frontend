import { render, screen, fireEvent, act } from '@testing-library/react';
import ProjectFormItem from '@/app/(auth)/organization_profile/components/ProjectsFormItem';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import * as ThemeContext from '@/contexts/ThemeContext';
import * as AppContext from '@/contexts/AppContext';

// Mock contexts
jest.mock('@/contexts/AppContext', () => ({
  ...jest.requireActual('@/contexts/AppContext'),
  useApp: jest.fn(),
}));

jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, width, height, ...props }: any) => (
    <img src={src} alt={alt} className={className} width={width} height={height} {...props} />
  ),
}));

describe('ProjectFormItem', () => {
  const mockUseApp = AppContext.useApp as jest.MockedFunction<typeof AppContext.useApp>;
  const mockUseTheme = ThemeContext.useTheme as jest.MockedFunction<typeof ThemeContext.useTheme>;

  const mockPageContent = {
    'organization-profile-project-name': 'Project Name',
    'organization-profile-project-image-url': 'Project Image URL',
    'organization-profile-project-url': 'Project URL',
    'organization-profile-project-description': 'Project Description',
  };

  const mockProject = {
    id: 1,
    display_name: 'Test Project',
    profile_image: 'https://example.com/image.png',
    url: 'https://example.com/project',
    organization: 1,
    creation_date: '2023-01-01T00:00:00Z',
    creator: 1,
    related_skills: [],
  };

  const mockProps = {
    project: mockProject,
    index: 0,
    onDelete: jest.fn(),
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseApp.mockReturnValue({
      isMobile: false,
      pageContent: mockPageContent,
      language: 'en',
      mobileMenuStatus: false,
      setMobileMenuStatus: jest.fn(),
      setLanguage: jest.fn(),
      setPageContent: jest.fn(),
      session: null,
      setSession: jest.fn(),
    });

    mockUseTheme.mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <AppProvider>{component}</AppProvider>
      </ThemeProvider>
    );
  };

  it('renders project form item with all inputs', () => {
    renderWithProviders(<ProjectFormItem {...mockProps} />);

    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/image.png')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/project')).toBeInTheDocument();
  });

  it('calls onChange when project name is modified', () => {
    renderWithProviders(<ProjectFormItem {...mockProps} />);

    const nameInput = screen.getByDisplayValue('Test Project');

    act(() => {
      fireEvent.change(nameInput, { target: { value: 'Updated Project' } });
    });

    expect(mockProps.onChange).toHaveBeenCalledWith(0, 'display_name', 'Updated Project');
  });

  it('calls onChange when project image URL is modified', () => {
    renderWithProviders(<ProjectFormItem {...mockProps} />);

    const imageInput = screen.getByDisplayValue('https://example.com/image.png');

    act(() => {
      fireEvent.change(imageInput, { target: { value: 'https://newimage.com/image.jpg' } });
    });

    expect(mockProps.onChange).toHaveBeenCalledWith(
      0,
      'profile_image',
      'https://newimage.com/image.jpg'
    );
  });

  it('calls onChange when project URL is modified', () => {
    renderWithProviders(<ProjectFormItem {...mockProps} />);

    const urlInput = screen.getByDisplayValue('https://example.com/project');

    act(() => {
      fireEvent.change(urlInput, { target: { value: 'https://newproject.com' } });
    });

    expect(mockProps.onChange).toHaveBeenCalledWith(0, 'url', 'https://newproject.com');
  });

  it('calls onDelete when delete button is clicked', () => {
    renderWithProviders(<ProjectFormItem {...mockProps} />);

    const deleteButton = screen.getByRole('button');

    act(() => {
      fireEvent.click(deleteButton);
    });

    expect(mockProps.onDelete).toHaveBeenCalledWith(1); // Should be called with project.id
  });

  it('renders correct placeholder texts', () => {
    const emptyProject = {
      ...mockProject,
      display_name: '',
      profile_image: '',
      url: '',
    };

    renderWithProviders(<ProjectFormItem {...mockProps} project={emptyProject} />);

    expect(screen.getByPlaceholderText('Project Name')).toBeInTheDocument();
  });

  it('renders delete icon correctly', () => {
    renderWithProviders(<ProjectFormItem {...mockProps} />);

    const deleteIcon = screen.getByAltText('Delete icon');
    expect(deleteIcon).toBeInTheDocument();
  });

  it('renders project image and link icons', () => {
    renderWithProviders(<ProjectFormItem {...mockProps} />);

    expect(screen.getByAltText('Project image icon')).toBeInTheDocument();
    expect(screen.getByAltText('Add link icon')).toBeInTheDocument();
  });

  it('applies dark mode styling', () => {
    mockUseTheme.mockReturnValue({
      darkMode: true,
      setDarkMode: jest.fn(),
    });

    renderWithProviders(<ProjectFormItem {...mockProps} />);

    const nameInput = screen.getByDisplayValue('Test Project');
    expect(nameInput).toHaveClass('text-white', 'placeholder-gray-400');
  });

  it('applies light mode styling', () => {
    renderWithProviders(<ProjectFormItem {...mockProps} />);

    const nameInput = screen.getByDisplayValue('Test Project');
    expect(nameInput).toHaveClass('text-[#829BA4]', 'placeholder-[#829BA4]');
  });

  describe('mobile view', () => {
    beforeEach(() => {
      mockUseApp.mockReturnValue({
        ...mockUseApp(),
        isMobile: true,
      });
    });

    it('renders mobile layout correctly', () => {
      renderWithProviders(<ProjectFormItem {...mockProps} />);

      const nameInput = screen.getByDisplayValue('Test Project');
      expect(nameInput).toHaveClass('text-[12px]');
    });

    it('shows correct icon sizes in mobile', () => {
      renderWithProviders(<ProjectFormItem {...mockProps} />);

      const imageIcon = screen.getByAltText('Project image icon');
      expect(imageIcon).toHaveAttribute('width', '24');
      expect(imageIcon).toHaveAttribute('height', '24');
    });
  });

  describe('desktop view', () => {
    it('renders desktop layout correctly', () => {
      renderWithProviders(<ProjectFormItem {...mockProps} />);

      const nameInput = screen.getByDisplayValue('Test Project');
      expect(nameInput).toBeInTheDocument();
      // Desktop version doesn't have explicit text-[24px] class in the name input
      expect(nameInput).toHaveClass('w-full', 'bg-transparent');
    });

    it('shows correct icon sizes in desktop', () => {
      renderWithProviders(<ProjectFormItem {...mockProps} />);

      const deleteIcon = screen.getByAltText('Delete icon');
      expect(deleteIcon).toHaveAttribute('width', '32');
      expect(deleteIcon).toHaveAttribute('height', '32');
    });
  });

  it('handles empty project fields', () => {
    const emptyProject = {
      ...mockProject,
      display_name: '',
      profile_image: '',
      url: '',
    };

    renderWithProviders(<ProjectFormItem {...mockProps} project={emptyProject} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveValue('');
    });
  });

  it('handles null project fields', () => {
    const nullProject = {
      ...mockProject,
      display_name: null,
      profile_image: null,
      url: null,
    };

    renderWithProviders(<ProjectFormItem {...mockProps} project={nullProject} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveValue('');
    });
  });

  it('uses dark mode delete icon when dark mode is enabled', () => {
    mockUseTheme.mockReturnValue({
      darkMode: true,
      setDarkMode: jest.fn(),
    });

    renderWithProviders(<ProjectFormItem {...mockProps} />);

    const deleteIcon = screen.getByAltText('Delete icon');
    expect(deleteIcon).toBeInTheDocument();
  });

  it('has proper input styling', () => {
    renderWithProviders(<ProjectFormItem {...mockProps} />);

    const nameInput = screen.getByDisplayValue('Test Project');
    expect(nameInput).toHaveClass('w-full', 'bg-transparent', 'border-none', 'outline-none');
  });

  it('has proper container layout', () => {
    renderWithProviders(<ProjectFormItem {...mockProps} />);

    // Check that the main container has proper flex layout
    const nameInput = screen.getByDisplayValue('Test Project');
    const container = nameInput.closest('.flex.flex-row.gap-2');
    expect(container).toBeInTheDocument();
  });

  it('maintains field values after re-render', () => {
    const { rerender } = renderWithProviders(<ProjectFormItem {...mockProps} />);

    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/image.png')).toBeInTheDocument();

    const updatedProject = {
      ...mockProject,
      display_name: 'Updated Project',
      profile_image: 'https://updated-image.com/image.jpg',
    };
    const updatedProps = { ...mockProps, project: updatedProject };

    rerender(
      <ThemeProvider>
        <AppProvider>
          <ProjectFormItem {...updatedProps} />
        </AppProvider>
      </ThemeProvider>
    );

    expect(screen.getByDisplayValue('Updated Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://updated-image.com/image.jpg')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Test Project')).not.toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
