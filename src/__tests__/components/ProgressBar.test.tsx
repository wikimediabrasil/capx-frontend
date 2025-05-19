import { render, screen } from '@testing-library/react';
import ProgressBar from '@/components/ProgressBar';

describe('ProgressBar', () => {
  it('renders progress bar with correct percentage', () => {
    render(<ProgressBar progress={75} darkMode={false} />);
    
    const progressBar = screen.getByText('75%');
    expect(progressBar).toBeInTheDocument();
  });

  it('applies dark mode styles when darkMode is true', () => {
    render(<ProgressBar progress={50} darkMode={true} />);
    
    const progressText = screen.getByText('50%');
    expect(progressText).toHaveClass('text-white');
  });

  it('updates progress bar width based on progress value', () => {
    const { container } = render(<ProgressBar progress={60} darkMode={false} />);
    
    const progressBarFill = container.querySelector('.bg-green-500');
    expect(progressBarFill).toHaveStyle({ width: '60%' });
  });
});
