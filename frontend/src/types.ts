export type Role = 'visitor' | 'farmer';

export type ExpenseCategory = 
  | 'Seeds'
  | 'Fertilizers'
  | 'Pesticides & Sprays'
  | 'Labour'
  | 'Crop Cutting / Harvesting'
  | 'Tractor & Diesel'
  | 'Transport'
  | 'Other';

export interface Farmer {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  address: string;
  farmName: string;
  state: string;
  tenantId: string;
  totalAcres: number;
  status: 'Active' | 'Disabled';
  createdAt: string;
}

export interface Crop {
  id: string;
  farmerId: string;
  name: string;
  category: string; // Fruit, Grain, Cash Crop, Spices, Vegetables, Pulses, Oilseeds
  plantationDate: string; // DD-MM-YYYY
  durationDays: number;
  description: string;
  acresPlanted?: number;
  expectedYield?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  farmerId: string;
  cropId: string;
  cropName: string;
  category: ExpenseCategory; // Seeds, Fertilizers, Pesticides, Labour, Cutting, Tractor, Transport, etc.
  details: string;
  date: string; // DD-MM-YYYY
  amount: number;
  quantity?: string; // e.g., '2 bags', '45 Litres', '6 laborers'
  createdAt: string;
}

export interface Worker {
  id: string;
  farmerId: string;
  name: string;
  contact: string;
  daysWorked: number;
  dailyWage: number;
  paymentAmount: number; // calculated: daysWorked * dailyWage
  email?: string;
  address?: string;
  upiId?: string;
  createdAt: string;
}

export interface WaterRecord {
  id: string;
  farmerId: string;
  plotName: string;
  withFertilizer: boolean;
  quantity: number;
  unit: 'Litres' | 'Hours';
  date: string; // DD-MM-YYYY
  createdAt: string;
}

export interface FertilizerRecord {
  id: string;
  farmerId: string;
  plotName: string;
  productName: string;
  quantity: number;
  unit: 'ml' | 'kg';
  date: string; // DD-MM-YYYY
  createdAt: string;
}

export interface Reminder {
  id: string;
  farmerId: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  isDone: boolean;
  createdAt: string;
}

export type NavigationPath = 
  | 'home'
  | 'dashboard'
  | 'crops'
  | 'expenses'
  | 'workers'
  | 'fertilizer'
  | 'reminders'
  | 'reports'
  | 'help'
  | 'about'
  | 'contact';
