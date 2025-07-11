import { SelectList } from './Selector';
import AffiliationIcon from '@/public/static/images/affiliation.svg';
import AffiliationIconWhite from '@/public/static/images/affiliation_white.svg';
import { useApp } from '@/contexts/AppContext';

interface AffiliationSelectorProps {
  affiliations: Record<string, string>;
  selectedAffiliations: string[];
  onSelectAffiliation: (affiliationId: string) => void;
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
