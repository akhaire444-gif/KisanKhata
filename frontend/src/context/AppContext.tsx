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

  // Session Check (Verifies real session with backend)
  const checkSession = useCallback(async (): Promise<boolean> => {
    setIsAuthChecking(true);
    try {
      await api.auth.csrf();
      setBackendStatus('connected');
      const res = await api.auth.me();
      if (res && res.success && res.data) {
        const farmer = mapUserToFarmer(res.data);
        setCurrentFarmer(farmer);
        setCurrentRole('farmer');
        await loadFarmerData();
        return true;
      } else {
        setCurrentFarmer(null);
        setCurrentRole('visitor');
        return false;
      }
    } catch {
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

  // One-Click Demo Login: Real backend session & isolated database tenant
  const loginDemo = async () => {
    try {
      const res = await api.auth.demo();
      if (res && res.success && res.data) {
        const demoFarmer = mapUserToFarmer(res.data);
        setCurrentFarmer(demoFarmer);
        setCurrentRole('farmer');
        setCurrentPath('dashboard');
        showToast('Entered Demo Account: Green Valley Demonstration Farm', 'success');
        await loadFarmerData();
        return { success: true };
      }
      return { success: false, error: res?.message || 'Demo login failed' };
    } catch (err: any) {
      const msg = err.response?.message || err.message || 'Demo access failed';
      return { success: false, error: msg };
    }
  };

  // Reset Demo Data: Restore clean agricultural sample data in demo tenant
  const resetDemoData = async () => {
    try {
      const res = await api.auth.resetDemo();
      if (res && res.success && res.data) {
        const demoFarmer = mapUserToFarmer(res.data);
        setCurrentFarmer(demoFarmer);
        showToast('Sample agricultural data reset to original baseline.', 'info');
        await loadFarmerData();
        return { success: true };
      }
      return { success: false, error: res?.message || 'Reset failed' };
    } catch (err: any) {
      const msg = err.response?.message || err.message || 'Reset failed';
      return { success: false, error: msg };
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
