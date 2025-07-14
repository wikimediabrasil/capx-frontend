import { SelectList } from './Selector';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import { useApp } from '@/contexts/AppContext';
interface TerritorySelectorProps {
  territories: Record<string, string>;
  selectedTerritories: string[];
  onSelectTerritory: (TerritoryId: string) => void;
  placeholder?: string;
}

export function TerritorySelector({
  territories,
  selectedTerritories,
  onSelectTerritory,
  placeholder,
}: TerritorySelectorProps) {
  const { pageContent } = useApp();
  const territoriesList = Object.entries(territories)
    .map(([id, name]) => ({
      id,
      name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

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
