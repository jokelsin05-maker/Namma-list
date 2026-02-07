
export type Unit = 'kg' | 'litre' | 'piece' | 'packet' | 'bundle' | 'g' | 'ml' | 'box' | 'tin';

export interface MasterItem {
  id: string;
  name: string;
  tanglishName: string;
  category: string;
  defaultUnit: Unit;
  defaultPrice: number;
}

export interface ShoppingItem extends MasterItem {
  quantity: number;
  isBought: boolean;
  userPrice: number;
}

export interface HistoryEntry {
  id: string;
  date: string;
  totalAmount: number;
  itemCount: number;
  items: { name: string; quantity: number; price: number }[];
}

export interface AppSettings {
  favorites: string[]; // List of MasterItem IDs
}

export enum View {
  SHOPPING = 'SHOPPING',
  CATALOG = 'CATALOG',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
  ADD_ITEM = 'ADD_ITEM'
}
