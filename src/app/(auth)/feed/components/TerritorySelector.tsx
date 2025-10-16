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

  // Region ids to order first
  const priorityTerritoryIds = ['18', '19', '20', '21', '22', '23', '24', '25'];

  const territoriesList = Object.entries(territories)
    .map(([id, name]) => ({
      id,
      name,
    }))
    .sort((a, b) => {
      const aIsPriority = priorityTerritoryIds.includes(a.id);
      const bIsPriority = priorityTerritoryIds.includes(b.id);

      // If both are regions, order them
      if (aIsPriority && bIsPriority) {
        return a.name.localeCompare(b.name);
      }

      // If only A is region, it comes first
      if (aIsPriority && !bIsPriority) {
        return -1;
      }

      // If B is region, B comes first
      if (!aIsPriority && bIsPriority) {
        return 1;
      }

      // If none is region, order
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
