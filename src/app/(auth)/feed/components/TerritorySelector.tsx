import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import { usePageContent } from '@/stores';
import { Territory } from '@/types/territory';
import { SelectList } from './Selector';

interface TerritorySelectorProps {
  territories: Territory[];
  selectedTerritories: string[];
  onSelectTerritory: (TerritoryId: string) => void;
  placeholder?: string;
}

export function TerritorySelector({
  territories,
  selectedTerritories,
  onSelectTerritory,
  placeholder,
}: Readonly<TerritorySelectorProps>) {
  const pageContent = usePageContent();

  const territoriesList = territories
    .map(t => ({
      id: String(t.id),
      name: t.territory_name,
      isTopLevel: t.parent_territory.length === 0,
    }))
    .sort((a, b) => {
      if (a.isTopLevel && !b.isTopLevel) return -1;
      if (!a.isTopLevel && b.isTopLevel) return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <SelectList
      icon={TerritoryIcon}
      iconDark={TerritoryIconWhite}
      title={pageContent['filters-territory-title']}
      items={territoriesList}
      selectedItems={selectedTerritories}
      onSelect={onSelectTerritory}
      placeholder={placeholder}
      multiple
    />
  );
}
