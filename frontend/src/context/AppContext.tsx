import React, { createContext, useContext, useState, useEffect } from 'react';
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
  farmers: Farmer[];
  loginFarmer: (email: string, pass: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  registerFarmer: (data: Omit<Farmer, 'id' | 'createdAt' | 'status' | 'tenantId'>) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  logoutFarmer: () => void;
  switchToDemoFarmer: () => void;

  // Crops
  crops: Crop[];
  addCrop: (data: Omit<Crop, 'id' | 'farmerId' | 'createdAt'>) => { success: boolean; error?: string };
  updateCrop: (id: string, data: Partial<Crop>) => void;
  deleteCrop: (id: string) => { success: boolean; error?: string };

  // Expenses
  expenses: Expense[];
  addExpense: (data: Omit<Expense, 'id' | 'farmerId' | 'createdAt'>) => { success: boolean; error?: string };
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Workers
  workers: Worker[];
  addWorker: (data: Omit<Worker, 'id' | 'farmerId' | 'paymentAmount' | 'createdAt'>) => void;
  updateWorker: (id: string, data: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;

  // Water Records
  waterRecords: WaterRecord[];
  addWaterRecord: (data: Omit<WaterRecord, 'id' | 'farmerId' | 'createdAt'>) => void;
  deleteWaterRecord: (id: string) => void;

  // Fertilizer & Pesticide Records
  fertilizerRecords: FertilizerRecord[];
  addFertilizerRecord: (data: Omit<FertilizerRecord, 'id' | 'farmerId' | 'createdAt'>) => void;
  deleteFertilizerRecord: (id: string) => void;

  // Reminders
  reminders: Reminder[];
  addReminder: (data: Omit<Reminder, 'id' | 'farmerId' | 'isDone' | 'createdAt'>) => { success: boolean; error?: string };
  deleteReminder: (id: string) => void;
  toggleReminderDone: (id: string) => void;
  todayReminders: Reminder[];

  // UI Toast
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Demo Seed Data
const INITIAL_FARMER: Farmer = {
  id: 'f-patil-01',
  firstName: 'Rajesh',
  lastName: 'Patil',
  mobile: '9822014012',
  email: 'rajesh.patil@kisankhata.in',
  address: 'Sinnar Taluka, Nashik Rural',
  farmName: 'Patil Krishi Farm',
  state: 'Maharashtra',
  tenantId: 'Farm-MH-4012',
  totalAcres: 14,
  status: 'Active',
  createdAt: '12-01-2026'
};

const INITIAL_CROPS: Crop[] = [
  {
    id: 'crop-1',
    farmerId: 'f-patil-01',
    name: 'Original Ratnagiri Alphonso',
    category: 'Fruit',
    plantationDate: '15-06-2023',
    durationDays: 365,
    description: 'GI tagged high aromatic mango orchard on laterite red soil',
    acresPlanted: 5,
    expectedYield: '450 Dozen',
    createdAt: '15-06-2023'
  },
  {
    id: 'crop-2',
    farmerId: 'f-patil-01',
    name: 'Bhagwa Pomegranate',
    category: 'Fruit',
    plantationDate: '10-08-2025',
    durationDays: 180,
    description: '14 acres dense plantation with high quality export arils',
    acresPlanted: 6,
    expectedYield: '18 Metric Tonnes',
    createdAt: '10-08-2025'
  },
  {
    id: 'crop-3',
    farmerId: 'f-patil-01',
    name: 'Sharbati Golden Wheat',
    category: 'Grain',
    plantationDate: '05-11-2025',
    durationDays: 120,
    description: 'Rabi winter season organic certified farm parcel with canal feeder',
    acresPlanted: 3,
    expectedYield: '45 Quintals',
    createdAt: '05-11-2025'
  }
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    farmerId: 'f-patil-01',
    cropId: 'crop-2',
    cropName: 'Bhagwa Pomegranate',
    category: 'Tractor & Diesel',
    details: 'Tractor diesel for bed formation & soil aerating (45 Litres)',
    date: '08-10-2026',
    amount: 4250,
    quantity: '45 Litres',
    createdAt: '08-10-2026'
  },
  {
    id: 'exp-2',
    farmerId: 'f-patil-01',
    cropId: 'crop-1',
    cropName: 'Original Ratnagiri Alphonso',
    category: 'Fertilizers',
    details: 'Organic neem cake compost & micronutrient manure 20 bags',
    date: '04-10-2026',
    amount: 8600,
    quantity: '20 bags',
    createdAt: '04-10-2026'
  },
  {
    id: 'exp-3',
    farmerId: 'f-patil-01',
    cropId: 'crop-2',
    cropName: 'Bhagwa Pomegranate',
    category: 'Labour',
    details: 'Manual weeding & ridge soil loosening labor (3 workers)',
    date: '28-09-2026',
    amount: 3400,
    quantity: '3 workers',
    createdAt: '28-09-2026'
  },
  {
    id: 'exp-4',
    farmerId: 'f-patil-01',
    cropId: 'crop-3',
    cropName: 'Sharbati Golden Wheat',
    category: 'Seeds',
    details: 'Certified rust-resistant seed grain bags (60 kg)',
    date: '18-09-2026',
    amount: 4800,
    quantity: '60 kg seeds',
    createdAt: '18-09-2026'
  },
  {
    id: 'exp-5',
    farmerId: 'f-patil-01',
    cropId: 'crop-2',
    cropName: 'Bhagwa Pomegranate',
    category: 'Pesticides & Sprays',
    details: 'Neem botanical spray & bio-fungicide for thrips control',
    date: '02-10-2026',
    amount: 3200,
    quantity: '3 Litres formulation',
    createdAt: '02-10-2026'
  },
  {
    id: 'exp-6',
    farmerId: 'f-patil-01',
    cropId: 'crop-2',
    cropName: 'Bhagwa Pomegranate',
    category: 'Labour',
    details: 'Manual weeding & bed soil aeration crew (4 workers)',
    date: '25-09-2026',
    amount: 4000,
    quantity: '4 workers',
    createdAt: '25-09-2026'
  },
  {
    id: 'exp-7',
    farmerId: 'f-patil-01',
    cropId: 'crop-3',
    cropName: 'Sharbati Golden Wheat',
    category: 'Crop Cutting / Harvesting',
    details: 'Combine harvester rental & manual sickle cutting labour',
    date: '10-10-2026',
    amount: 7500,
    createdAt: '10-10-2026'
  },
  {
    id: 'exp-8',
    farmerId: 'f-patil-01',
    cropId: 'crop-3',
    cropName: 'Sharbati Golden Wheat',
    category: 'Transport',
    details: 'Tractor trolley transport to APMC grain yard & 50 gunny bags',
    date: '11-10-2026',
    amount: 2800,
    quantity: '50 bags',
    createdAt: '11-10-2026'
  }
];

const INITIAL_WORKERS: Worker[] = [
  {
    id: 'wrk-1',
    farmerId: 'f-patil-01',
    name: 'Shankar Kadam',
    contact: '9823011234',
    daysWorked: 18,
    dailyWage: 450,
    paymentAmount: 8100,
    email: 'shankar.k@ruralmail.in',
    address: 'Dindori, Nashik Rural',
    upiId: 'shankarkadam@upi',
    createdAt: '01-09-2026'
  },
  {
    id: 'wrk-2',
    farmerId: 'f-patil-01',
    name: 'Baburao Shinde',
    contact: '9823055678',
    daysWorked: 14,
    dailyWage: 500,
    paymentAmount: 7000,
    address: 'Niphad, Nashik',
    upiId: 'baburao.shinde@oksbi',
    createdAt: '05-09-2026'
  },
  {
    id: 'wrk-3',
    farmerId: 'f-patil-01',
    name: 'Sangeeta Bai',
    contact: '9823099123',
    daysWorked: 22,
    dailyWage: 400,
    paymentAmount: 8800,
    address: 'Pimpalgaon Baswant',
    createdAt: '02-09-2026'
  }
];

const INITIAL_WATER: WaterRecord[] = [
  {
    id: 'wtr-1',
    farmerId: 'f-patil-01',
    plotName: 'Plot-1 (North Pomegranate Block)',
    withFertilizer: true,
    quantity: 4,
    unit: 'Hours',
    date: '10-10-2026',
    createdAt: '10-10-2026'
  },
  {
    id: 'wtr-2',
    farmerId: 'f-patil-01',
    plotName: 'Plot-2 (Alphonso Terrace)',
    withFertilizer: false,
    quantity: 6,
    unit: 'Hours',
    date: '06-10-2026',
    createdAt: '06-10-2026'
  }
];

const INITIAL_FERT: FertilizerRecord[] = [
  {
    id: 'fert-1',
    farmerId: 'f-patil-01',
    plotName: 'Plot-1',
    productName: 'Neem Oil Organic Botanical 10000 PPM',
    quantity: 600,
    unit: 'ml',
    date: '07-10-2026',
    createdAt: '07-10-2026'
  },
  {
    id: 'fert-2',
    farmerId: 'f-patil-01',
    plotName: 'Plot-2',
    productName: 'Bio-NPK Consortium Culture',
    quantity: 3,
    unit: 'kg',
    date: '02-10-2026',
    createdAt: '02-10-2026'
  }
];

// Today's date in YYYY-MM-DD
const TODAY_STR = new Date().toISOString().split('T')[0];

const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    farmerId: 'f-patil-01',
    description: 'Check vegetative leaf growth and apply neem bio-spray for Plot 1',
    date: TODAY_STR,
    time: '07:30',
    isDone: false,
    createdAt: '08-10-2026'
  },
  {
    id: 'rem-2',
    farmerId: 'f-patil-01',
    description: 'Inspect flowering panicles for mango hopper & apply organic spray if needed',
    date: '2026-10-16',
    time: '16:00',
    isDone: false,
    createdAt: '09-10-2026'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentPath, setCurrentPath] = useState<NavigationPath>('home');
  const [currentRole, setCurrentRole] = useState<Role>('farmer');

  // Auth
  const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(INITIAL_FARMER);
  const [farmers, setFarmers] = useState<Farmer[]>([INITIAL_FARMER]);

  // Data Collections
  const [crops, setCrops] = useState<Crop[]>(() => {
    const saved = localStorage.getItem('kk_crops');
    return saved ? JSON.parse(saved) : INITIAL_CROPS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('kk_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('kk_workers');
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  const [waterRecords, setWaterRecords] = useState<WaterRecord[]>(() => {
    const saved = localStorage.getItem('kk_water');
    return saved ? JSON.parse(saved) : INITIAL_WATER;
  });

  const [fertilizerRecords, setFertilizerRecords] = useState<FertilizerRecord[]>(() => {
    const saved = localStorage.getItem('kk_fert');
    return saved ? JSON.parse(saved) : INITIAL_FERT;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('kk_reminders');
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Sync state to localStorage
  useEffect(() => { localStorage.setItem('kk_crops', JSON.stringify(crops)); }, [crops]);
  useEffect(() => { localStorage.setItem('kk_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('kk_workers', JSON.stringify(workers)); }, [workers]);
  useEffect(() => { localStorage.setItem('kk_water', JSON.stringify(waterRecords)); }, [waterRecords]);
  useEffect(() => { localStorage.setItem('kk_fert', JSON.stringify(fertilizerRecords)); }, [fertilizerRecords]);
  useEffect(() => { localStorage.setItem('kk_reminders', JSON.stringify(reminders)); }, [reminders]);

  // Today's reminders calculation
  const todayReminders = reminders.filter(r => !r.isDone && r.date === TODAY_STR);

  // Farmer Auth (Connected to Live API with offline fallback)
  const loginFarmer = async (email: string, pass: string) => {
    try {
      const res = await api.auth.login({ email, password: pass });
      if (res.success && res.data) {
        const u = res.data;
        const liveFarmer: Farmer = {
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          mobile: u.mobile,
          email: u.email,
          address: u.address || 'Nashik Rural',
          farmName: u.farmName || `${u.firstName} Krishi Farm`,
          state: u.state || 'Maharashtra',
          tenantId: `Farm-${(u.state || 'MH').substring(0, 2).toUpperCase()}-${u.id.substring(0, 4)}`,
          totalAcres: 10,
          status: 'Active',
          createdAt: new Date().toLocaleDateString('en-GB')
        };
        setCurrentFarmer(liveFarmer);
        setCurrentRole('farmer');
        setCurrentPath('dashboard');
        showToast(`Welcome back, ${liveFarmer.firstName} ji!`, 'success');
        return { success: true };
      }
    } catch (err: any) {
      if (err.response?.message) {
        return { success: false, error: err.response.message };
      }
    }

    const f = farmers.find(item => item.email.toLowerCase() === email.toLowerCase());
    if (!f) {
      return { success: false, error: 'Email or password is incorrect' };
    }
    if (f.status === 'Disabled') {
      return { success: false, error: 'Account is disabled. Contact support.' };
    }
    if (pass.length < 6) {
      return { success: false, error: 'Email or password is incorrect' };
    }
    setCurrentFarmer(f);
    setCurrentRole('farmer');
    setCurrentPath('dashboard');
    showToast(`Welcome back, ${f.firstName} ji!`, 'success');
    return { success: true };
  };

  const registerFarmer = async (data: Omit<Farmer, 'id' | 'createdAt' | 'status' | 'tenantId'>) => {
    try {
      const res = await api.auth.registerFarmer({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        password: (data as any).password || 'Farmer@123',
        farmName: data.farmName,
        address: data.address,
        state: data.state
      });
      if (res.success && res.data) {
        const u = res.data;
        const newFarmer: Farmer = {
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          mobile: u.mobile,
          email: u.email,
          address: u.address,
          farmName: u.farmName,
          state: u.state,
          tenantId: `Farm-${(u.state || 'MH').substring(0, 2).toUpperCase()}-${u.id.substring(0, 4)}`,
          totalAcres: 10,
          status: 'Active',
          createdAt: new Date().toLocaleDateString('en-GB')
        };
        setFarmers(prev => [...prev, newFarmer]);
        setCurrentFarmer(newFarmer);
        setCurrentRole('farmer');
        setCurrentPath('dashboard');
        showToast('Farm registered successfully! Welcome to Krishi Khata.', 'success');
        return { success: true };
      }
    } catch (err: any) {
      if (err.response?.message) {
        return { success: false, error: err.response.message };
      }
    }

    const exists = farmers.some(item => item.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      return { success: false, error: 'This email is already registered.' };
    }
    if (data.mobile.length !== 10) {
      return { success: false, error: 'Mobile number must be exactly 10 digits.' };
    }
    const tenantId = `Farm-${data.state.substring(0, 2).toUpperCase() || 'IN'}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFarmer: Farmer = {
      ...data,
      id: 'farmer-' + Date.now(),
      tenantId,
      status: 'Active',
      createdAt: new Date().toLocaleDateString('en-GB')
    };
    setFarmers(prev => [...prev, newFarmer]);
    setCurrentFarmer(newFarmer);
    setCurrentRole('farmer');
    setCurrentPath('dashboard');
    showToast('Farm registered successfully! Welcome to Krishi Khata.', 'success');
    return { success: true };
  };

  const logoutFarmer = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    }
    setCurrentRole('visitor');
    setCurrentPath('home');
    showToast('Logged out from farm khata.', 'info');
  };

  const switchToDemoFarmer = () => {
    setCurrentFarmer(INITIAL_FARMER);
    setCurrentRole('farmer');
    setCurrentPath('dashboard');
    showToast('Switched to Demo Farmer: Rajesh Patil (Farm-MH-4012)', 'success');
  };

  // Crop Management (FR-CROP-01 to 05)
  const addCrop = (data: Omit<Crop, 'id' | 'farmerId' | 'createdAt'>) => {
    if (!currentFarmer) return { success: false, error: 'Farmer login required' };
    
    // Duplicate crop check: same name and plantation date
    const duplicate = crops.some(
      c => c.farmerId === currentFarmer.id &&
           c.name.trim().toLowerCase() === data.name.trim().toLowerCase() &&
           c.plantationDate === data.plantationDate
    );
    if (duplicate) {
      return { success: false, error: 'This crop is already added.' };
    }

    const newCrop: Crop = {
      ...data,
      id: 'crop-' + Date.now(),
      farmerId: currentFarmer.id,
      createdAt: new Date().toLocaleDateString('en-GB')
    };
    setCrops(prev => [newCrop, ...prev]);
    showToast('Crop saved successfully!', 'success');
    return { success: true };
  };

  const updateCrop = (id: string, data: Partial<Crop>) => {
    setCrops(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
    showToast('Crop details updated.', 'success');
  };

  const deleteCrop = (id: string) => {
    // Acceptance criteria FR-CROP-04: Cannot delete crop if it has expenses!
    const hasExpenses = expenses.some(e => e.cropId === id);
    if (hasExpenses) {
      return { success: false, error: 'This crop has expenses. Delete those expenses first.' };
    }
    setCrops(prev => prev.filter(c => c.id !== id));
    showToast('Crop deleted.', 'info');
    return { success: true };
  };

  // Expense Management (FR-EXP-01 to 05)
  const addExpense = (data: Omit<Expense, 'id' | 'farmerId' | 'createdAt'>) => {
    if (!currentFarmer) return { success: false, error: 'Farmer login required' };
    if (crops.length === 0) {
      return { success: false, error: 'Add a crop first.' };
    }
    if (data.amount <= 0 || data.amount > 9999999) {
      return { success: false, error: 'Amount must be between ₹1 and ₹99,99,999.' };
    }

    const newExp: Expense = {
      ...data,
      id: 'exp-' + Date.now(),
      farmerId: currentFarmer.id,
      createdAt: new Date().toLocaleDateString('en-GB')
    };
    setExpenses(prev => [newExp, ...prev]);
    showToast('Expense saved in ledger!', 'success');
    return { success: true };
  };

  const updateExpense = (id: string, data: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...data } : e)));
    showToast('Expense updated.', 'success');
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast('Expense record removed.', 'info');
  };

  // Worker Management (FR-WRK-01 to 05)
  const addWorker = (data: Omit<Worker, 'id' | 'farmerId' | 'paymentAmount' | 'createdAt'>) => {
    if (!currentFarmer) return;
    const paymentAmount = data.daysWorked * data.dailyWage;
    const newWorker: Worker = {
      ...data,
      id: 'wrk-' + Date.now(),
      farmerId: currentFarmer.id,
      paymentAmount,
      createdAt: new Date().toLocaleDateString('en-GB')
    };
    setWorkers(prev => [newWorker, ...prev]);
    showToast('Worker added with wage ledger.', 'success');
  };

  const updateWorker = (id: string, data: Partial<Worker>) => {
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
  };

  const deleteWorker = (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    showToast('Worker record deleted.', 'info');
  };

  // Water Records (FR-WTR-01 to 03)
  const addWaterRecord = (data: Omit<WaterRecord, 'id' | 'farmerId' | 'createdAt'>) => {
    if (!currentFarmer) return;
    const record: WaterRecord = {
      ...data,
      id: 'wtr-' + Date.now(),
      farmerId: currentFarmer.id,
      createdAt: new Date().toLocaleDateString('en-GB')
    };
    setWaterRecords(prev => [record, ...prev]);
    showToast('Water log saved.', 'success');
  };

  const deleteWaterRecord = (id: string) => {
    setWaterRecords(prev => prev.filter(w => w.id !== id));
    showToast('Water record removed.', 'info');
  };

  // Fertilizer Records (FR-PST-01 to 03)
  const addFertilizerRecord = (data: Omit<FertilizerRecord, 'id' | 'farmerId' | 'createdAt'>) => {
    if (!currentFarmer) return;
    const record: FertilizerRecord = {
      ...data,
      id: 'fert-' + Date.now(),
      farmerId: currentFarmer.id,
      createdAt: new Date().toLocaleDateString('en-GB')
    };
    setFertilizerRecords(prev => [record, ...prev]);
    showToast('Fertilizer/Pesticide log saved.', 'success');
  };

  const deleteFertilizerRecord = (id: string) => {
    setFertilizerRecords(prev => prev.filter(f => f.id !== id));
    showToast('Record removed.', 'info');
  };

  // Reminders (FR-REM-01 to 04)
  const addReminder = (data: Omit<Reminder, 'id' | 'farmerId' | 'isDone' | 'createdAt'>) => {
    if (!currentFarmer) return { success: false, error: 'Farmer login required' };
    
    // Check future date/time
    const reminderDate = new Date(`${data.date}T${data.time}`);
    const now = new Date();
    if (reminderDate < now) {
      return { success: false, error: 'Choose a future date and time' };
    }

    const rem: Reminder = {
      ...data,
      id: 'rem-' + Date.now(),
      farmerId: currentFarmer.id,
      isDone: false,
      createdAt: new Date().toLocaleDateString('en-GB')
    };
    setReminders(prev => [rem, ...prev]);
    showToast('Farm reminder scheduled.', 'success');
    return { success: true };
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    showToast('Reminder dismissed.', 'info');
  };

  const toggleReminderDone = (id: string) => {
    setReminders(prev => prev.map(r => (r.id === id ? { ...r, isDone: !r.isDone } : r)));
    showToast('Reminder updated.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentPath,
        setCurrentPath,
        currentRole,
        setCurrentRole,
        currentFarmer,
        farmers,
        loginFarmer,
        registerFarmer,
        logoutFarmer,
        switchToDemoFarmer,
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
        showToast
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
