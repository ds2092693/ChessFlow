import React from 'react';
import Sidebar from '@/components/sidebar';
import { MobileSidebar } from '@/components/mobile-sidebar';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bgMain text-textMain">
      <MobileSidebar />
      <Sidebar />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {children}
      </main>
    </div>
  );
};
