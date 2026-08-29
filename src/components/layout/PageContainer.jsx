import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function PageContainer({ children, title }) {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-300">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
