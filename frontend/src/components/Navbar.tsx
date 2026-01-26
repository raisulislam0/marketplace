'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'buyer':
        return 'bg-blue-100 text-blue-800';
      case 'problem_solver':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'buyer':
        return 'Buyer';
      case 'problem_solver':
        return 'Problem Solver';
      default:
        return role;
    }
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">Marketplace</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-gray-600" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user?.role || '')}`}>
                  {getRoleLabel(user?.role || '')}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}

