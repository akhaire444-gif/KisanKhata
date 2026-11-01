import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Role,
  Farmer,
  Crop,
  Expense,
  Worker,
  WaterRecord,
  FertilizerRecord,
  Reminder,
  NavigationPath
} from '../types';
import { api } from '../api/client';

interface AppContextType {
  // Navigation & Role
  currentPath: NavigationPath;
  setCurrentPath: (path: NavigationPath) => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  
  // Auth state
  currentFarmer: Farmer | null;
  isAuthChecking: boolean;
  loginFarmer: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: () => Promise<{ success: boolean; error?: string }>;
  resetDemoData: () => Promise<{ success: boolean; error?: string }>;
  registerFarmer: (data: Omit<Farmer, 'id' | 'createdAt' | 'status' | 'tenantId'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  logoutFarmer: () => Promise<void>;

  // Crops
  crops: Crop[];
  addCrop: (data: Omit<Crop, 'id' | 'farmerId' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  updateCrop: (id: string, data: Partial<Crop>) => Promise<{ success: boolean; error?: string }>;
  deleteCrop: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Expenses
  expenses: Expense[];
  addExpense: (data: Omit<Expense, 'id' | 'farmerId' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<{ success: boolean; error?: string }>;
  deleteExpense: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Workers
  workers: Worker[];
  addWorker: (data: Omit<Worker, 'id' | 'farmerId' | 'paymentAmount' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  updateWorker: (id: string, data: Partial<Worker>) => Promise<{ success: boolean; error?: string }>;
  deleteWorker: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Water Records
  waterRecords: WaterRecord[];
  addWaterRecord: (data: Omit<WaterRecord, 'id' | 'farmerId' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  deleteWaterRecord: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Fertilizer & Pesticide Records
  fertilizerRecords: FertilizerRecord[];
  addFertilizerRecord: (data: Omit<FertilizerRecord, 'id' | 'farmerId' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  deleteFertilizerRecord: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Reminders
  reminders: Reminder[];
  addReminder: (data: Omit<Reminder, 'id' | 'farmerId' | 'isDone' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  deleteReminder: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleReminderDone: (id: string) => Promise<{ success: boolean; error?: string }>;
  todayReminders: Reminder[];

  // UI Toast
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;

  // Live Backend Connectivity
  backendStatus: 'connected' | 'offline' | 'checking';
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to format ISO date strings (YYYY-MM-DD) to DD-MM-YYYY if needed
function toDisplayDate(isoOrDate: string): string {
  if (!isoOrDate) return '';
  if (isoOrDate.includes('-') && isoOrDate.split('-')[0].length === 4) {
    const [y, m, d] = isoOrDate.split('-');
    return `${d}-${m}-${y}`;
  }
  return isoOrDate;
}

const DEMO_FALLBACK_CROPS: Crop[] = [
  {
    id: 'crop-demo-soybean',
    farmerId: 'demo-farmer-id',
    name: 'Kharif Soybean (JS-335)',
    category: 'Oilseeds',
    plantationDate: '15-06-2026',
    durationDays: 105,
    description: 'Certified JS-335 seed plot, drip irrigated, high yield target',
    acresPlanted: 10,
    expectedYield: '28 Quintals',
    createdAt: '15-06-2026'
  },
  {
    id: 'crop-demo-onion',
    farmerId: 'demo-farmer-id',
    name: 'Rabi Onion (Gavran Garva)',
    category: 'Vegetables',
    plantationDate: '20-10-2026',
    durationDays: 120,
    description: 'Nashik red quality onion with raised bed & micro-sprinkler setup',
    acresPlanted: 5,
    expectedYield: '150 Quintals',
    createdAt: '20-10-2026'
  },
  {
    id: 'crop-demo-pomegranate',
    farmerId: 'demo-farmer-id',
    name: 'Pomegranate Orchard (Bhagwa)',
    category: 'Fruit',
    plantationDate: '10-01-2024',
    durationDays: 180,
    description: 'High-density Bhagwa orchard, export grade mrig-bahar treatment',
    acresPlanted: 6,
    expectedYield: '65 Quintals',
    createdAt: '10-01-2024'
  },
  {
    id: 'crop-demo-sugarcane',
    farmerId: 'demo-farmer-id',
    name: 'Sugarcane (Co-86032)',
    category: 'Cash Crop',
    plantationDate: '01-02-2026',
    durationDays: 365,
    description: 'Perennial sugar mill contract crop, 5 ft paired row planting',
    acresPlanted: 4,
    expectedYield: '380 Tonnes',
    createdAt: '01-02-2026'
  }
];

const DEMO_FALLBACK_EXPENSES: Expense[] = [
  {
    id: 'exp-demo-1',
    farmerId: 'demo-farmer-id',
    cropId: 'crop-demo-soybean',
    cropName: 'Kharif Soybean (JS-335)',
    category: 'Seeds',
    details: 'Mahyco Certified Soybean Seed (6 bags)',
    date: '16-06-2026',
    amount: 18400,
    quantity: '6 bags',
    createdAt: '16-06-2026'
  },
  {
    id: 'exp-demo-2',
    farmerId: 'demo-farmer-id',
    cropId: 'crop-demo-soybean',
    cropName: 'Kharif Soybean (JS-335)',
    category: 'Fertilizers',
    details: 'IFFCO 10:26:26 & Urea Basal Dose',
    date: '22-06-2026',
    amount: 14500,
    quantity: '10 bags',
    createdAt: '22-06-2026'
  },
  {
    id: 'exp-demo-3',
    farmerId: 'demo-farmer-id',
    cropId: 'crop-demo-pomegranate',
    cropName: 'Pomegranate Orchard (Bhagwa)',
    category: 'Pesticides & Sprays',
    details: 'Ampligo & Nativo Protective Spray against fungal spots',
    date: '10-07-2026',
    amount: 7850,
    quantity: '2 Litres',
    createdAt: '10-07-2026'
  },
  {
    id: 'exp-demo-4',
    farmerId: 'demo-farmer-id',
    cropId: 'crop-demo-onion',
    cropName: 'Rabi Onion (Gavran Garva)',
    category: 'Tractor & Diesel',
    details: 'Tractor Ploughing, harrowing & raised bed diesel expense',
    date: '18-10-2026',
    amount: 9600,
    quantity: '105 Litres',
    createdAt: '18-10-2026'
  },
  {
    id: 'exp-demo-5',
    farmerId: 'demo-farmer-id',
    cropId: 'crop-demo-soybean',
    cropName: 'Kharif Soybean (JS-335)',
    category: 'Crop Cutting / Harvesting',
    details: 'Combine harvester & thresher machine rental',
    date: '02-10-2026',
    amount: 16500,
    quantity: '10 acres',
    createdAt: '02-10-2026'
  },
  {
    id: 'exp-demo-6',
    farmerId: 'demo-farmer-id',
    cropId: 'crop-demo-onion',
    cropName: 'Rabi Onion (Gavran Garva)',
    category: 'Other',
    details: 'Drip lateral repairs, flush valves & micro-emitters',
    date: '21-10-2026',
    amount: 6200,
    quantity: '1 set',
    createdAt: '21-10-2026'
  },
  {
    id: 'exp-demo-7',
    farmerId: 'demo-farmer-id',
    cropId: 'crop-demo-pomegranate',
    cropName: 'Pomegranate Orchard (Bhagwa)',
    category: 'Other',
    details: 'Bamboo stakes & fruit support wire bundles',
    date: '15-08-2026',
    amount: 4800,
    quantity: '120 stakes',
    createdAt: '15-08-2026'
  },
  {
    id: 'exp-demo-8',
    farmerId: 'demo-farmer-id',
    cropId: 'crop-demo-soybean',
    cropName: 'Kharif Soybean (JS-335)',
    category: 'Transport',
    details: 'APMC Lasalgaon Mandi transport tempo & octroi toll',
    date: '12-10-2026',
    amount: 5400,
    quantity: '1 tempo trip',
    createdAt: '12-10-2026'
  }
];

const DEMO_FALLBACK_WORKERS: Worker[] = [
  {
    id: 'worker-demo-1',
    farmerId: 'demo-farmer-id',
    name: 'Rameshwar Chavan',
    contact: '9822104521',
    daysWorked: 24,
    dailyWage: 450,
    paymentAmount: 10800,
    address: 'Sinnar, Nashik',
    createdAt: '01-06-2026'
  },
  {
    id: 'worker-demo-2',
    farmerId: 'demo-farmer-id',
    name: 'Sunita Tai Patil',
    contact: '9822104522',
    daysWorked: 20,
    dailyWage: 350,
    paymentAmount: 7000,
    address: 'Sinnar, Nashik',
    createdAt: '01-06-2026'
  },
  {
    id: 'worker-demo-3',
    farmerId: 'demo-farmer-id',
    name: 'Bhaskar Rao Gite',
    contact: '9822104523',
    daysWorked: 22,
    dailyWage: 450,
    paymentAmount: 9900,
    address: 'Dindori, Nashik',
    createdAt: '05-06-2026'
  },
  {
    id: 'worker-demo-4',
    farmerId: 'demo-farmer-id',
    name: 'Anita Dnyaneshwar Wagh',
    contact: '9822104524',
    daysWorked: 18,
    dailyWage: 350,
    paymentAmount: 6300,
    address: 'Niphad, Nashik',
    createdAt: '10-06-2026'
  },
  {
    id: 'worker-demo-5',
    farmerId: 'demo-farmer-id',
    name: 'Datta Tukaram Shinde',
    contact: '9822104525',
    daysWorked: 26,
    dailyWage: 500,
    paymentAmount: 13000,
    address: 'Yeola, Nashik',
    createdAt: '01-06-2026'
  },
  {
    id: 'worker-demo-6',
    farmerId: 'demo-farmer-id',
    name: 'Kailas Baburao Sanap',
    contact: '9822104526',
    daysWorked: 15,
    dailyWage: 400,
    paymentAmount: 6000,
    address: 'Sinnar, Nashik',
    createdAt: '15-06-2026'
  }
];

const DEMO_FALLBACK_WATER: WaterRecord[] = [
  {
    id: 'water-demo-1',
    farmerId: 'demo-farmer-id',
    plotName: 'Onion Block 2',
    withFertilizer: false,
    quantity: 12000,
    unit: 'Litres',
    date: '24-10-2026',
    createdAt: '24-10-2026'
  },
  {
    id: 'water-demo-2',
    farmerId: 'demo-farmer-id',
    plotName: 'Pomegranate Block 1',
    withFertilizer: true,
    quantity: 4,
    unit: 'Hours',
    date: '25-10-2026',
    createdAt: '25-10-2026'
  },
  {
    id: 'water-demo-3',
    farmerId: 'demo-farmer-id',
    plotName: 'Sugarcane Plot',
    withFertilizer: false,
    quantity: 6,
    unit: 'Hours',
    date: '26-10-2026',
    createdAt: '26-10-2026'
  }
];

const DEMO_FALLBACK_FERT: FertilizerRecord[] = [
  {
    id: 'fert-demo-1',
    farmerId: 'demo-farmer-id',
    plotName: 'Pomegranate Orchard Block 1',
    productName: '19:19:19 + Micronutrients Foliar Spray',
    quantity: 5,
    unit: 'kg',
    date: '20-10-2026',
    createdAt: '20-10-2026'
  },
  {
    id: 'fert-demo-2',
    farmerId: 'demo-farmer-id',
    plotName: 'Onion Bed Block 2',
    productName: '0:52:34 Water Soluble Drip Grade',
    quantity: 10,
    unit: 'kg',
    date: '23-10-2026',
    createdAt: '23-10-2026'
  }
];

const DEMO_FALLBACK_REMINDERS: Reminder[] = [
  {
    id: 'rem-demo-1',
    farmerId: 'demo-farmer-id',
    description: 'Weeding & intercultural operations in Onion Block 2',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    isDone: false,
    createdAt: toDisplayDate(new Date().toISOString().split('T')[0])
  },
  {
    id: 'rem-demo-2',
    farmerId: 'demo-farmer-id',
    description: 'Second dose of micronutrients for Pomegranate Mrig Bahar',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:00',
    isDone: false,
    createdAt: toDisplayDate(new Date().toISOString().split('T')[0])
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentPath, setCurrentPath] = useState<NavigationPath>('home');
  const [currentRole, setCurrentRole] = useState<Role>('visitor');

  // Auth: Start completely unauthenticated. NEVER default to demo user!
  const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Data Collections: Start EMPTY. Real data loaded only after authentication!
  const [crops, setCrops] = useState<Crop[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [waterRecords, setWaterRecords] = useState<WaterRecord[]>([]);
  const [fertilizerRecords, setFertilizerRecords] = useState<FertilizerRecord[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Toast & Connection
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'offline' | 'checking'>('checking');

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 3500);
  };

  const mapUserToFarmer = (u: any): Farmer => {
    const isDemo = Boolean(u.isDemo ?? (u.email?.toLowerCase() === 'demo.farmer@kisankhata.in'));
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      mobile: u.mobile,
      email: u.email,
      address: u.address || (isDemo ? 'Sinnar, Nashik' : ''),
      farmName: u.farmName || (isDemo ? 'Green Valley Demonstration Farm' : `${u.firstName} Krishi Farm`),
      state: u.state || 'Maharashtra',
      tenantId: isDemo ? 'DEMO-MH-TENANT' : `Farm-${(u.state || 'MH').substring(0, 2).toUpperCase()}-${u.id.substring(0, 4)}`,
      totalAcres: isDemo ? 25 : 10,
      status: 'Active',
      isDemo,
      createdAt: toDisplayDate(new Date().toISOString().split('T')[0])
    };
  };

  // Fetch real data for authenticated farmer from backend
  const loadFarmerData = useCallback(async () => {
    try {
      const [cropsRes, expRes, wrkRes, waterRes, inputRes, remRes] = await Promise.allSettled([
        api.farmer.getCrops(),
        api.farmer.getExpenses(),
        api.farmer.getWorkers(),
        api.farmer.getWaterRecords(),
        api.farmer.getInputRecords(),
        api.farmer.getReminders()
      ]);

      if (cropsRes.status === 'fulfilled' && cropsRes.value?.success && Array.isArray(cropsRes.value.data)) {
        const loadedCrops: Crop[] = cropsRes.value.data.map((c: any) => ({
          id: c.id,
          farmerId: c.farmerId,
          name: c.name,
          category: c.category || 'Crop',
          plantationDate: toDisplayDate(c.plantationDate),
          durationDays: c.durationDays || 120,
          description: c.description || '',
          acresPlanted: 5,
          expectedYield: 'Standard',
          createdAt: toDisplayDate(c.createdAt ? String(c.createdAt).split('T')[0] : '')
        }));
        setCrops(loadedCrops);
      }

      if (expRes.status === 'fulfilled' && expRes.value?.success && Array.isArray(expRes.value.data)) {
        const loadedExpenses: Expense[] = expRes.value.data.map((e: any) => ({
          id: e.id,
          farmerId: e.farmerId,
          cropId: e.cropId,
          cropName: 'Farm Crop',
          category: e.category,
          details: e.details || '',
          date: toDisplayDate(e.expenseDate),
          amount: Number(e.amount),
          quantity: e.quantity || '',
          createdAt: toDisplayDate(e.createdAt ? String(e.createdAt).split('T')[0] : '')
        }));
        setExpenses(loadedExpenses);
      }

      if (wrkRes.status === 'fulfilled' && wrkRes.value?.success && Array.isArray(wrkRes.value.data)) {
        const loadedWorkers: Worker[] = wrkRes.value.data.map((w: any) => ({
          id: w.id,
          farmerId: w.farmerId,
          name: w.name,
          contact: w.contact,
          daysWorked: w.daysWorked || 0,
          dailyWage: Number(w.dailyWage || 0),
          paymentAmount: Number(w.paymentAmount || 0),
          email: w.email || '',
          address: w.address || '',
          upiId: w.upiId || '',
          createdAt: toDisplayDate(w.createdAt ? String(w.createdAt).split('T')[0] : '')
        }));
        setWorkers(loadedWorkers);
      }

      if (waterRes.status === 'fulfilled' && waterRes.value?.success && Array.isArray(waterRes.value.data)) {
        const loadedWater: WaterRecord[] = waterRes.value.data.map((wr: any) => ({
          id: wr.id,
          farmerId: wr.farmerId,
          plotName: wr.plot || wr.name || 'Plot',
          withFertilizer: wr.fertilizerUsed ?? false,
          quantity: wr.quantity ? parseFloat(wr.quantity) || 1 : 1,
          unit: 'Hours',
          date: toDisplayDate(wr.recordDate),
          createdAt: toDisplayDate(wr.createdAt ? String(wr.createdAt).split('T')[0] : '')
        }));
        setWaterRecords(loadedWater);
      }

      if (inputRes.status === 'fulfilled' && inputRes.value?.success && Array.isArray(inputRes.value.data)) {
        const loadedFert: FertilizerRecord[] = inputRes.value.data.map((fr: any) => ({
          id: fr.id,
          farmerId: fr.farmerId,
          plotName: fr.plot || 'Plot',
          productName: fr.product || fr.name || 'Fertilizer',
          quantity: fr.quantity ? parseFloat(fr.quantity) || 1 : 1,
          unit: 'kg',
          date: toDisplayDate(fr.recordDate),
          createdAt: toDisplayDate(fr.createdAt ? String(fr.createdAt).split('T')[0] : '')
        }));
        setFertilizerRecords(loadedFert);
      }

      if (remRes.status === 'fulfilled' && remRes.value?.success && Array.isArray(remRes.value.data)) {
        const loadedReminders: Reminder[] = remRes.value.data.map((r: any) => ({
          id: r.id,
          farmerId: r.farmerId,
          description: r.description || r.name,
          date: r.reminderDate || r.recordDate || new Date().toISOString().split('T')[0],
          time: r.reminderTime || '09:00',
          isDone: r.done ?? false,
          createdAt: toDisplayDate(r.createdAt ? String(r.createdAt).split('T')[0] : '')
        }));
        setReminders(loadedReminders);
      }
    } catch (err) {
      console.error('Failed to load farmer data:', err);
    }
  }, []);

  // Load preconfigured sample data into state for public demo exploration
  const loadDemoFallbackData = useCallback(() => {
    setCrops([...DEMO_FALLBACK_CROPS]);
    setExpenses([...DEMO_FALLBACK_EXPENSES]);
    setWorkers([...DEMO_FALLBACK_WORKERS]);
    setWaterRecords([...DEMO_FALLBACK_WATER]);
    setFertilizerRecords([...DEMO_FALLBACK_FERT]);
    setReminders([...DEMO_FALLBACK_REMINDERS]);
  }, []);

  // Session Check (Verifies real session with backend)
  const checkSession = useCallback(async (): Promise<boolean> => {
    setIsAuthChecking(true);
    try {
      const csrfRes = await api.auth.csrf();
      if (csrfRes && (csrfRes as any).success !== false) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('offline');
      }
      const res = await api.auth.me();
      if (res && res.success && res.data) {
        const farmer = mapUserToFarmer(res.data);
        setCurrentFarmer(farmer);
        setCurrentRole('farmer');
        setBackendStatus('connected');
        await loadFarmerData();
        return true;
      } else {
        setCurrentFarmer(null);
        setCurrentRole('visitor');
        return false;
      }
    } catch {
      setBackendStatus('offline');
      setCurrentFarmer(null);
      setCurrentRole('visitor');
      return false;
    } finally {
      setIsAuthChecking(false);
    }
  }, [loadFarmerData]);

  // Initial Session Check on Mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Today's reminders calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReminders = reminders.filter(r => !r.isDone && (r.date === todayStr || toDisplayDate(r.date) === toDisplayDate(todayStr)));

  // Farmer Login: Strict backend authentication.
  const loginFarmer = async (email: string, pass: string) => {
    try {
      const res = await api.auth.login({ email, password: pass });
      if (res && res.success && res.data) {
        setBackendStatus('connected');
        const liveFarmer = mapUserToFarmer(res.data);
        setCurrentFarmer(liveFarmer);
        setCurrentRole('farmer');
        showToast(`Welcome back, ${liveFarmer.firstName} ji!`, 'success');
        await loadFarmerData();
        return { success: true };
      }
      return { success: false, error: res?.message || 'Login failed' };
    } catch (err: any) {
      const msg = err.response?.message || err.message || 'Invalid email or password';
      return { success: false, error: msg };
    }
  };

  // One-Click Demo Login: Real backend session & isolated database tenant with instant fallback
  const loginDemo = async () => {
    try {
      const res = await api.auth.demo();
      if (res && res.success && res.data) {
        setBackendStatus('connected');
        const demoFarmer = mapUserToFarmer(res.data);
        setCurrentFarmer(demoFarmer);
        setCurrentRole('farmer');
        setCurrentPath('dashboard');
        showToast('Entered Demo Account: Green Valley Demonstration Farm', 'success');
        await loadFarmerData();
        return { success: true };
      }
      throw new Error(res?.message || 'Backend rejected demo access');
    } catch (err: any) {
      console.warn('Backend unavailable, launching local demo preview mode:', err);
      setBackendStatus('offline');
      const fallbackDemoFarmer: Farmer = {
        id: 'demo-farmer-session-001',
        firstName: 'Demo',
        lastName: 'Farmer',
        mobile: '9876543210',
        email: 'demo.farmer@kisankhata.in',
        address: 'Sinnar, Nashik',
        farmName: 'Green Valley Demonstration Farm',
        state: 'Maharashtra',
        tenantId: 'DEMO-MH-TENANT',
        totalAcres: 25,
        status: 'Active',
        isDemo: true,
        createdAt: toDisplayDate(new Date().toISOString().split('T')[0])
      };
      setCurrentFarmer(fallbackDemoFarmer);
      setCurrentRole('farmer');
      setCurrentPath('dashboard');
      loadDemoFallbackData();
      showToast('Entered Demo Account: Green Valley Demonstration Farm', 'success');
      return { success: true };
    }
  };

  // Reset Demo Data: Restore clean agricultural sample data in demo tenant
  const resetDemoData = async () => {
    try {
      const res = await api.auth.resetDemo();
      if (res && res.success && res.data) {
        setBackendStatus('connected');
        const demoFarmer = mapUserToFarmer(res.data);
        setCurrentFarmer(demoFarmer);
        showToast('Sample agricultural data reset to original baseline.', 'info');
        await loadFarmerData();
        return { success: true };
      }
      throw new Error(res?.message || 'Reset failed');
    } catch {
      loadDemoFallbackData();
      showToast('Sample agricultural data reset to original baseline.', 'info');
      return { success: true };
    }
  };

  // Farmer Registration: Strict backend registration. Never fallback to mock data!
  const registerFarmer = async (data: Omit<Farmer, 'id' | 'createdAt' | 'status' | 'tenantId'> & { password?: string }) => {
    try {
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        mobile: data.mobile.trim(),
        password: data.password || 'Farmer@123',
        farmName: data.farmName?.trim() || `${data.firstName} Krishi Farm`,
        address: data.address?.trim() || 'Rural Maharashtra',
        state: data.state || 'Maharashtra'
      };

      const res = await api.auth.registerFarmer(payload);
      if (res && res.success) {
        // Auto sign-in or prompt
        const loginRes = await api.auth.login({ email: payload.email, password: payload.password });
        if (loginRes && loginRes.success && loginRes.data) {
          const liveFarmer = mapUserToFarmer(loginRes.data);
          setCurrentFarmer(liveFarmer);
          setCurrentRole('farmer');
          showToast('Farm registered successfully! Welcome to KisanKhata.', 'success');
          await loadFarmerData();
          return { success: true };
        }
        showToast('Account created! Please sign in with your password.', 'success');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Registration failed' };
    } catch (err: any) {
      const msg = err.response?.message || err.message || 'Registration failed';
      return { success: false, error: msg };
    }
  };

  // Logout: Invalidate backend session and clear client memory & storage
  const logoutFarmer = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    }

    // Clear state
    setCurrentFarmer(null);
    setCurrentRole('visitor');
    setCrops([]);
    setExpenses([]);
    setWorkers([]);
    setWaterRecords([]);
    setFertilizerRecords([]);
    setReminders([]);

    // Clear any leftover local storage
    localStorage.removeItem('kk_crops');
    localStorage.removeItem('kk_expenses');
    localStorage.removeItem('kk_workers');
    localStorage.removeItem('kk_water');
    localStorage.removeItem('kk_fert');
    localStorage.removeItem('kk_reminders');

    setCurrentPath('home');
    showToast('Logged out securely from farm khata.', 'info');
  };

  // Crop Management
  const addCrop = async (data: Omit<Crop, 'id' | 'farmerId' | 'createdAt'>) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      // Format plantation date to YYYY-MM-DD for backend
      let plantationIso = data.plantationDate;
      if (data.plantationDate.includes('-') && data.plantationDate.split('-')[0].length === 2) {
        const [d, m, y] = data.plantationDate.split('-');
        plantationIso = `${y}-${m}-${d}`;
      }

      const res = await api.farmer.createCrop({
        name: data.name.trim(),
        category: data.category || 'Crop',
        plantationDate: plantationIso,
        durationDays: data.durationDays || 120,
        description: data.description || ''
      });

      if (res && res.success && res.data) {
        const saved = res.data;
        const newCrop: Crop = {
          ...data,
          id: saved.id,
          farmerId: currentFarmer.id,
          plantationDate: toDisplayDate(saved.plantationDate),
          createdAt: toDisplayDate(saved.createdAt ? String(saved.createdAt).split('T')[0] : '')
        };
        setCrops(prev => [newCrop, ...prev]);
        showToast('Crop saved successfully!', 'success');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Failed to save crop' };
    } catch (err: any) {
      if (currentFarmer.isDemo) {
        const localId = `demo-crop-${Date.now()}`;
        const newCrop: Crop = {
          ...data,
          id: localId,
          farmerId: currentFarmer.id,
          plantationDate: data.plantationDate,
          createdAt: toDisplayDate(new Date().toISOString().split('T')[0])
        };
        setCrops(prev => [newCrop, ...prev]);
        showToast('Crop saved to demo ledger!', 'success');
        return { success: true };
      }
      const msg = err.response?.message || err.message || 'Failed to add crop';
      return { success: false, error: msg };
    }
  };

  const updateCrop = async (id: string, data: Partial<Crop>) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      let plantationIso = data.plantationDate;
      if (plantationIso && plantationIso.includes('-') && plantationIso.split('-')[0].length === 2) {
        const [d, m, y] = plantationIso.split('-');
        plantationIso = `${y}-${m}-${d}`;
      }

      const res = await api.farmer.updateCrop(id, {
        name: data.name?.trim(),
        category: data.category,
        plantationDate: plantationIso,
        durationDays: data.durationDays,
        description: data.description
      });

      if (res && res.success) {
        setCrops(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
        showToast('Crop details updated.', 'success');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Update failed' };
    } catch (err: any) {
      if (currentFarmer.isDemo) {
        setCrops(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
        showToast('Crop details updated in demo ledger.', 'success');
        return { success: true };
      }
      const msg = err.response?.message || err.message || 'Failed to update crop';
      return { success: false, error: msg };
    }
  };

  const deleteCrop = async (id: string) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      const res = await api.farmer.deleteCrop(id);
      if (res && res.success) {
        setCrops(prev => prev.filter(c => c.id !== id));
        showToast('Crop deleted.', 'info');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Delete failed' };
    } catch (err: any) {
      if (currentFarmer.isDemo) {
        setCrops(prev => prev.filter(c => c.id !== id));
        showToast('Crop removed from demo ledger.', 'info');
        return { success: true };
      }
      const msg = err.response?.message || err.message || 'Cannot delete crop';
      return { success: false, error: msg };
    }
  };

  // Expense Management
  const addExpense = async (data: Omit<Expense, 'id' | 'farmerId' | 'createdAt'>) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      let expIso = data.date;
      if (expIso.includes('-') && expIso.split('-')[0].length === 2) {
        const [d, m, y] = expIso.split('-');
        expIso = `${y}-${m}-${d}`;
      }

      const res = await api.farmer.createExpense({
        cropId: data.cropId,
        amount: data.amount,
        category: data.category,
        details: data.details || '',
        expenseDate: expIso
      });

      if (res && res.success && res.data) {
        const saved = res.data;
        const newExp: Expense = {
          ...data,
          id: saved.id,
          farmerId: currentFarmer.id,
          date: toDisplayDate(saved.expenseDate),
          amount: Number(saved.amount),
          createdAt: toDisplayDate(saved.createdAt ? String(saved.createdAt).split('T')[0] : '')
        };
        setExpenses(prev => [newExp, ...prev]);
        showToast('Expense saved in ledger!', 'success');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Failed to record expense' };
    } catch (err: any) {
      if (currentFarmer.isDemo) {
        const localId = `demo-exp-${Date.now()}`;
        const newExp: Expense = {
          ...data,
          id: localId,
          farmerId: currentFarmer.id,
          date: data.date,
          createdAt: toDisplayDate(new Date().toISOString().split('T')[0])
        };
        setExpenses(prev => [newExp, ...prev]);
        showToast('Expense saved in demo ledger!', 'success');
        return { success: true };
      }
      const msg = err.response?.message || err.message || 'Failed to record expense';
      return { success: false, error: msg };
    }
  };

  const updateExpense = async (id: string, data: Partial<Expense>) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      let expIso = data.date;
      if (expIso && expIso.includes('-') && expIso.split('-')[0].length === 2) {
        const [d, m, y] = expIso.split('-');
        expIso = `${y}-${m}-${d}`;
      }

      const res = await api.farmer.updateExpense(id, {
        cropId: data.cropId,
        amount: data.amount,
        category: data.category,
        details: data.details,
        expenseDate: expIso
      });

      if (res && res.success) {
        setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...data } : e)));
        showToast('Expense updated.', 'success');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Update failed' };
    } catch (err: any) {
      if (currentFarmer.isDemo) {
        setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...data } : e)));
        showToast('Expense updated in demo ledger.', 'success');
        return { success: true };
      }
      const msg = err.response?.message || err.message || 'Failed to update expense';
      return { success: false, error: msg };
    }
  };

  const deleteExpense = async (id: string) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      const res = await api.farmer.deleteExpense(id);
      if (res && res.success) {
        setExpenses(prev => prev.filter(e => e.id !== id));
        showToast('Expense record removed.', 'info');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Delete failed' };
    } catch (err: any) {
      if (currentFarmer.isDemo) {
        setExpenses(prev => prev.filter(e => e.id !== id));
        showToast('Expense removed from demo ledger.', 'info');
        return { success: true };
      }
      const msg = err.response?.message || err.message || 'Failed to delete expense';
      return { success: false, error: msg };
    }
  };

  // Worker Management
  const addWorker = async (data: Omit<Worker, 'id' | 'farmerId' | 'paymentAmount' | 'createdAt'>) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      const res = await api.farmer.createWorker({
        name: data.name.trim(),
        daysWorked: data.daysWorked,
        dailyWage: data.dailyWage,
        contact: data.contact,
        email: data.email || null,
        address: data.address || '',
        upiId: data.upiId || ''
      });

      if (res && res.success && res.data) {
        const saved = res.data;
        const newWorker: Worker = {
          ...data,
          id: saved.id,
          farmerId: currentFarmer.id,
          paymentAmount: Number(saved.paymentAmount || data.daysWorked * data.dailyWage),
          createdAt: toDisplayDate(saved.createdAt ? String(saved.createdAt).split('T')[0] : '')
        };
        setWorkers(prev => [newWorker, ...prev]);
        showToast('Worker added with wage ledger.', 'success');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Failed to add worker' };
    } catch (err: any) {
      if (currentFarmer.isDemo) {
        const localId = `demo-wrk-${Date.now()}`;
        const newWorker: Worker = {
          ...data,
          id: localId,
          farmerId: currentFarmer.id,
          paymentAmount: data.daysWorked * data.dailyWage,
          createdAt: toDisplayDate(new Date().toISOString().split('T')[0])
        };
        setWorkers(prev => [newWorker, ...prev]);
        showToast('Worker added with wage ledger.', 'success');
        return { success: true };
      }
      const msg = err.response?.message || err.message || 'Failed to add worker';
      return { success: false, error: msg };
    }
  };

  const updateWorker = async (id: string, data: Partial<Worker>) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      const current = workers.find(w => w.id === id);
      const res = await api.farmer.updateWorker(id, {
        name: data.name ?? current?.name,
        daysWorked: data.daysWorked ?? current?.daysWorked,
        dailyWage: data.dailyWage ?? current?.dailyWage,
        contact: data.contact ?? current?.contact,
        email: data.email ?? current?.email,
        address: data.address ?? current?.address,
        upiId: data.upiId ?? current?.upiId
      });

      if (res && res.success) {
        setWorkers(prev =>
          prev.map(w => {
            if (w.id === id) {
              const days = data.daysWorked !== undefined ? data.daysWorked : w.daysWorked;
              const wage = data.dailyWage !== undefined ? data.dailyWage : w.dailyWage;
              return {
                ...w,
                ...data,
                daysWorked: days,
                dailyWage: wage,
                paymentAmount: days * wage
              };
            }
            return w;
          })
        );
        showToast('Worker wage roll updated.', 'success');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Update failed' };
    } catch (err: any) {
      if (currentFarmer.isDemo) {
        setWorkers(prev =>
          prev.map(w => {
            if (w.id === id) {
              const days = data.daysWorked !== undefined ? data.daysWorked : w.daysWorked;
              const wage = data.dailyWage !== undefined ? data.dailyWage : w.dailyWage;
              return {
                ...w,
                ...data,
                daysWorked: days,
                dailyWage: wage,
                paymentAmount: days * wage
              };
            }
            return w;
          })
        );
        showToast('Worker wage roll updated.', 'success');
        return { success: true };
      }
      const msg = err.response?.message || err.message || 'Failed to update worker';
      return { success: false, error: msg };
    }
  };

  const deleteWorker = async (id: string) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      const res = await api.farmer.deleteWorker(id);
      if (res && res.success) {
        setWorkers(prev => prev.filter(w => w.id !== id));
        showToast('Worker record deleted.', 'info');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Delete failed' };
    } catch (err: any) {
      if (currentFarmer.isDemo) {
        setWorkers(prev => prev.filter(w => w.id !== id));
        showToast('Worker record deleted.', 'info');
        return { success: true };
      }
      const msg = err.response?.message || err.message || 'Failed to delete worker';
      return { success: false, error: msg };
    }
  };

  // Water Records
  const addWaterRecord = async (data: Omit<WaterRecord, 'id' | 'farmerId' | 'createdAt'>) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      let recDate = data.date;
      if (recDate.includes('-') && recDate.split('-')[0].length === 2) {
        const [d, m, y] = recDate.split('-');
        recDate = `${y}-${m}-${d}`;
      }

      const res = await api.farmer.createWaterRecord({
        name: `${data.plotName} Irrigation`,
        plotName: data.plotName,
        withFertilizer: data.withFertilizer,
        quantity: String(data.quantity),
        unit: data.unit,
        date: recDate,
        description: 'Irrigation record'
      });

      if (res && res.success && res.data) {
        const saved = res.data;
        const record: WaterRecord = {
          ...data,
          id: saved.id,
          farmerId: currentFarmer.id,
          date: toDisplayDate(saved.recordDate),
          createdAt: toDisplayDate(saved.createdAt ? String(saved.createdAt).split('T')[0] : '')
        };
        setWaterRecords(prev => [record, ...prev]);
        showToast('Water log saved.', 'success');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Failed to save water record' };
    } catch (err: any) {
      const msg = err.response?.message || err.message || 'Failed to save water record';
      return { success: false, error: msg };
    }
  };

  const deleteWaterRecord = async (id: string) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      const res = await api.farmer.deleteWaterRecord(id);
      if (res && res.success) {
        setWaterRecords(prev => prev.filter(w => w.id !== id));
        showToast('Water record removed.', 'info');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Delete failed' };
    } catch (err: any) {
      const msg = err.response?.message || err.message || 'Failed to delete record';
      return { success: false, error: msg };
    }
  };

  // Fertilizer Records
  const addFertilizerRecord = async (data: Omit<FertilizerRecord, 'id' | 'farmerId' | 'createdAt'>) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      let recDate = data.date;
      if (recDate.includes('-') && recDate.split('-')[0].length === 2) {
        const [d, m, y] = recDate.split('-');
        recDate = `${y}-${m}-${d}`;
      }

      const res = await api.farmer.createInputRecord({
        name: `${data.productName} Application`,
        plotName: data.plotName,
        productName: data.productName,
        quantity: String(data.quantity),
        unit: data.unit,
        date: recDate,
        description: 'Input record'
      });

      if (res && res.success && res.data) {
        const saved = res.data;
        const record: FertilizerRecord = {
          ...data,
          id: saved.id,
          farmerId: currentFarmer.id,
          date: toDisplayDate(saved.recordDate),
          createdAt: toDisplayDate(saved.createdAt ? String(saved.createdAt).split('T')[0] : '')
        };
        setFertilizerRecords(prev => [record, ...prev]);
        showToast('Fertilizer/Pesticide log saved.', 'success');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Failed to save record' };
    } catch (err: any) {
      const msg = err.response?.message || err.message || 'Failed to save record';
      return { success: false, error: msg };
    }
  };

  const deleteFertilizerRecord = async (id: string) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      const res = await api.farmer.deleteInputRecord(id);
      if (res && res.success) {
        setFertilizerRecords(prev => prev.filter(f => f.id !== id));
        showToast('Record removed.', 'info');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Delete failed' };
    } catch (err: any) {
      const msg = err.response?.message || err.message || 'Failed to delete record';
      return { success: false, error: msg };
    }
  };

  // Reminders
  const addReminder = async (data: Omit<Reminder, 'id' | 'farmerId' | 'isDone' | 'createdAt'>) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      let reminderDate = data.date;
      const res = await api.farmer.createReminder({
        name: data.description,
        description: data.description,
        reminderDate: reminderDate,
        reminderTime: data.time
      });

      if (res && res.success && res.data) {
        const saved = res.data;
        const rem: Reminder = {
          ...data,
          id: saved.id,
          farmerId: currentFarmer.id,
          isDone: false,
          date: saved.reminderDate || data.date,
          time: saved.reminderTime || data.time,
          createdAt: toDisplayDate(saved.createdAt ? String(saved.createdAt).split('T')[0] : '')
        };
        setReminders(prev => [rem, ...prev]);
        showToast('Farm reminder scheduled.', 'success');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Failed to schedule reminder' };
    } catch (err: any) {
      const msg = err.response?.message || err.message || 'Failed to schedule reminder';
      return { success: false, error: msg };
    }
  };

  const deleteReminder = async (id: string) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      const res = await api.farmer.deleteReminder(id);
      if (res && res.success) {
        setReminders(prev => prev.filter(r => r.id !== id));
        showToast('Reminder dismissed.', 'info');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Delete failed' };
    } catch (err: any) {
      const msg = err.response?.message || err.message || 'Failed to delete reminder';
      return { success: false, error: msg };
    }
  };

  const toggleReminderDone = async (id: string) => {
    if (!currentFarmer) return { success: false, error: 'Authentication required' };

    try {
      const res = await api.farmer.toggleReminder(id);
      if (res && res.success && res.data) {
        setReminders(prev => prev.map(r => (r.id === id ? { ...r, isDone: !r.isDone } : r)));
        showToast('Reminder updated.', 'success');
        return { success: true };
      }
      return { success: false, error: res?.message || 'Toggle failed' };
    } catch (err: any) {
      const msg = err.response?.message || err.message || 'Failed to update reminder';
      return { success: false, error: msg };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentPath,
        setCurrentPath,
        currentRole,
        setCurrentRole,
        currentFarmer,
        isAuthChecking,
        loginFarmer,
        loginDemo,
        resetDemoData,
        registerFarmer,
        logoutFarmer,
        crops,
        addCrop,
        updateCrop,
        deleteCrop,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        workers,
        addWorker,
        updateWorker,
        deleteWorker,
        waterRecords,
        addWaterRecord,
        deleteWaterRecord,
        fertilizerRecords,
        addFertilizerRecord,
        deleteFertilizerRecord,
        reminders,
        addReminder,
        deleteReminder,
        toggleReminderDone,
        todayReminders,
        toastMessage,
        showToast,
        backendStatus,
        refreshData: async () => {
          await checkSession();
        }
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
