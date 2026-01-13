export enum StockStatus {
  Available = 'Available',
  OutOfStock = 'Out of Stock',
  LimitedStock = 'Limited Stock',
  Unavailable = 'Unavailable' // Legacy support
}

export interface Pharmacy {
  id: string;
  _id?: string;
  name: string;
  price: number;
  priceUnit: string;
  distance: number;
  stock: StockStatus;
  isBestOption: boolean;
  address: string;
  phone: string;
  lat: number;
  lon: number;
}

export type SortKey = 'price' | 'distance' | 'availability';

export type FontSize = 'base' | 'lg' | 'xl';

export interface SearchConfirmation {
  suggestion: string | null;
  original: string;
}

export interface PharmacyOwner {
  name: string;
  phone: string;
  address: string;
}

export interface InventoryItem {
  medicineName: string;
  price: number;
  stock: StockStatus;
  _id?: string;
  quantity?: number;
}

export interface Reservation {
  _id: string;
  medicineId: any;
  pharmacyId: string;
  customerName: string;
  customerPhone: string;
  status: 'Pending' | 'Confirmed' | 'PickedUp' | 'Cancelled';
  createdAt: string;
}
