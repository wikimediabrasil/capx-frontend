import { useApp } from '@/contexts/AppContext';
import AffiliationIcon from '@/public/static/images/affiliation.svg';
import AffiliationIconWhite from '@/public/static/images/affiliation_white.svg';
import { SelectList } from './Selector';

interface AffiliationSelectorProps {
  affiliations: Record<string, string>;
  selectedAffiliations: string[] | number[];
  onSelectAffiliation: (affiliationId: string | number) => void;
  placeholder?: string;
}

export function AffiliationSelector({
  affiliations,
  selectedAffiliations,
  onSelectAffiliation,
  placeholder,
}: AffiliationSelectorProps) {
  const { pageContent } = useApp();
  const affiliationsList = Object.entries(affiliations)
    .map(([id, name]) => ({
      id,
      name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <SelectList
      icon={AffiliationIcon}
      iconDark={AffiliationIconWhite}
      title={pageContent['filters-affiliations']}
      items={affiliationsList}
      selectedItems={selectedAffiliations}
      onSelect={onSelectAffiliation}
      placeholder={placeholder}
      multiple
    />
  );
}
