import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Crop, Expense, Worker, FertilizerRecord, Reminder, ExpenseCategory } from '../../types';
import { EXPENSE_CATEGORIES_CONFIG } from '../../constants/expenseCategories';

type FarmerTab = 
  | 'overview' 
  | 'expenses' 
  | 'crops' 
  | 'workers' 
  | 'fertilizer' 
  | 'reminders' 
  | 'reports' 
  | 'help';

export const FarmerDashboard: React.FC = () => {
  const {
    currentPath,
    setCurrentPath,
    currentFarmer,
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
    fertilizerRecords,
    addFertilizerRecord,
    deleteFertilizerRecord,
    reminders,
    addReminder,
    deleteReminder,
    toggleReminderDone,
    todayReminders,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<FarmerTab>(() => {
    if (['overview', 'crops', 'expenses', 'workers', 'fertilizer', 'reminders', 'reports', 'help'].includes(currentPath)) {
      return (currentPath === 'dashboard' || currentPath === 'home' ? 'overview' : currentPath) as FarmerTab;
    }
    return 'overview';
  });

  // Expense filter states
  const [expenseCropFilter, setExpenseCropFilter] = useState<string>('all');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [expenseSearchQuery, setExpenseSearchQuery] = useState<string>('');

  // Sync tab with route path
  React.useEffect(() => {
    if (['overview', 'crops', 'expenses', 'workers', 'fertilizer', 'reminders', 'reports', 'help'].includes(currentPath)) {
      setActiveTab(currentPath as FarmerTab);
    } else if (currentPath === 'dashboard' || currentPath === 'home') {
      setActiveTab('overview');
    }
  }, [currentPath]);

  const handleTabChange = (tab: FarmerTab) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      setCurrentPath('dashboard');
    } else {
      setCurrentPath(tab as any);
    }
  };

  // Form modals state
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  const [showAddFertModal, setShowAddFertModal] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);

  // Report filter states
  const [reportType, setReportType] = useState<'date' | 'crop' | 'worker'>('date');
  const [reportFromDate, setReportFromDate] = useState('2026-09-01');
  const [reportToDate, setReportToDate] = useState('2026-10-31');
  const [reportSelectedCrop, setReportSelectedCrop] = useState(crops[0]?.id || '');
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Form submission loading state to prevent double submits (FR-EXP-05)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Temporary delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'crop' | 'expense' | 'worker' | 'fert' | 'reminder';
    id: string;
    title: string;
  } | null>(null);

  // Date helper
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const totalExpenseSum = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalWorkerWages = workers.reduce((acc, w) => acc + w.paymentAmount, 0);

  // Computed expenses for the Expenses Khata tab
  const filteredExpenses = expenses.filter(exp => {
    if (expenseCropFilter !== 'all' && exp.cropId !== expenseCropFilter) return false;
    if (expenseCategoryFilter !== 'all' && exp.category !== expenseCategoryFilter) return false;
    if (expenseSearchQuery.trim()) {
      const q = expenseSearchQuery.toLowerCase();
      const matchDetails = exp.details.toLowerCase().includes(q);
      const matchCrop = exp.cropName.toLowerCase().includes(q);
      const matchCat = exp.category.toLowerCase().includes(q);
      if (!matchDetails && !matchCrop && !matchCat) return false;
    }
    return true;
  });

  const filteredExpenseSum = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category totals across all logged expenses
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach(e => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
  });

  // Delete handler
  const executeDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'crop') {
      const res = await deleteCrop(deleteConfirm.id);
      if (!res.success) {
        showToast(res.error || 'Cannot delete crop', 'error');
      }
    } else if (deleteConfirm.type === 'expense') {
      deleteExpense(deleteConfirm.id);
    } else if (deleteConfirm.type === 'worker') {
      deleteWorker(deleteConfirm.id);
    } else if (deleteConfirm.type === 'fert') {
      deleteFertilizerRecord(deleteConfirm.id);
    } else if (deleteConfirm.type === 'reminder') {
      deleteReminder(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#f9f9ff] py-6 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header Bar for Farmer */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e7eeff] mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-[#a1f4c8] text-[#1b724f] font-bold text-[12px]">
              Tenant: {currentFarmer?.tenantId || 'Farm Ledger'}
            </span>
            <span className="text-[12px] text-[#414844] font-medium">{todayFormatted}</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-[#012d1d]">
            Namaste, {currentFarmer ? `${currentFarmer.firstName} ${currentFarmer.lastName}`.trim() : 'Farmer'} ji
          </h1>
          <p className="text-[14px] text-[#414844]">
            {currentFarmer?.farmName || 'My Farm'} • {currentFarmer?.address || currentFarmer?.state || 'Bharat'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#012d1d] text-white shadow-sm'
                : 'bg-[#f0f3ff] text-[#414844] hover:bg-[#e7eeff]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={logoutFarmer}
            className="px-4 py-2.5 rounded-xl bg-[#ffdad6]/60 text-[#ba1a1a] hover:bg-[#ffdad6] font-bold text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* FR-REM-04: Highlighted banner for reminders due today or overdue */}
      {todayReminders.length > 0 && (
        <div className="mb-6 rounded-2xl bg-[#ffdcc3] border-l-8 border-[#f48c24] p-4.5 text-[#2f1500] shadow-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-[#f48c24] text-[28px] shrink-0">
            notification_important
          </span>
          <div className="flex-1">
            <h3 className="font-bold text-[16px] text-[#3e1e00]">
              Notice: You have {todayReminders.length} task(s) scheduled for today!
            </h3>
            <ul className="mt-1 space-y-1 text-[14px]">
              {todayReminders.map(r => (
                <li key={r.id} className="flex items-center justify-between">
                  <span>• {r.description} ({r.time})</span>
                  <button
                    onClick={() => toggleReminderDone(r.id)}
                    className="text-[12px] font-bold text-[#116c4a] underline ml-2 cursor-pointer"
                  >
                    Mark Done
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setActiveTab('reminders')}
            className="px-3 py-1.5 rounded-lg bg-[#3e1e00] text-white text-[12px] font-bold shrink-0 cursor-pointer"
          >
            View Reminders
          </button>
        </div>
      )}

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {[
          { id: 'overview', label: '📊 Farm Summary (कुल सारांश)', icon: 'grid_view' },
          { id: 'expenses', label: '📋 All Expenses Khata (खर्चा बही)', icon: 'currency_rupee' },
          { id: 'crops', label: '🌱 Crops (फसलें)', icon: 'yard' },
          { id: 'workers', label: '👥 Worker Daily Wages (मजदूरी हिसाब)', icon: 'groups' },
          { id: 'fertilizer', label: '🧪 Fertilizers & Sprays (खाद व स्प्रे)', icon: 'science' },
          { id: 'reminders', label: '🔔 Reminders (रिमाइंडर)', icon: 'alarm' },
          { id: 'reports', label: '📄 Reports & Print (प्रिंट रिपोर्ट)', icon: 'receipt_long' },
          { id: 'help', label: '❓ Help Guide (सहायता)', icon: 'help_outline' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as FarmerTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13px] whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
              activeTab === tab.id
                ? 'bg-[#1b4332] text-white shadow-sm'
                : 'bg-white text-[#414844] hover:bg-[#f0f3ff] border border-[#e7eeff]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e7eeff] shadow-xs">
              <div className="flex items-center justify-between text-[#414844] text-[13px] mb-2">
                <span>Active Crops</span>
                <span className="material-symbols-outlined text-[#116c4a] text-[22px]">yard</span>
              </div>
              <div className="text-[26px] font-bold text-[#012d1d]">{crops.length}</div>
              <div className="text-[12px] text-[#116c4a] font-medium mt-1">Sowing to yield cycle</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e7eeff] shadow-xs">
              <div className="flex items-center justify-between text-[#414844] text-[13px] mb-2">
                <span>Total Expenses</span>
                <span className="material-symbols-outlined text-[#ba1a1a] text-[22px]">payments</span>
              </div>
              <div className="text-[26px] font-bold text-[#012d1d]">₹{totalExpenseSum.toLocaleString('en-IN')}</div>
              <div className="text-[12px] text-[#414844] font-medium mt-1">{expenses.length} ledger entries</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e7eeff] shadow-xs">
              <div className="flex items-center justify-between text-[#414844] text-[13px] mb-2">
                <span>Labor Wage Ledger</span>
                <span className="material-symbols-outlined text-[#1b724f] text-[22px]">engineering</span>
              </div>
              <div className="text-[26px] font-bold text-[#012d1d]">₹{totalWorkerWages.toLocaleString('en-IN')}</div>
              <div className="text-[12px] text-[#414844] font-medium mt-1">{workers.length} active workers</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e7eeff] shadow-xs">
              <div className="flex items-center justify-between text-[#414844] text-[13px] mb-2">
                <span>Spray / Inputs Logs</span>
                <span className="material-symbols-outlined text-[#3f6653] text-[22px]">eco</span>
              </div>
              <div className="text-[26px] font-bold text-[#012d1d]">{fertilizerRecords.length}</div>
              <div className="text-[12px] text-[#414844] font-medium mt-1">Recorded field applications</div>
            </div>
          </div>

          {/* Quick Expense Khata Banner */}
          <div className="bg-gradient-to-r from-[#012d1d] to-[#1b4332] rounded-3xl p-6 sm:p-7 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#a1f4c8]/30">
            <div className="space-y-1.5 max-w-xl">
              <span className="px-3 py-1 rounded-full bg-[#a1f4c8] text-[#002113] text-[11px] font-bold uppercase tracking-wider inline-block">
                Simple Farm Khata
              </span>
              <h3 className="text-[20px] sm:text-[22px] font-bold text-white tracking-tight">
                Record & Track All Crop Expenses in One Place
              </h3>
              <p className="text-[14px] text-[#86af99] leading-relaxed">
                Log and monitor farming costs directly: <strong>Seeds, Fertilizers, Pesticides & Sprays, Worker Wages, Harvesting, Tractor & Diesel, and Mandi Transport</strong>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  if (crops.length === 0) {
                    showToast('Please add a crop first!', 'error');
                    setActiveTab('crops');
                    return;
                  }
                  setEditingExpense(null);
                  setShowAddExpenseModal(true);
                }}
                className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#a1f4c8] text-[#002113] font-bold text-[14px] hover:bg-[#86d7ad] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Add Expense</span>
              </button>
              <button
                onClick={() => handleTabChange('expenses')}
                className="min-h-[46px] px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[14px] transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                <span>Open Expenses Khata</span>
              </button>
            </div>
          </div>

          {/* 7 Core Touch Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { id: 'expenses', label: 'Expenses Khata', icon: 'currency_rupee', desc: 'Add & review bills', color: 'bg-[#a1f4c8] text-[#1b724f]' },
              { id: 'crops', label: 'Crops Management', icon: 'yard', desc: `${crops.length} Registered crops`, color: 'bg-[#c1ecd4] text-[#274e3d]' },
              { id: 'workers', label: 'Worker Daily Wages', icon: 'groups', desc: 'Attendance & payouts', color: 'bg-[#ffdcc3] text-[#6e3900]' },
              { id: 'fertilizer', label: 'Fertilizer / Sprays', icon: 'science', desc: 'Bio & chemical inputs', color: 'bg-[#dee8ff] text-[#012d1d]' },
              { id: 'reminders', label: 'Reminders & Alerts', icon: 'alarm', desc: `${reminders.length} Active scheduled`, color: 'bg-[#ffdcc3] text-[#6e3900]' },
              { id: 'reports', label: 'Expense Reports', icon: 'receipt_long', desc: 'Printable summaries', color: 'bg-[#c1ecd4] text-[#274e3d]' },
              { id: 'help', label: 'Help Guide', icon: 'help_outline', desc: 'Plain-language steps', color: 'bg-[#f0f3ff] text-[#414844]' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as FarmerTab)}
                className="bg-white p-5 rounded-2xl border border-[#e7eeff] hover:border-[#116c4a] hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[120px] cursor-pointer group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                  <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-[#012d1d] group-hover:text-[#116c4a] transition-colors">
                    {item.label}
                  </h4>
                  <p className="text-[12px] text-[#414844] mt-0.5">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Recent Expenses & Recent Workers preview split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Expenses */}
            <div className="bg-white p-6 rounded-3xl border border-[#e7eeff] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[18px] text-[#012d1d]">Recent Crop Expenses</h3>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className="text-[13px] font-bold text-[#116c4a] hover:underline cursor-pointer"
                >
                  View All ({expenses.length})
                </button>
              </div>

              <div className="space-y-3">
                {expenses.slice(0, 4).map(exp => (
                  <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f0f3ff] text-[13px]">
                    <div>
                      <span className="font-bold text-[#012d1d] block">{exp.details}</span>
                      <span className="text-[#414844] text-[11px]">{exp.cropName} • {exp.date}</span>
                    </div>
                    <span className="font-bold text-[15px] text-[#012d1d]">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Worker Summary */}
            <div className="bg-white p-6 rounded-3xl border border-[#e7eeff] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[18px] text-[#012d1d]">Worker Roll & Wages</h3>
                <button
                  onClick={() => setActiveTab('workers')}
                  className="text-[13px] font-bold text-[#116c4a] hover:underline cursor-pointer"
                >
                  Manage Workers ({workers.length})
                </button>
              </div>

              <div className="space-y-3">
                {workers.map(w => (
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f0f3ff] text-[13px]">
                    <div>
                      <span className="font-bold text-[#012d1d] block">{w.name}</span>
                      <span className="text-[#414844] text-[11px]">{w.daysWorked} days @ ₹{w.dailyWage}/day</span>
                    </div>
                    <span className="font-bold text-[15px] text-[#116c4a]">
                      ₹{w.paymentAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CROPS MANAGEMENT */}
      {activeTab === 'crops' && (
        <div className="bg-white rounded-3xl p-6 border border-[#e7eeff] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#f0f3ff]">
            <div>
              <h2 className="text-[22px] font-bold text-[#012d1d]">My Crops</h2>
              <p className="text-[14px] text-[#414844]">
                Register plots, plantation dates, and harvest durations for accurate cost accounting.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCrop(null);
                setShowAddCropModal(true);
              }}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#012d1d] text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#1b4332] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Add New Crop</span>
            </button>
          </div>

          {crops.length === 0 ? (
            <div className="text-center py-12 bg-[#f0f3ff] rounded-2xl p-6">
              <span className="material-symbols-outlined text-[#717973] text-[48px] mb-2">yard</span>
              <p className="text-[16px] font-bold text-[#012d1d]">No crops added yet.</p>
              <p className="text-[14px] text-[#414844] mb-4">Add your first crop to start tracking farm expenses.</p>
              <button
                onClick={() => setShowAddCropModal(true)}
                className="px-6 py-2.5 rounded-xl bg-[#012d1d] text-white font-bold text-[14px] cursor-pointer"
              >
                Add Your First Crop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {crops.map(c => {
                const cropExpenses = expenses.filter(e => e.cropId === c.id);
                const cropExpTotal = cropExpenses.reduce((sum, e) => sum + e.amount, 0);

                return (
                  <div key={c.id} className="p-5 rounded-2xl bg-[#f0f3ff] border border-[#d8e3fb] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#c1ecd4] text-[#274e3d] text-[11px] font-bold">
                          {c.category}
                        </span>
                        <span className="text-[12px] text-[#414844] font-medium">Planted: {c.plantationDate}</span>
                      </div>
                      <h3 className="font-bold text-[18px] text-[#012d1d] mb-1">{c.name}</h3>
                      <p className="text-[13px] text-[#414844] mb-3">{c.description || 'No description provided.'}</p>
                      <div className="text-[12px] text-[#414844] bg-white p-2.5 rounded-xl border border-[#e7eeff] space-y-1">
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-bold text-[#012d1d]">{c.durationDays} Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expenses Logged:</span>
                          <span className="font-bold text-[#116c4a]">₹{cropExpTotal.toLocaleString('en-IN')} ({cropExpenses.length})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[#d8e3fb]/60">
                      <button
                        onClick={() => {
                          setEditingCrop(c);
                          setShowAddCropModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white text-[#012d1d] font-bold text-[12px] border border-[#d8e3fb] hover:bg-[#dee8ff] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'crop',
                            id: c.id,
                            title: `Delete crop "${c.name}"?`
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-white text-[#ba1a1a] font-bold text-[12px] border border-[#ffdad6] hover:bg-[#ffdad6]/40 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. EXPENSES KHATA */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Category Breakdown Cards Strip */}
          <div className="bg-white rounded-3xl p-6 border border-[#e7eeff] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-[17px] font-bold text-[#012d1d]">Category Breakdown (श्रेणीवार खर्चा)</h3>
                <p className="text-[13px] text-[#414844]">Tap any category to filter the expense ledger below.</p>
              </div>
              {expenseCategoryFilter !== 'all' && (
                <button
                  onClick={() => setExpenseCategoryFilter('all')}
                  className="text-[12px] font-bold text-[#116c4a] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  <span>Clear Category Filter ({expenseCategoryFilter})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {EXPENSE_CATEGORIES_CONFIG.map(cat => {
                const total = expensesByCategory[cat.category] || 0;
                const isSelected = expenseCategoryFilter === cat.category;
                return (
                  <button
                    key={cat.category}
                    onClick={() => setExpenseCategoryFilter(isSelected ? 'all' : cat.category)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#012d1d] bg-[#f0f9f4] shadow-xs ring-2 ring-[#012d1d]'
                        : 'border-[#e7eeff] bg-white hover:border-[#a1f4c8] hover:bg-[#fafffb]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.badgeBg} ${cat.badgeText}`}>
                        <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#116c4a]"></span>
                      )}
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-[#012d1d] truncate" title={cat.category}>
                        {cat.category}
                      </div>
                      <div className="text-[11px] text-[#717973] mb-1">
                        {cat.hindiName}
                      </div>
                      <div className="text-[13px] font-bold text-[#116c4a] font-numeric-table">
                        ₹{total.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ledger Section with Filters & Add Button */}
          <div className="bg-white rounded-3xl p-6 border border-[#e7eeff] shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#f0f3ff]">
              <div>
                <h2 className="text-[22px] font-bold text-[#012d1d]">Farm Expenses Ledger</h2>
                <p className="text-[14px] text-[#414844]">
                  Showing <strong>{filteredExpenses.length}</strong> of {expenses.length} entries • Filtered Total: <strong className="text-[#012d1d]">₹{filteredExpenseSum.toLocaleString('en-IN')}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    if (crops.length === 0) {
                      showToast('Please add a crop first!', 'error');
                      setActiveTab('crops');
                      return;
                    }
                    setEditingExpense(null);
                    setShowAddExpenseModal(true);
                  }}
                  className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#012d1d] text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#1b4332] transition-colors shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span>Add Expense</span>
                </button>
              </div>
            </div>

            {/* Filter controls row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Filter by Crop */}
              <div>
                <label className="block text-[12px] font-bold text-[#414844] mb-1">Filter by Crop</label>
                <select
                  value={expenseCropFilter}
                  onChange={e => setExpenseCropFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d8e3fb] text-[13px] bg-white"
                >
                  <option value="all">All Crops (सभी फसलें)</option>
                  {crops.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Category */}
              <div>
                <label className="block text-[12px] font-bold text-[#414844] mb-1">Filter by Category</label>
                <select
                  value={expenseCategoryFilter}
                  onChange={e => setExpenseCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d8e3fb] text-[13px] bg-white"
                >
                  <option value="all">All Categories (सभी खर्चे)</option>
                  <option value="Seeds">Seeds (बीज)</option>
                  <option value="Fertilizers">Fertilizers (उर्वरक / खाद)</option>
                  <option value="Pesticides & Sprays">Pesticides & Sprays (कीटनाशक)</option>
                  <option value="Labour">Labour (मजदूरी)</option>
                  <option value="Crop Cutting / Harvesting">Crop Cutting / Harvesting (कटाई)</option>
                  <option value="Tractor & Diesel">Tractor & Diesel (ट्रैक्टर / डीजल)</option>
                  <option value="Transport">Transport (मंडी भाड़ा)</option>
                  <option value="Other">Other (अन्य)</option>
                </select>
              </div>

              {/* Search Query */}
              <div>
                <label className="block text-[12px] font-bold text-[#414844] mb-1">Search Details / Bills</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#717973] text-[18px]">search</span>
                  <input
                    type="text"
                    value={expenseSearchQuery}
                    onChange={e => setExpenseSearchQuery(e.target.value)}
                    placeholder="Search by vendor, item, etc..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#d8e3fb] text-[13px]"
                  />
                  {expenseSearchQuery && (
                    <button
                      onClick={() => setExpenseSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-[#717973] hover:text-[#012d1d]"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 bg-[#f0f3ff] rounded-2xl p-6">
                <span className="material-symbols-outlined text-[#717973] text-[48px] mb-2">payments</span>
                <p className="text-[16px] font-bold text-[#012d1d]">No expenses match your filters.</p>
                <p className="text-[14px] text-[#414844] mb-4">
                  {expenses.length === 0
                    ? 'Start recording seeds, fertilizer, diesel, and labor bills.'
                    : 'Try clearing the search or category filter.'}
                </p>
                {(expenseCropFilter !== 'all' || expenseCategoryFilter !== 'all' || expenseSearchQuery) && (
                  <button
                    onClick={() => {
                      setExpenseCropFilter('all');
                      setExpenseCategoryFilter('all');
                      setExpenseSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#012d1d] text-white text-[13px] font-bold cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#d8e3fb] bg-[#f0f3ff] text-[12px] font-bold uppercase tracking-wider text-[#414844]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Crop</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4 text-right">Amount (₹)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7eeff] text-[14px]">
                    {filteredExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-[#f9f9ff] transition-colors">
                        <td className="py-3.5 px-4 font-medium text-[#111c2d] whitespace-nowrap">{exp.date}</td>
                        <td className="py-3.5 px-4 font-bold text-[#012d1d] whitespace-nowrap">{exp.cropName}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md bg-[#e7eeff] text-[#012d1d] text-[12px] font-semibold">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#414844] max-w-xs">{exp.details}</td>
                        <td className="py-3.5 px-4 text-[#717973] text-[13px] whitespace-nowrap">
                          {exp.quantity || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-[15px] text-[#012d1d] font-numeric-table whitespace-nowrap">
                          ₹{exp.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingExpense(exp);
                              setShowAddExpenseModal(true);
                            }}
                            className="text-[#116c4a] hover:underline font-bold text-[12px] mr-3 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'expense',
                                id: exp.id,
                                title: `Delete expense of ₹${exp.amount} for "${exp.details}"?`
                              })
                            }
                            className="text-[#ba1a1a] hover:underline font-bold text-[12px] cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#f0f3ff] font-bold text-[#012d1d]">
                      <td colSpan={5} className="py-3.5 px-4 text-right">
                        {expenseCropFilter !== 'all' || expenseCategoryFilter !== 'all' || expenseSearchQuery
                          ? 'Filtered Total:'
                          : 'Total Farm Expenses:'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-numeric-table text-[16px]">
                        ₹{filteredExpenseSum.toLocaleString('en-IN')}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. WORKER MANAGEMENT */}
      {activeTab === 'workers' && (
        <div className="bg-white rounded-3xl p-6 border border-[#e7eeff] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#f0f3ff]">
            <div>
              <h2 className="text-[22px] font-bold text-[#012d1d]">Worker Daily Wages & Attendance</h2>
              <p className="text-[14px] text-[#414844]">
                Auto-calculated: <strong>Days Worked × Daily Wage = Payment Amount</strong>
              </p>
            </div>
            <button
              onClick={() => {
                setEditingWorker(null);
                setShowAddWorkerModal(true);
              }}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#012d1d] text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#1b4332] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>Add Worker</span>
            </button>
          </div>

          {workers.length === 0 ? (
            <div className="text-center py-12 bg-[#f0f3ff] rounded-2xl p-6">
              <span className="material-symbols-outlined text-[#717973] text-[48px] mb-2">groups</span>
              <p className="text-[16px] font-bold text-[#012d1d]">No workers added yet.</p>
              <p className="text-[14px] text-[#414844] mb-4">Add your farm workers to calculate wages and track payouts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map(w => (
                <div key={w.id} className="p-5 rounded-2xl bg-[#f0f3ff] border border-[#d8e3fb] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[17px] text-[#012d1d]">{w.name}</span>
                      <span className="px-2 py-0.5 rounded bg-white text-[#116c4a] text-[12px] font-bold border border-[#d8e3fb]">
                        {w.contact}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[13px] text-[#414844] bg-white p-3 rounded-xl border border-[#e7eeff] my-3">
                      <div className="flex justify-between">
                        <span>Days Worked:</span>
                        <strong className="text-[#012d1d]">{w.daysWorked} days</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily Wage Rate:</span>
                        <strong className="text-[#012d1d]">₹{w.dailyWage} / day</strong>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-[#f0f3ff]">
                        <span className="font-bold text-[#012d1d]">Payment Amount:</span>
                        <strong className="text-[#116c4a] text-[15px]">₹{w.paymentAmount.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>

                    {w.upiId && (
                      <p className="text-[12px] text-[#414844] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-[#116c4a]">account_balance_wallet</span>
                        UPI: {w.upiId}
                      </p>
                    )}
                    {w.address && (
                      <p className="text-[12px] text-[#414844] mt-0.5">Address: {w.address}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-[#d8e3fb]/60">
                    <button
                      onClick={() => {
                        setEditingWorker(w);
                        setShowAddWorkerModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white text-[#012d1d] font-bold text-[12px] border border-[#d8e3fb] hover:bg-[#dee8ff] cursor-pointer"
                    >
                      Update Days / Wage
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          type: 'worker',
                          id: w.id,
                          title: `Delete worker record for "${w.name}"?`
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-white text-[#ba1a1a] font-bold text-[12px] border border-[#ffdad6] hover:bg-[#ffdad6]/40 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* 6. FERTILIZER & PESTICIDE */}
      {activeTab === 'fertilizer' && (
        <div className="bg-white rounded-3xl p-6 border border-[#e7eeff] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#f0f3ff]">
            <div>
              <h2 className="text-[22px] font-bold text-[#012d1d]">Fertilizer & Pesticide Logs</h2>
              <p className="text-[14px] text-[#414844]">
                Maintain spraying histories to prevent repeated dosages and ensure safety intervals.
              </p>
            </div>
            <button
              onClick={() => setShowAddFertModal(true)}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#012d1d] text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#1b4332] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Record Input Use</span>
            </button>
          </div>

          {fertilizerRecords.length === 0 ? (
            <div className="text-center py-12 bg-[#f0f3ff] rounded-2xl p-6">
              <p className="text-[16px] font-bold text-[#012d1d]">No input records yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fertilizerRecords.map(fert => (
                <div key={fert.id} className="p-4 rounded-2xl bg-[#f0f3ff] border border-[#d8e3fb] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[12px] text-[#414844] mb-2">
                      <span className="font-bold text-[#012d1d]">{fert.date}</span>
                      <span className="px-2 py-0.5 rounded bg-[#c1ecd4] text-[#274e3d] font-bold">
                        {fert.plotName}
                      </span>
                    </div>
                    <h4 className="font-bold text-[16px] text-[#012d1d] mb-1">{fert.productName}</h4>
                    <p className="text-[14px] text-[#414844]">
                      Dosage: <strong>{fert.quantity} {fert.unit}</strong>
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#d8e3fb]/60 flex justify-end">
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          type: 'fert',
                          id: fert.id,
                          title: `Delete input log for ${fert.productName}?`
                        })
                      }
                      className="text-[#ba1a1a] font-bold text-[12px] hover:underline cursor-pointer"
                    >
                      Delete Log
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. REMINDERS */}
      {activeTab === 'reminders' && (
        <div className="bg-white rounded-3xl p-6 border border-[#e7eeff] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#f0f3ff]">
            <div>
              <h2 className="text-[22px] font-bold text-[#012d1d]">Farm Reminders & Alerts</h2>
              <p className="text-[14px] text-[#414844]">
                Set automated reminders for spraying, weeding, fertilizer top-ups, and mandi visits.
              </p>
            </div>
            <button
              onClick={() => setShowAddReminderModal(true)}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#012d1d] text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#1b4332] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_alert</span>
              <span>Set Reminder</span>
            </button>
          </div>

          <div className="space-y-3">
            {reminders.map(rem => (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  rem.isDone
                    ? 'bg-[#f0f3ff]/50 border-gray-200 text-gray-500'
                    : rem.date === new Date().toISOString().split('T')[0]
                    ? 'bg-[#ffdcc3]/40 border-[#f48c24]'
                    : 'bg-white border-[#e7eeff]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rem.isDone}
                    onChange={() => toggleReminderDone(rem.id)}
                    className="w-5 h-5 text-[#116c4a] rounded focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <p className={`font-semibold text-[15px] ${rem.isDone ? 'line-through text-gray-400' : 'text-[#012d1d]'}`}>
                      {rem.description}
                    </p>
                    <p className="text-[12px] text-[#414844]">
                      Scheduled: {rem.date} at {rem.time}
                      {rem.date === new Date().toISOString().split('T')[0] && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-[#f48c24] text-white font-bold text-[10px]">
                          TODAY
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setDeleteConfirm({
                      type: 'reminder',
                      id: rem.id,
                      title: `Delete reminder "${rem.description}"?`
                    })
                  }
                  className="text-[#ba1a1a] hover:bg-[#ffdad6]/40 p-2 rounded-lg cursor-pointer"
                  title="Delete reminder"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 border border-[#e7eeff] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#f0f3ff]">
            <div>
              <h2 className="text-[22px] font-bold text-[#012d1d]">Farm Expense & Wage Reports</h2>
              <p className="text-[14px] text-[#414844]">
                Generate date-wise, crop-wise, and worker-wise audited summaries.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#116c4a] text-white font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#116c4a]/90 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">print</span>
              <span>Print Friendly A4</span>
            </button>
          </div>

          {/* Report Type Selector Pills */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setReportType('date')}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold cursor-pointer ${
                reportType === 'date' ? 'bg-[#012d1d] text-white' : 'bg-[#f0f3ff] text-[#414844]'
              }`}
            >
              1. Date-wise Expense Report
            </button>
            <button
              onClick={() => setReportType('crop')}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold cursor-pointer ${
                reportType === 'crop' ? 'bg-[#012d1d] text-white' : 'bg-[#f0f3ff] text-[#414844]'
              }`}
            >
              2. Crop-wise Expense Report
            </button>
            <button
              onClick={() => setReportType('worker')}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold cursor-pointer ${
                reportType === 'worker' ? 'bg-[#012d1d] text-white' : 'bg-[#f0f3ff] text-[#414844]'
              }`}
            >
              3. Worker-wise Wage Report
            </button>
          </div>

          {/* Sub-Filters */}
          {reportType === 'date' && (
            <div className="bg-[#f0f3ff] p-4 rounded-2xl mb-6 flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#012d1d] mb-1">From Date:</label>
                <input
                  type="date"
                  value={reportFromDate}
                  onChange={e => setReportFromDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#d8e3fb] text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#012d1d] mb-1">To Date:</label>
                <input
                  type="date"
                  value={reportToDate}
                  onChange={e => setReportToDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#d8e3fb] text-[14px]"
                />
              </div>
            </div>
          )}

          {reportType === 'crop' && (
            <div className="bg-[#f0f3ff] p-4 rounded-2xl mb-6">
              <label className="block text-[12px] font-bold text-[#012d1d] mb-1">Select Crop:</label>
              <select
                value={reportSelectedCrop}
                onChange={e => setReportSelectedCrop(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#d8e3fb] text-[14px] font-semibold w-full sm:w-80"
              >
                {crops.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* REPORT RESULTS TABLE */}
          <div className="border border-[#d8e3fb] rounded-2xl overflow-hidden">
            <div className="bg-[#f0f3ff] p-4 border-b border-[#d8e3fb] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[16px] text-[#012d1d]">
                  {reportType === 'date' && `Date-wise Ledger (${reportFromDate} to ${reportToDate})`}
                  {reportType === 'crop' && `Crop Expense Ledger: ${crops.find(c => c.id === reportSelectedCrop)?.name || 'Selected Crop'}`}
                  {reportType === 'worker' && `Worker Payout Audit (${workers.length} Workers)`}
                </h3>
                <span className="text-[12px] text-[#414844]">Tenant: {currentFarmer?.tenantId} • Generated on {todayFormatted}</span>
              </div>
            </div>

            {reportType === 'date' && (
              <table className="w-full text-left">
                <thead className="bg-[#dee8ff]/50 text-[12px] uppercase text-[#414844]">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Crop</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Details</th>
                    <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7eeff] text-[14px]">
                  {expenses.map(e => (
                    <tr key={e.id}>
                      <td className="py-2.5 px-4">{e.date}</td>
                      <td className="py-2.5 px-4 font-bold">{e.cropName}</td>
                      <td className="py-2.5 px-4">{e.category}</td>
                      <td className="py-2.5 px-4">{e.details}</td>
                      <td className="py-2.5 px-4 text-right font-numeric-table font-bold">₹{e.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#f0f3ff] font-bold text-[#012d1d]">
                    <td colSpan={4} className="py-3 px-4 text-right">Period Total:</td>
                    <td className="py-3 px-4 text-right font-numeric-table text-[16px]">₹{totalExpenseSum.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            )}

            {reportType === 'crop' && (
              <table className="w-full text-left">
                <thead className="bg-[#dee8ff]/50 text-[12px] uppercase text-[#414844]">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Details</th>
                    <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7eeff] text-[14px]">
                  {expenses
                    .filter(e => e.cropId === reportSelectedCrop)
                    .map(e => (
                      <tr key={e.id}>
                        <td className="py-2.5 px-4">{e.date}</td>
                        <td className="py-2.5 px-4 font-bold">{e.category}</td>
                        <td className="py-2.5 px-4">{e.details}</td>
                        <td className="py-2.5 px-4 text-right font-numeric-table font-bold">₹{e.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  <tr className="bg-[#f0f3ff] font-bold text-[#012d1d]">
                    <td colSpan={3} className="py-3 px-4 text-right">Total for this Crop:</td>
                    <td className="py-3 px-4 text-right font-numeric-table text-[16px]">
                      ₹
                      {expenses
                        .filter(e => e.cropId === reportSelectedCrop)
                        .reduce((s, e) => s + e.amount, 0)
                        .toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {reportType === 'worker' && (
              <table className="w-full text-left">
                <thead className="bg-[#dee8ff]/50 text-[12px] uppercase text-[#414844]">
                  <tr>
                    <th className="py-2.5 px-4">Worker Name</th>
                    <th className="py-2.5 px-4">Contact</th>
                    <th className="py-2.5 px-4">Days Worked</th>
                    <th className="py-2.5 px-4">Daily Wage Rate</th>
                    <th className="py-2.5 px-4 text-right">Total Payable (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7eeff] text-[14px]">
                  {workers.map(w => (
                    <tr key={w.id}>
                      <td className="py-2.5 px-4 font-bold text-[#012d1d]">{w.name}</td>
                      <td className="py-2.5 px-4">{w.contact}</td>
                      <td className="py-2.5 px-4">{w.daysWorked} days</td>
                      <td className="py-2.5 px-4">₹{w.dailyWage} / day</td>
                      <td className="py-2.5 px-4 text-right font-numeric-table font-bold text-[#116c4a]">
                        ₹{w.paymentAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#f0f3ff] font-bold text-[#012d1d]">
                    <td colSpan={4} className="py-3 px-4 text-right">Grand Total Worker Wages:</td>
                    <td className="py-3 px-4 text-right font-numeric-table text-[16px] text-[#116c4a]">
                      ₹{totalWorkerWages.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 9. HELP GUIDE */}
      {activeTab === 'help' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7eeff] shadow-xs space-y-6">
          <div>
            <h2 className="text-[24px] font-bold text-[#012d1d]">Farmer User Guide (Kisan Sahayata)</h2>
            <p className="text-[14px] text-[#414844]">
              Clear, step-by-step guidance designed for quick daily bookkeeping on mobile devices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#f0f3ff] border border-[#d8e3fb]">
              <div className="w-10 h-10 rounded-xl bg-[#c1ecd4] text-[#274e3d] flex items-center justify-center font-bold text-[18px] mb-3">
                1
              </div>
              <h3 className="font-bold text-[16px] text-[#012d1d] mb-1">How to Add Crops</h3>
              <ol className="list-decimal list-inside space-y-1 text-[13px] text-[#414844]">
                <li>Tap <strong>Crops</strong> tab at top.</li>
                <li>Tap <strong>Add New Crop</strong>.</li>
                <li>Enter crop name (e.g. Bhagwa Pomegranate), category, and plantation date.</li>
                <li>Tap <strong>Save Crop</strong>. You can now link all diesel and seed expenses directly to this crop.</li>
              </ol>
            </div>

            <div className="p-5 rounded-2xl bg-[#f0f3ff] border border-[#d8e3fb]">
              <div className="w-10 h-10 rounded-xl bg-[#ffdcc3] text-[#6e3900] flex items-center justify-center font-bold text-[18px] mb-3">
                2
              </div>
              <h3 className="font-bold text-[16px] text-[#012d1d] mb-1">How to Log Daily Expenses</h3>
              <ol className="list-decimal list-inside space-y-1 text-[13px] text-[#414844]">
                <li>Tap <strong>Expenses</strong> tab.</li>
                <li>Tap <strong>Add Expense</strong>.</li>
                <li>Choose the crop, date of expense, and category (Diesel, Fertilizer, Labor, etc.).</li>
                <li>Enter amount in ₹. Double-tap protection ensures duplicate receipts are not created.</li>
              </ol>
            </div>

            <div className="p-5 rounded-2xl bg-[#f0f3ff] border border-[#d8e3fb]">
              <div className="w-10 h-10 rounded-xl bg-[#a1f4c8] text-[#1b724f] flex items-center justify-center font-bold text-[18px] mb-3">
                3
              </div>
              <h3 className="font-bold text-[16px] text-[#012d1d] mb-1">How to Track Worker Rozi-Roti</h3>
              <ol className="list-decimal list-inside space-y-1 text-[13px] text-[#414844]">
                <li>Tap <strong>Workers</strong> tab.</li>
                <li>Add worker name and daily rate (e.g. ₹500/day).</li>
                <li>When days worked increase (e.g. 14 days), the app calculates total owed automatically: ₹7,000.</li>
                <li>Add optional UPI ID for direct PhonePe or GPay transfer.</li>
              </ol>
            </div>

            <div className="p-5 rounded-2xl bg-[#f0f3ff] border border-[#d8e3fb]">
              <div className="w-10 h-10 rounded-xl bg-[#dee8ff] text-[#012d1d] flex items-center justify-center font-bold text-[18px] mb-3">
                4
              </div>
              <h3 className="font-bold text-[16px] text-[#012d1d] mb-1">How to Print Audit & Bank Reports</h3>
              <ol className="list-decimal list-inside space-y-1 text-[13px] text-[#414844]">
                <li>Tap <strong>Reports</strong> tab.</li>
                <li>Choose between Date-wise, Crop-wise, or Worker-wise reports.</li>
                <li>Review season cost aggregations in clear ₹ INR format.</li>
                <li>Tap <strong>Print Friendly A4</strong> to generate certified documentation for Kisan Credit Cards (KCC) and bank subsidies.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* 1. Add/Edit Crop Modal */}
      {showAddCropModal && (
        <CropModal
          crop={editingCrop}
          onClose={() => setShowAddCropModal(false)}
          onSave={async (data) => {
            if (editingCrop) {
              await updateCrop(editingCrop.id, data);
            } else {
              const res = await addCrop(data);
              if (!res.success) {
                showToast(res.error || 'Failed to add crop', 'error');
                return;
              }
            }
            setShowAddCropModal(false);
          }}
        />
      )}

      {/* 2. Add/Edit Expense Modal */}
      {showAddExpenseModal && (
        <ExpenseModal
          crops={crops}
          expense={editingExpense}
          onClose={() => setShowAddExpenseModal(false)}
          onSave={async (data) => {
            if (editingExpense) {
              await updateExpense(editingExpense.id, data);
            } else {
              const res = await addExpense(data);
              if (!res.success) {
                showToast(res.error || 'Failed to add expense', 'error');
                return;
              }
            }
            setShowAddExpenseModal(false);
          }}
        />
      )}

      {/* 3. Add/Edit Worker Modal */}
      {showAddWorkerModal && (
        <WorkerModal
          worker={editingWorker}
          onClose={() => setShowAddWorkerModal(false)}
          onSave={(data) => {
            if (editingWorker) {
              updateWorker(editingWorker.id, data);
            } else {
              addWorker(data);
            }
            setShowAddWorkerModal(false);
          }}
        />
      )}


      {/* 5. Add Fertilizer Modal */}
      {showAddFertModal && (
        <FertilizerModal
          onClose={() => setShowAddFertModal(false)}
          onSave={(data) => {
            addFertilizerRecord(data);
            setShowAddFertModal(false);
          }}
        />
      )}

      {/* 6. Add Reminder Modal */}
      {showAddReminderModal && (
        <ReminderModal
          onClose={() => setShowAddReminderModal(false)}
          onSave={async (data) => {
            const res = await addReminder(data);
            if (!res.success) {
              showToast(res.error || 'Failed to add reminder', 'error');
              return;
            }
            setShowAddReminderModal(false);
          }}
        />
      )}

      {/* 7. Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#d8e3fb]">
            <h3 className="font-bold text-[18px] text-[#ba1a1a] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              Confirm Deletion
            </h3>
            <p className="text-[14px] text-[#414844] mb-6">{deleteConfirm.title}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-[#f0f3ff] text-[#414844] font-semibold text-[13px] hover:bg-[#e7eeff] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-5 py-2 rounded-xl bg-[#ba1a1a] text-white font-bold text-[13px] hover:bg-[#93000a] transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-MODAL COMPONENTS ---

interface CropModalProps {
  crop: Crop | null;
  onClose: () => void;
  onSave: (data: Omit<Crop, 'id' | 'farmerId' | 'createdAt'>) => void;
}

const CropModal: React.FC<CropModalProps> = ({ crop, onClose, onSave }) => {
  const [name, setName] = useState(crop?.name || '');
  const [category, setCategory] = useState(crop?.category || 'Fruit');
  const [plantationDate, setPlantationDate] = useState(crop?.plantationDate || '15-06-2025');
  const [durationDays, setDurationDays] = useState(crop?.durationDays ? String(crop.durationDays) : '180');
  const [description, setDescription] = useState(crop?.description || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Crop name is required');
      return;
    }
    const days = parseInt(durationDays);
    if (isNaN(days) || days < 1 || days > 999) {
      setError('Duration must be between 1 and 999 days');
      return;
    }

    onSave({
      name: name.trim(),
      category,
      plantationDate,
      durationDays: days,
      description: description.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#d8e3fb]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f0f3ff]">
          <h3 className="font-bold text-[20px] text-[#012d1d]">
            {crop ? 'Edit Crop' : 'Add New Crop'}
          </h3>
          <button onClick={onClose} className="text-[#717973] hover:text-[#012d1d]">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {error && <div className="p-3 mb-4 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-[13px] font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Crop Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Bhagwa Pomegranate, Ratnagiri Alphonso"
              className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[15px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
              >
                <option value="Fruit">Fruit</option>
                <option value="Grain">Grain & Wheat</option>
                <option value="Spices">Spices & Herbs</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Cash Crop">Cash Crop (Sugarcane/Cotton)</option>
                <option value="Pulses">Pulses & Dal</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Duration (Days) *</label>
              <input
                type="number"
                min="1"
                max="999"
                value={durationDays}
                onChange={e => setDurationDays(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Plantation Date (DD-MM-YYYY) *</label>
            <input
              type="text"
              value={plantationDate}
              onChange={e => setPlantationDate(e.target.value)}
              placeholder="DD-MM-YYYY"
              className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[15px]"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Description / Plot Details</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. 5 acres North plot with fertile black soil"
              className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0f3ff]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#f0f3ff] text-[#414844] font-semibold text-[14px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#012d1d] text-white font-bold text-[14px] hover:bg-[#1b4332]"
            >
              Save Crop
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ExpenseModalProps {
  crops: Crop[];
  expense: Expense | null;
  onClose: () => void;
  onSave: (data: Omit<Expense, 'id' | 'farmerId' | 'createdAt'>) => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ crops, expense, onClose, onSave }) => {
  const [cropId, setCropId] = useState(expense?.cropId || crops[0]?.id || '');
  const [details, setDetails] = useState(expense?.details || '');
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category || 'Fertilizers');
  const [amount, setAmount] = useState(expense?.amount ? String(expense.amount) : '');
  const [quantity, setQuantity] = useState(expense?.quantity || '');
  const [date, setDate] = useState(expense?.date || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'));
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;

    if (!details.trim()) {
      setError('Please enter expense details');
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || val > 9999999) {
      setError('Amount must be between ₹1 and ₹99,99,999');
      return;
    }

    const matchedCrop = crops.find(c => c.id === cropId);
    if (!matchedCrop) {
      setError('Please select a valid crop');
      return;
    }

    // FR-EXP-05: Double-submit prevention
    setIsBusy(true);
    onSave({
      cropId,
      cropName: matchedCrop.name,
      details: details.trim(),
      category,
      amount: val,
      quantity: quantity.trim() || undefined,
      date
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#d8e3fb]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f0f3ff]">
          <h3 className="font-bold text-[20px] text-[#012d1d]">
            {expense ? 'Edit Expense' : 'Add Crop Expense'}
          </h3>
          <button onClick={onClose} className="text-[#717973] hover:text-[#012d1d]">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {error && <div className="p-3 mb-4 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-[13px] font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Select Crop *</label>
              <select
                value={cropId}
                onChange={e => setCropId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
                required
              >
                {crops.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
              >
                <option value="Seeds">Seeds (बीज)</option>
                <option value="Fertilizers">Fertilizers (उर्वरक / खाद)</option>
                <option value="Pesticides & Sprays">Pesticides & Sprays (कीटनाशक)</option>
                <option value="Labour">Labour (मजदूरी)</option>
                <option value="Crop Cutting / Harvesting">Crop Cutting / Harvesting (कटाई)</option>
                <option value="Tractor & Diesel">Tractor & Diesel (ट्रैक्टर / डीजल)</option>
                <option value="Transport">Transport (मंडी भाड़ा)</option>
                <option value="Other">Other (अन्य)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Amount (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#414844] font-bold">₹</span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max="9999999"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 4500"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#d8e3fb] text-[15px] font-numeric-table font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Date (DD-MM-YYYY) *</label>
              <input
                type="text"
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="DD-MM-YYYY"
                className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[15px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Quantity / Metric (Optional)</label>
            <input
              type="text"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="e.g. 2 bags, 45 Litres, 3 workers"
              className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Expense Details / Description *</label>
            <input
              type="text"
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="e.g. 45L Diesel from HP Pump for rotary tiller"
              className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[15px]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0f3ff]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#f0f3ff] text-[#414844] font-semibold text-[14px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="px-6 py-2.5 rounded-xl bg-[#012d1d] text-white font-bold text-[14px] hover:bg-[#1b4332] disabled:opacity-50 cursor-pointer"
            >
              {isBusy ? 'Saving...' : expense ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface WorkerModalProps {
  worker: Worker | null;
  onClose: () => void;
  onSave: (data: Omit<Worker, 'id' | 'farmerId' | 'paymentAmount' | 'createdAt'>) => void;
}

const WorkerModal: React.FC<WorkerModalProps> = ({ worker, onClose, onSave }) => {
  const [name, setName] = useState(worker?.name || '');
  const [contact, setContact] = useState(worker?.contact || '');
  const [daysWorked, setDaysWorked] = useState(worker?.daysWorked ? String(worker.daysWorked) : '1');
  const [dailyWage, setDailyWage] = useState(worker?.dailyWage ? String(worker.dailyWage) : '450');
  const [address, setAddress] = useState(worker?.address || '');
  const [upiId, setUpiId] = useState(worker?.upiId || '');
  const [error, setError] = useState('');

  const calcAmount = (parseInt(daysWorked) || 0) * (parseFloat(dailyWage) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Worker name is required');
      return;
    }
    if (contact.trim().length !== 10) {
      setError('Contact number must be exactly 10 digits');
      return;
    }
    const days = parseInt(daysWorked);
    if (isNaN(days) || days < 0 || days > 366) {
      setError('Days worked must be between 0 and 366');
      return;
    }
    const wage = parseFloat(dailyWage);
    if (isNaN(wage) || wage <= 0) {
      setError('Daily wage must be greater than 0');
      return;
    }

    onSave({
      name: name.trim(),
      contact: contact.trim(),
      daysWorked: days,
      dailyWage: wage,
      address: address.trim() || undefined,
      upiId: upiId.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#d8e3fb]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f0f3ff]">
          <h3 className="font-bold text-[20px] text-[#012d1d]">
            {worker ? 'Update Worker Details' : 'Add Farm Worker'}
          </h3>
          <button onClick={onClose} className="text-[#717973] hover:text-[#012d1d]">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {error && <div className="p-3 mb-4 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-[13px] font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Worker Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Baburao Shinde"
                className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[15px]"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Mobile (10 Digits) *</label>
              <input
                type="tel"
                maxLength={10}
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="9823012345"
                className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[15px]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Days Worked (0-366) *</label>
              <input
                type="number"
                min="0"
                max="366"
                value={daysWorked}
                onChange={e => setDaysWorked(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[15px] font-numeric-table"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Daily Wage Rate (₹) *</label>
              <input
                type="number"
                min="1"
                value={dailyWage}
                onChange={e => setDailyWage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[15px] font-numeric-table"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-[#a1f4c8]/40 rounded-xl flex items-center justify-between text-[#002113]">
            <span className="text-[13px] font-semibold">Calculated Total Payment:</span>
            <span className="text-[18px] font-bold font-numeric-table">₹{calcAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Worker UPI ID (Optional)</label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="name@upi"
                className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Village / Address (Optional)</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. Sinnar, Nashik"
                className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0f3ff]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#f0f3ff] text-[#414844] font-semibold text-[14px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#012d1d] text-white font-bold text-[14px] hover:bg-[#1b4332]"
            >
              Save Worker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const FertilizerModal: React.FC<{ onClose: () => void; onSave: (data: Omit<FertilizerRecord, 'id' | 'farmerId' | 'createdAt'>) => void }> = ({ onClose, onSave }) => {
  const [plotName, setPlotName] = useState('Plot-1');
  const [productName, setProductName] = useState('Neem Botanical Extract 10000 PPM');
  const [quantity, setQuantity] = useState('500');
  const [unit, setUnit] = useState<'ml' | 'kg'>('ml');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB').replace(/\//g, '-'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      plotName,
      productName,
      quantity: parseFloat(quantity) || 1,
      unit,
      date
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#d8e3fb]">
        <h3 className="font-bold text-[20px] text-[#012d1d] mb-4">Record Fertilizer or Pesticide Spray</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Product Name *</label>
            <input
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="e.g. Bio-NPK, Neem Oil, Zinc Spray"
              className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
              required
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Plot Name / Target Crop *</label>
            <input
              type="text"
              value={plotName}
              onChange={e => setPlotName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Quantity *</label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Unit *</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as 'ml' | 'kg')}
                className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
              >
                <option value="ml">ml (Liquid)</option>
                <option value="kg">kg (Solid)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Date (DD-MM-YYYY) *</label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#f0f3ff] text-[14px]">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-[#012d1d] text-white font-bold text-[14px]">
              Save Input Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReminderModal: React.FC<{ onClose: () => void; onSave: (data: Omit<Reminder, 'id' | 'farmerId' | 'isDone' | 'createdAt'>) => void }> = ({ onClose, onSave }) => {
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSave({
      description: description.trim().substring(0, 100),
      date,
      time
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#d8e3fb]">
        <h3 className="font-bold text-[20px] text-[#012d1d] mb-4">Set Farm Reminder</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Task Description (Max 100 chars) *</label>
            <input
              type="text"
              maxLength={100}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Spray micronutrients, apply top-dress urea"
              className="w-full px-4 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#012d1d] mb-1">Time *</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#d8e3fb] text-[14px]"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#f0f3ff] text-[14px]">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-[#012d1d] text-white font-bold text-[14px]">
              Schedule Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
