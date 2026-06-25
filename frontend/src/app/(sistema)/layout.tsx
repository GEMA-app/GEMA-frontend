import React from 'react';
// Ruta relativa segura que sube dos niveles desde app/(sistema) hasta src/
import Sidebar from '../../components/layout/Sidebar';

export default function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
