'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import BuyerDashboard from '@/components/dashboards/BuyerDashboard';
import ProblemSolverDashboard from '@/components/dashboards/ProblemSolverDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'buyer':
        return <BuyerDashboard />;
      case 'problem_solver':
        return <ProblemSolverDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderDashboard()}
        </main>
      </div>
    </ProtectedRoute>
  );
}

