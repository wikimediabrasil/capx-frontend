import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SearchableSelect, normalizeSearchText } from '@/components/SearchableSelect';

jest.mock('@/stores', () => ({
  useDarkMode: jest.fn(() => false),
  usePageContent: jest.fn(() => ({
    'searchable-select-no-results': 'No results found',
    'edit-profile-insert-item': 'Insert item',
  })),
}));

const options = [
  { id: '3', name: 'Wikimedia Brasil' },
  { id: '1', name: 'Wikimedia Deutschland' },
  { id: '2', name: 'Grupo de Usuários Wikimedia São Paulo' },
];

const renderSelect = (props: Partial<React.ComponentProps<typeof SearchableSelect>> = {}) => {
  const onSelect = jest.fn();
  render(
    <SearchableSelect
      options={options}
      onSelect={onSelect}
      placeholder="Add affiliation"
      {...props}
    />
  );
  return { onSelect, input: screen.getByRole('combobox') };
};

const optionNames = () => screen.queryAllByRole('option').map(option => option.textContent);

describe('SearchableSelect', () => {
  it('keeps the list closed until the input is focused', () => {
    const { input } = renderSelect();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('lists options in alphabetical order', () => {
    const { input } = renderSelect();
    fireEvent.focus(input);

    expect(optionNames()).toEqual([
      'Grupo de Usuários Wikimedia São Paulo',
      'Wikimedia Brasil',
      'Wikimedia Deutschland',
    ]);
  });

  it('filters ignoring case and accents', () => {
    const { input } = renderSelect();
    fireEvent.change(input, { target: { value: 'SAO paulo' } });

    expect(optionNames()).toEqual(['Grupo de Usuários Wikimedia São Paulo']);
  });

  it('hides excluded ids', () => {
    const { input } = renderSelect({ excludeIds: ['3'] });
    fireEvent.focus(input);

    expect(optionNames()).not.toContain('Wikimedia Brasil');
    expect(optionNames()).toHaveLength(2);
  });

  it('shows an empty state when nothing matches', () => {
    const { input } = renderSelect();
    fireEvent.change(input, { target: { value: 'xyz' } });

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('selects an option on click and clears the query', () => {
    const { input, onSelect } = renderSelect();
    fireEvent.change(input, { target: { value: 'brasil' } });
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Wikimedia Brasil' }));

    expect(onSelect).toHaveBeenCalledWith('3');
    expect(input).toHaveValue('');
  });

  it('supports keyboard navigation', () => {
    const { input, onSelect } = renderSelect();
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith('3');
  });

  it('closes on Escape', () => {
    const { input } = renderSelect();
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('normalizeSearchText', () => {
  it('strips accents, lowercases and trims', () => {
    expect(normalizeSearchText('  São Tomé ')).toBe('sao tome');
  });
});
