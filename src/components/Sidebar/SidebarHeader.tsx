
import React from 'react';
import { Logo } from '@/components/ui/logo';

const SidebarHeader: React.FC = () => {
  return (
    <div className="p-3 border-b flex items-center justify-between">
      <Logo size="sm" />
    </div>
  );
};

export default SidebarHeader;
