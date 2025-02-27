export interface TierData {
  id: string;
  exitTier: string;
  percentPosition: string;
  exitType: string;
  optionPftOffset: string;
  optionStopOffset: string;
  stockPftOffset: string;
  stockStopOffset: string;
}

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center' | 'inherit' | 'justify';
}

export interface DynamicTableProps {
  initialRows?: TierData[];
  onAddTier?: (newTier: Omit<TierData, 'id'>) => void;
  onRemoveTier?: (id: string) => void;
  onUpdateTier?: (id: string, updatedTier: Partial<TierData>) => void;
  darkMode?: boolean;
}