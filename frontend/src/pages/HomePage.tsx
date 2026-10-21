import React from 'react';
import { FarmerDashboard } from './farmer/FarmerDashboard';

export const HomePage: React.FC<{
  onOpenAuthModal?: (isRegister?: boolean) => void;
}> = () => {
  return <FarmerDashboard />;
};
