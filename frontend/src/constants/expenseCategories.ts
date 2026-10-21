import { ExpenseCategory } from '../types';

export interface ExpenseCategoryMeta {
  category: ExpenseCategory;
  hindiName?: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  quickAmounts: number[];
}

export const EXPENSE_CATEGORIES_CONFIG: ExpenseCategoryMeta[] = [
  {
    category: 'Seeds',
    hindiName: 'बीज खरीद',
    icon: 'spa',
    badgeBg: 'bg-[#dcfce7]',
    badgeText: 'text-[#166534]',
    quickAmounts: [1000, 2500, 5000, 8500]
  },
  {
    category: 'Fertilizers',
    hindiName: 'उर्वरक / खाद',
    icon: 'science',
    badgeBg: 'bg-[#fef9c3]',
    badgeText: 'text-[#854d0e]',
    quickAmounts: [1350, 2700, 5400, 9000]
  },
  {
    category: 'Pesticides & Sprays',
    hindiName: 'कीटनाशक व स्प्रे',
    icon: 'pest_control',
    badgeBg: 'bg-[#fee2e2]',
    badgeText: 'text-[#b91c1c]',
    quickAmounts: [800, 1600, 3200, 5500]
  },
  {
    category: 'Labour',
    hindiName: 'मजदूरी हिसाब',
    icon: 'groups',
    badgeBg: 'bg-[#fef3c7]',
    badgeText: 'text-[#b45309]',
    quickAmounts: [1000, 2500, 5000, 8000]
  },
  {
    category: 'Crop Cutting / Harvesting',
    hindiName: 'कटाई व थ्रेशिंग',
    icon: 'content_cut',
    badgeBg: 'bg-[#f3e8ff]',
    badgeText: 'text-[#7e22ce]',
    quickAmounts: [2000, 4500, 8000, 14000]
  },
  {
    category: 'Tractor & Diesel',
    hindiName: 'ट्रैक्टर व ईंधन',
    icon: 'local_gas_station',
    badgeBg: 'bg-[#ffedd5]',
    badgeText: 'text-[#c2410c]',
    quickAmounts: [1500, 3000, 4500, 6000]
  },
  {
    category: 'Transport',
    hindiName: 'मंडी भाड़ा व परिवहन',
    icon: 'local_shipping',
    badgeBg: 'bg-[#e0e7ff]',
    badgeText: 'text-[#4338ca]',
    quickAmounts: [800, 1500, 3000, 5000]
  },
  {
    category: 'Other',
    hindiName: 'अन्य खर्चा',
    icon: 'more_horiz',
    badgeBg: 'bg-[#f3f4f6]',
    badgeText: 'text-[#374151]',
    quickAmounts: [500, 1000, 2000, 3500]
  }
];
